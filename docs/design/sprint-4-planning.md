# Sprint 4 Implementation Plan

## Overview
Complete the remaining UI components for the renewal proposal system.

## Components to Add

### 1. Dashboard Contracts List (src/app/(protected)/dashboard/page.tsx)
**Current state:** Only shows stats cards
**Target state:** Shows contract list with "Send Renewal Proposal" button for expiring contracts

**File:** `src/app/(protected)/dashboard/page.tsx`

**Changes:**
- Add contract list loading
- Show contract cards with status badges
- Add "Send Renewal Proposal" button for expiring_30/negotiating contracts
- Add proposal button to stats (count pending proposals)

**Dependencies:**
- `src/repo/contract.ts` - getContractsByLandlord
- `src/repo/renewal-proposal.ts` - getProposalsByContract
- `src/ui/components/proposals/dashboard-contract-card.tsx` (NEW)

### 2. Dashboard Contract Card Component (NEW)
**File:** `src/ui/components/dashboard/dashboard-contract-card.tsx`

**Props:**
```typescript
interface DashboardContractCardProps {
  contract: Contract;
  onSendProposal: (contract: Contract) => void;
  onRefresh: () => void;
}
```

**Features:**
- Show tenant name, rent, expiry date
- Status badge (expiring_90, expiring_30, negotiating)
- Proposal count badge (if proposals exist)
- "Send Renewal Proposal" button (conditional: only for expiring_30/negotiating)
- Loading state during proposal sending

**Dependencies:**
- `lucide-react` - Send icon
- `@/ui/components/ui/card` - Card component
- `@/types/contract` - Contract type

## Implementation Order

1. Create DashboardContractCard component
2. Update dashboard page to load contracts
3. Add renewal proposal button logic
4. Test contract list and proposal flow

## Integration Points

- **State Machine:** Contract status changes from "negotiating" → "renewed" on accept
- **Notifications:** Create communication record on proposal send
- **Auth:** All API calls use authenticated sessions

## Testing Checklist

- [ ] Dashboard shows contracts sorted by expiry
- [ ] Status badges display correctly (expiring_90, expiring_30, negotiating)
- [ ] Proposal button only appears for expiring_30/negotiating contracts
- [ ] Proposal button shows loading state during API call
- [ ] Contract count badge updates with pending proposal count
- [ ] Proposal sends successfully and status changes to "sent"
- [ ] Communication record created

## Risk Assessment

**Low Risk:** UI components only, no backend changes needed

**Mitigation:**
- Ensure proposal button only appears for valid states
- Handle API errors gracefully
- Show loading state during proposal sending
