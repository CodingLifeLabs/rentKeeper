import { createAdminSupabaseClient } from "./supabase-admin";

const DEAD_LETTER_THRESHOLD = 5;
const RETENTION_DAYS = 30;

export async function hasProcessedWebhookEvent(eventId: string): Promise<boolean> {
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();
  return data !== null;
}

export async function markWebhookEventProcessed(
  eventId: string,
  eventType: string,
  payload?: Record<string, unknown>,
): Promise<void> {
  const supabase = createAdminSupabaseClient();
  await supabase
    .from("webhook_events")
    .upsert(
      { event_id: eventId, event_type: eventType, payload: payload ?? null },
      { onConflict: "event_id", ignoreDuplicates: true },
    );
}

export async function markWebhookEventFailed(
  eventId: string,
  eventType: string,
  error: string,
  payload?: Record<string, unknown>,
): Promise<void> {
  const supabase = createAdminSupabaseClient();
  // NOTE: attempt_count is intentionally omitted from the upsert so that the
  // column default (0) is used on insert and the value is never reset on
  // subsequent failures. The increment_webhook_attempt RPC is solely
  // responsible for advancing the counter.
  await supabase
    .from("webhook_events")
    .upsert(
      {
        event_id: eventId,
        event_type: eventType,
        last_error: error,
        payload: payload ?? null,
      },
      {
        onConflict: "event_id",
        ignoreDuplicates: false,
      },
    );
  await supabase.rpc("increment_webhook_attempt", { p_event_id: eventId });
}

export async function markDeadLetterEvents(): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("webhook_events")
    .update({ is_dead_letter: true })
    .gte("attempt_count", DEAD_LETTER_THRESHOLD)
    .eq("is_dead_letter", false)
    .select("event_id");

  if (error) throw new Error(`Failed to mark dead-letter events: ${error.message}`);
  return (data ?? []).length;
}

export async function cleanupOldWebhookEvents(): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const cutoff = new Date(
    Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("webhook_events")
    .delete()
    .lt("processed_at", cutoff)
    .select("event_id");

  if (error) throw new Error(`Failed to cleanup webhook events: ${error.message}`);
  return (data ?? []).length;
}
