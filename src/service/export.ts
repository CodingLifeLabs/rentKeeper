import type { Contract } from "@/types/contract";
import type { ExportType } from "@/types/export-log";

function maskPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 8) return phone;
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

interface ExportRow {
  address: string;
  unitNumber: string;
  tenantName: string;
  tenantPhone: string;
  deposit: number;
  monthlyRent: number | null;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
}

function contractToRow(c: Contract, includePhone: boolean, address?: string, unitNumber?: string): ExportRow {
  return {
    address: address ?? "",
    unitNumber: unitNumber ?? "",
    tenantName: c.tenantName,
    tenantPhone: includePhone ? c.tenantPhone : maskPhone(c.tenantPhone),
    deposit: c.deposit,
    monthlyRent: c.monthlyRent,
    startDate: c.startDate,
    endDate: c.endDate,
    status: c.status,
    notes: c.notes,
  };
}

const CSV_HEADERS = [
  "호수", "임차인명", "전화번호", "보증금", "월세",
  "계약시작일", "계약종료일", "상태", "메모",
];

const STATUS_LABELS: Record<string, string> = {
  draft: "등록 중",
  active: "계약 중",
  expiring_90: "D-90 만기",
  expiring_30: "D-30 만기",
  negotiating: "협상 중",
  renewed: "갱신 완료",
  move_out_pending: "퇴실 예정",
  vacant: "공실",
  archived: "종료",
};

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCsv(
  contracts: Contract[],
  includePhone: boolean,
): string {
  const BOM = "﻿";
  const header = CSV_HEADERS.map(escapeCsv).join(",");

  const rows = contracts.map((c) => {
    const row = contractToRow(c, includePhone);
    return [
      escapeCsv(row.unitNumber),
      escapeCsv(row.tenantName),
      escapeCsv(row.tenantPhone),
      String(row.deposit),
      String(row.monthlyRent ?? ""),
      row.startDate,
      row.endDate,
      STATUS_LABELS[row.status] ?? row.status,
      escapeCsv(row.notes ?? ""),
    ].join(",");
  });

  return BOM + header + "\n" + rows.join("\n");
}

export async function generateXlsx(
  contracts: Contract[],
  includePhone: boolean,
): Promise<Buffer> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  const allSheet = workbook.addWorksheet("계약현황");
  allSheet.columns = [
    { header: "호수", key: "unitNumber", width: 10 },
    { header: "임차인명", key: "tenantName", width: 12 },
    { header: "전화번호", key: "tenantPhone", width: 16 },
    { header: "보증금", key: "deposit", width: 15 },
    { header: "월세", key: "monthlyRent", width: 12 },
    { header: "계약시작일", key: "startDate", width: 14 },
    { header: "계약종료일", key: "endDate", width: 14 },
    { header: "상태", key: "status", width: 12 },
    { header: "메모", key: "notes", width: 20 },
  ];

  const expiringSheet = workbook.addWorksheet("만기예정");
  expiringSheet.columns = [...allSheet.columns];

  const vacantSheet = workbook.addWorksheet("공실현황");
  vacantSheet.columns = [...allSheet.columns];

  let totalDeposit = 0;
  let totalRent = 0;
  let expiringDeposit = 0;
  let expiringRent = 0;
  let vacantDeposit = 0;

  for (const c of contracts) {
    const row = contractToRow(c, includePhone);
    const statusLabel = STATUS_LABELS[row.status] ?? row.status;
    const values = {
      unitNumber: row.unitNumber,
      tenantName: row.tenantName,
      tenantPhone: row.tenantPhone,
      deposit: row.deposit,
      monthlyRent: row.monthlyRent ?? 0,
      startDate: row.startDate,
      endDate: row.endDate,
      status: statusLabel,
      notes: row.notes ?? "",
    };

    totalDeposit += row.deposit;
    totalRent += row.monthlyRent ?? 0;

    allSheet.addRow(values);

    if (c.status === "expiring_90" || c.status === "expiring_30") {
      expiringSheet.addRow(values);
      expiringDeposit += row.deposit;
      expiringRent += row.monthlyRent ?? 0;
    }

    if (c.status === "vacant") {
      vacantSheet.addRow(values);
      vacantDeposit += row.deposit;
    }
  }

  const numberFmt = "#,##0";
  for (const sheet of [allSheet, expiringSheet, vacantSheet]) {
    for (const col of ["deposit", "monthlyRent"]) {
      const colIdx = col === "deposit" ? 4 : 5;
      for (let i = 2; i <= sheet.rowCount; i++) {
        const cell = sheet.getRow(i).getCell(colIdx);
        cell.numFmt = numberFmt;
      }
    }
  }

  allSheet.addRow([]);
  allSheet.addRow({
    unitNumber: "합계",
    tenantName: "",
    tenantPhone: "",
    deposit: totalDeposit,
    monthlyRent: totalRent,
  });

  expiringSheet.addRow([]);
  expiringSheet.addRow({
    unitNumber: "합계",
    tenantName: "",
    tenantPhone: "",
    deposit: expiringDeposit,
    monthlyRent: expiringRent,
  });

  vacantSheet.addRow([]);
  vacantSheet.addRow({
    unitNumber: "합계",
    tenantName: "",
    tenantPhone: "",
    deposit: vacantDeposit,
  });

  const buffer = workbook.xlsx.writeBuffer();
  return Buffer.from(await buffer);
}

export function getExportFilename(type: ExportType): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = type === "csv" ? "rentkeeper_계약목록" : "rentkeeper_운영현황";
  const ext = type === "csv" ? ".csv" : ".xlsx";
  return `${prefix}_${date}${ext}`;
}
