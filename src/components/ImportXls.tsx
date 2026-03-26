import { useState, useRef } from 'react';
import type { Transaction } from '../types';
import { parseXlsBuffer, parseXlsFile } from '../utils/xlsParser';
import { SOURCES } from '../utils/constants';
import { FileSpreadsheet, Upload, AlertCircle, CheckCircle2, Landmark } from 'lucide-react';

interface Props {
  onImport: (transactions: Transaction[]) => void;
}

export default function ImportXls({ onImport }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; error?: string } | null>(null);
  const [source, setSource] = useState('BROU');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applySource(transactions: Transaction[]): Transaction[] {
    return transactions.map((t) => ({ ...t, source }));
  }

  async function handleElectronImport() {
    if (!window.electronAPI) return;
    setLoading(true);
    setResult(null);
    try {
      const file = await window.electronAPI.openXlsFile();
      if (!file) { setLoading(false); return; }
      const transactions = applySource(parseXlsBuffer(file.buffer));
      if (transactions.length === 0) {
        setResult({ count: 0, error: 'No se encontraron transacciones en el archivo.' });
      } else {
        onImport(transactions);
        setResult({ count: transactions.length });
      }
    } catch {
      setResult({ count: 0, error: 'Error al procesar el archivo. Verifica el formato.' });
    }
    setLoading(false);
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const transactions = applySource(await parseXlsFile(file));
      if (transactions.length === 0) {
        setResult({ count: 0, error: 'No se encontraron transacciones en el archivo.' });
      } else {
        onImport(transactions);
        setResult({ count: transactions.length });
      }
    } catch {
      setResult({ count: 0, error: 'Error al procesar el archivo. Verifica el formato.' });
    }
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const isElectron = !!window.electronAPI;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
          <FileSpreadsheet size={24} className="text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Importar reporte bancario</h2>
          <p className="text-sm text-gray-400">Sube un archivo XLS, XLSX o CSV de tu banco</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Landmark size={16} className="text-indigo-500" />
          Banco de origen
        </label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors">
        <Upload size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 mb-4">
          El sistema detectara automaticamente las columnas de fecha, descripcion, montos, cargos y abonos
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isElectron && (
            <button
              onClick={handleElectronImport}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />
              {loading ? 'Procesando...' : 'Abrir archivo'}
            </button>
          )}

          <label className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Upload size={16} />
            {loading ? 'Procesando...' : isElectron ? 'O arrastra aqui' : 'Seleccionar archivo'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={handleFileInput}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      </div>

      {result && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${result.error ? 'bg-red-50' : 'bg-emerald-50'}`}>
          {result.error ? (
            <AlertCircle size={20} className="text-red-500 shrink-0" />
          ) : (
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          )}
          <p className={`text-sm ${result.error ? 'text-red-700' : 'text-emerald-700'}`}>
            {result.error || `Se importaron ${result.count} transacciones de ${source} como pendientes.`}
          </p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Formatos compatibles</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>- Columnas de fecha: "Fecha", "Date", "F. Operacion"</li>
          <li>- Columnas de descripcion: "Descripcion", "Concepto", "Detalle"</li>
          <li>- Columnas de monto: "Monto", "Importe", "Cargo/Abono", "Debito/Credito"</li>
          <li>- Se auto-categoriza cada transaccion segun la descripcion</li>
          <li>- Todas las transacciones importadas quedan como <strong>pendientes</strong></li>
        </ul>
      </div>
    </div>
  );
}
