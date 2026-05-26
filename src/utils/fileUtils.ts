/**
 * Utilitários para manipulação e extração de dados de arquivos
 */

export interface ExtractedFileData {
  dataInicio?: string;
  dataFim?: string;
  cpf?: string;
}

/**
 * Extrai data de início, data de fim e CPF do nome do arquivo.
 * Padrão esperado: ddmmaaaa_ddmmaaaa_00000000000_xxxxxxx.pdf
 */
export function extractDataFromFilename(filename: string): ExtractedFileData {
  const nameWithoutExt = filename.replace(/\.pdf$/i, '');
  const parts = nameWithoutExt.split('_');

  if (parts.length >= 3) {
    const dataInicioRaw = parts[0];
    const dataFimRaw = parts[1];
    const cpf = parts[2];

    return {
      dataInicio: formatRawDateToISO(dataInicioRaw),
      dataFim: formatRawDateToISO(dataFimRaw),
      cpf: cpf.length === 11 ? cpf : undefined
    };
  }
  return {};
}

/**
 * Converte data no formato ddmmaaaa para yyyy-mm-dd (ISO)
 */
export function formatRawDateToISO(rawDate: string): string | undefined {
  if (rawDate.length === 8) {
    const d = rawDate.substring(0, 2);
    const m = rawDate.substring(2, 4);
    const y = rawDate.substring(4, 8);
    return `${y}-${m}-${d}`;
  }
  return undefined;
}

/**
 * Converte data no formato yyyy-mm-dd para dd/mm/yyyy para exibição
 */
export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr || dateStr.length !== 10) return dateStr;
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Formata o tamanho do arquivo de bytes para uma string legível
 */
export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
