import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Object} columnMapping - Mapping of object keys to CSV headers
 */
export const exportToCSV = async (data, filename, columnMapping = null) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  try {
    // Get headers from columnMapping or from first object keys
    const headers = columnMapping 
      ? Object.values(columnMapping)
      : Object.keys(data[0]);

    // Get keys to extract from each object
    const keys = columnMapping 
      ? Object.keys(columnMapping)
      : Object.keys(data[0]);

    // Build CSV content
    let csvContent = headers.join(',') + '\n';

    data.forEach((item) => {
      const row = keys.map((key) => {
        const value = item[key] !== undefined ? item[key] : '';
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvContent += row.join(',') + '\n';
    });

    // Create file
    const fileUri = FileSystem.documentDirectory + `${filename}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: `Exportar ${filename}`,
      });
    } else {
      console.log('Sharing not available');
    }

    return { success: true, uri: fileUri };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

/**
 * Export allocations to CSV
 */
export const exportAllocations = async (allocations) => {
  const columnMapping = {
    id: 'ID',
    machineName: 'Máquina',
    clientName: 'Cliente',
    status: 'Status',
    startDate: 'Data Início',
    endDate: 'Data Fim',
    rentalValue: 'Valor Locação',
    operator: 'Operador',
    observations: 'Observações',
  };

  return exportToCSV(allocations, 'alocacoes', columnMapping);
};

/**
 * Export machines to CSV
 */
export const exportMachines = async (machines) => {
  const columnMapping = {
    id: 'ID',
    name: 'Nome',
    model: 'Modelo',
    status: 'Status',
    operator: 'Operador',
    clientName: 'Cliente',
    categoryName: 'Categoria',
    unitName: 'Unidade',
  };

  return exportToCSV(machines, 'maquinas', columnMapping);
};

/**
 * Export financial data to CSV
 */
export const exportFinancialData = async (revenue, expenses) => {
  const data = [
    ...revenue.map(item => ({ ...item, type: 'Receita' })),
    ...expenses.map(item => ({ ...item, type: 'Despesa' })),
  ];

  const columnMapping = {
    type: 'Tipo',
    date: 'Data',
    description: 'Descrição',
    amount: 'Valor',
    category: 'Categoria',
  };

  return exportToCSV(data, 'financeiro', columnMapping);
};
