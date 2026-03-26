import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../types';
import { categorizeDescription } from './categorizer';

// Normalize text: remove accents, lowercase, trim
function norm(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const DATE_CANDIDATES = ['fecha', 'date', 'dia', 'f. operacion', 'f. valor', 'fecha operacion', 'fecha valor'];
const DESC_CANDIDATES = ['descripcion', 'concepto', 'description', 'detalle', 'referencia', 'movimiento'];
const DEBIT_CANDIDATES = ['debito', 'cargo', 'retiro', 'debit', 'egreso'];
const CREDIT_CANDIDATES = ['credito', 'abono', 'deposito', 'ingreso', 'credit', 'haber'];
const AMOUNT_CANDIDATES = ['monto', 'amount', 'importe', 'valor', 'saldo'];

function matchCol(cellValue: string, candidates: string[]): boolean {
  const n = norm(cellValue);
  return candidates.some((c) => n.includes(c));
}

interface ColumnMap {
  dateIdx: number;
  descIdx: number;
  debitIdx: number;
  creditIdx: number;
  amountIdx: number;
}

// Scan rows to find the header row (the one with date + description + debit/credit columns)
function findHeaderRow(rows: unknown[][]): { headerRowIdx: number; colMap: ColumnMap } | null {
  for (let i = 0; i < Math.min(rows.length, 30); i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    let dateIdx = -1;
    let descIdx = -1;
    let debitIdx = -1;
    let creditIdx = -1;
    let amountIdx = -1;

    for (let j = 0; j < row.length; j++) {
      const val = String(row[j] ?? '').trim();
      if (!val) continue;

      if (dateIdx === -1 && matchCol(val, DATE_CANDIDATES)) dateIdx = j;
      else if (descIdx === -1 && matchCol(val, DESC_CANDIDATES)) descIdx = j;
      else if (debitIdx === -1 && matchCol(val, DEBIT_CANDIDATES)) debitIdx = j;
      else if (creditIdx === -1 && matchCol(val, CREDIT_CANDIDATES)) creditIdx = j;
      else if (amountIdx === -1 && matchCol(val, AMOUNT_CANDIDATES)) amountIdx = j;
    }

    // Need at least date + description + (debit/credit or amount)
    if (dateIdx >= 0 && descIdx >= 0 && (debitIdx >= 0 || creditIdx >= 0 || amountIdx >= 0)) {
      return { headerRowIdx: i, colMap: { dateIdx, descIdx, debitIdx, creditIdx, amountIdx } };
    }
  }
  return null;
}

function parseDate(value: unknown): string | null {
  if (!value || String(value).trim() === '') return null;

  if (typeof value === 'number') {
    const d = XLSX.SSF.parse_date_code(value);
    if (d) {
      return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
  }

  const str = String(value).trim();

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dmy) {
    const year = dmy[3].length === 2 ? '20' + dmy[3] : dmy[3];
    return `${year}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }

  // YYYY-MM-DD
  const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`;

  return null;
}

function parseAmount(value: unknown): number {
  if (typeof value === 'number') return Math.abs(value);
  if (!value) return 0;
  const str = String(value).replace(/[,$\s]/g, '').replace(/[()]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.abs(num);
}

function isNegativeAmount(value: unknown): boolean {
  if (typeof value === 'number') return value < 0;
  const str = String(value);
  return str.includes('-') || (str.includes('(') && str.includes(')'));
}

const SKIP_DESCRIPTIONS = ['saldo inicial', 'saldo final', 'saldo anterior', 'saldo disponible', 'saldo cierre', 'total'];

function shouldSkipRow(desc: string): boolean {
  const lower = desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return SKIP_DESCRIPTIONS.some((s) => lower.startsWith(s));
}

function processRows(rows: unknown[][]): Transaction[] {
  const result = findHeaderRow(rows);
  if (!result) return [];

  const { headerRowIdx, colMap } = result;
  const { dateIdx, descIdx, debitIdx, creditIdx, amountIdx } = colMap;
  const transactions: Transaction[] = [];

  // Process data rows after the header
  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;

    // Parse date - skip rows without a valid date (empty rows, subtotals, etc.)
    const date = parseDate(row[dateIdx]);
    if (!date) continue;

    const rawDesc = descIdx >= 0 ? String(row[descIdx] ?? '').trim() : '';
    if (!rawDesc || shouldSkipRow(rawDesc)) continue;

    let amount = 0;
    let inferredType: 'income' | 'expense' = 'expense';

    if (debitIdx >= 0 && creditIdx >= 0) {
      const debit = parseAmount(row[debitIdx]);
      const credit = parseAmount(row[creditIdx]);
      if (credit > 0 && debit === 0) {
        amount = credit;
        inferredType = 'income';
      } else if (debit > 0) {
        amount = debit;
        inferredType = 'expense';
      } else {
        continue;
      }
    } else if (debitIdx >= 0) {
      amount = parseAmount(row[debitIdx]);
      if (amount === 0) continue;
      inferredType = 'expense';
    } else if (creditIdx >= 0) {
      amount = parseAmount(row[creditIdx]);
      if (amount === 0) continue;
      inferredType = 'income';
    } else if (amountIdx >= 0) {
      amount = parseAmount(row[amountIdx]);
      if (amount === 0) continue;
      inferredType = isNegativeAmount(row[amountIdx]) ? 'expense' : 'income';
    } else {
      continue;
    }

    const { category, type: catType } = categorizeDescription(rawDesc);
    const finalType = (debitIdx >= 0 || creditIdx >= 0) ? inferredType : catType;

    transactions.push({
      id: uuidv4(),
      type: finalType,
      amount,
      category,
      description: rawDesc,
      originalDescription: rawDesc,
      date,
      source: '',
      currency: 'UYU',
      paymentMethod: 'cuenta_bancaria',
      status: 'pending',
    });
  }

  return transactions;
}

export function parseXlsBuffer(base64: string): Transaction[] {
  const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  return processRows(rows);
}

export function parseXlsFile(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) { resolve([]); return; }
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        resolve(processRows(rows));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
