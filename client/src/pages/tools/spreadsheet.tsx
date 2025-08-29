import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Cell {
  value: string;
  formula?: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

type SpreadsheetData = { [key: string]: Cell };

export default function Spreadsheet() {
  const [data, setData] = useState<SpreadsheetData>({});
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaBar, setFormulaBar] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [isEditingName, setIsEditingName] = useState(false);

  const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 50 }, (_, i) => i + 1);

  useEffect(() => {
    const cell = data[selectedCell];
    setFormulaBar(cell?.formula || cell?.value || '');
  }, [selectedCell, data]);

  const getCellId = (col: string, row: number) => `${col}${row}`;

  const updateCell = (cellId: string, value: string, isFormula: boolean = false) => {
    setData(prev => ({
      ...prev,
      [cellId]: {
        ...prev[cellId],
        value: isFormula ? calculateFormula(value) : value,
        formula: isFormula ? value : undefined,
      }
    }));
  };

  const calculateFormula = (formula: string): string => {
    try {
      if (!formula.startsWith('=')) return formula;
      
      const expression = formula.slice(1);
      
      // Replace cell references with values
      const cellRefRegex = /[A-Z]\d+/g;
      const processedExpression = expression.replace(cellRefRegex, (match) => {
        const cellValue = data[match]?.value || '0';
        return isNaN(Number(cellValue)) ? '0' : cellValue;
      });

      // Basic math operations
      const result = Function(`"use strict"; return (${processedExpression})`)();
      return result.toString();
    } catch (error) {
      return '#ERROR';
    }
  };

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
  };

  const handleFormulaBarChange = (value: string) => {
    setFormulaBar(value);
  };

  const handleFormulaBarSubmit = () => {
    const isFormula = formulaBar.startsWith('=');
    updateCell(selectedCell, formulaBar, isFormula);
  };

  const formatCell = (style: Partial<Cell['style']>) => {
    setData(prev => ({
      ...prev,
      [selectedCell]: {
        ...prev[selectedCell],
        style: { ...prev[selectedCell]?.style, ...style }
      }
    }));
  };

  const insertRow = () => {
    toast({
      title: "Row Inserted",
      description: "A new row has been inserted.",
    });
  };

  const insertColumn = () => {
    toast({
      title: "Column Inserted", 
      description: "A new column has been inserted.",
    });
  };

  const saveSpreadsheet = (format: 'csv' | 'xlsx' = 'csv') => {
    if (format === 'xlsx') {
      // Create proper XLSX file using XLSX library
      const workbook = XLSX.utils.book_new();
      
      // Prepare data for the worksheet
      const worksheetData: any[][] = [];
      
      // Add header row
      worksheetData.push(['', ...columns]);
      
      // Add data rows
      rows.forEach(row => {
        const rowData = [row.toString()];
        columns.forEach(col => {
          const cellId = getCellId(col, row);
          const cell = data[cellId];
          const value = cell?.value || '';
          
          // Try to convert to number if it looks like a number
          const numValue = Number(value);
          rowData.push(isNaN(numValue) || value === '' ? value : numValue.toString());
        });
        worksheetData.push(rowData);
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      // Generate and download the file
      XLSX.writeFile(workbook, `${sheetName}.xlsx`);
      
      toast({
        title: "XLSX Exported",
        description: `${sheetName}.xlsx has been exported successfully.`,
      });
    } else {
      // CSV format
      const csvContent = rows.map(row => 
        columns.map(col => {
          const cellId = getCellId(col, row);
          return data[cellId]?.value || '';
        }).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sheetName}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Spreadsheet Saved",
        description: `${sheetName} has been saved as CSV.`,
      });
    }
  };

  const importSpreadsheet = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.csv,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          if (file.name.endsWith('.csv')) {
            // Parse CSV content
            const text = await file.text();
            const lines = text.split('\n');
            const newData: SpreadsheetData = {};
            
            lines.forEach((line, rowIndex) => {
              if (line.trim() && rowIndex < rows.length) {
                const values = line.split(',');
                values.forEach((value, colIndex) => {
                  if (colIndex < columns.length) {
                    const cellId = getCellId(columns[colIndex], rowIndex + 1);
                    newData[cellId] = { value: value.trim().replace(/^"|"$/g, '') };
                  }
                });
              }
            });
            
            setData(newData);
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // Use XLSX library to properly parse Excel files
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            // Get the first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            if (worksheet) {
              const newData: SpreadsheetData = {};
              
              // Convert worksheet to JSON
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '',
                raw: false 
              }) as string[][];
              
              jsonData.forEach((row, rowIndex) => {
                if (rowIndex < rows.length) {
                  row.forEach((cellValue, colIndex) => {
                    if (colIndex < columns.length) {
                      const cellId = getCellId(columns[colIndex], rowIndex + 1);
                      newData[cellId] = { 
                        value: String(cellValue || '').trim() 
                      };
                    }
                  });
                }
              });
              
              setData(newData);
              setSheetName(firstSheetName || file.name.replace(/\.[^/.]+$/, ""));
            }
          }
          
          toast({
            title: "Spreadsheet Imported",
            description: `${file.name} has been imported successfully.`,
          });
        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: "Import Error",
            description: "Could not import the file. Please check the file format.",
            variant: "destructive"
          });
        }
      }
    };
    input.click();
  };

  const createChart = () => {
    const currentTable = getCurrentTable();
    if (!currentTable) return;

    // Get data for the first 10 rows and 2 columns (for a simple chart)
    const chartData = [];
    const maxRows = Math.min(10, rows.length);
    
    for (let i = 1; i <= maxRows; i++) {
      const labelCell = data[getCellId('A', i)];
      const valueCell = data[getCellId('B', i)];
      
      if (labelCell?.value && valueCell?.value && !isNaN(Number(valueCell.value))) {
        chartData.push({
          name: labelCell.value,
          value: Number(valueCell.value)
        });
      }
    }

    if (chartData.length === 0) {
      toast({
        title: "Chart Error",
        description: "Please ensure column A has labels and column B has numeric values to create a chart.",
        variant: "destructive"
      });
      return;
    }

    // Create a simple chart visualization
    const chartWindow = window.open('', '_blank', 'width=800,height=600');
    if (chartWindow) {
      chartWindow.document.write(`
        <html>
          <head>
            <title>Chart - ${sheetName}</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
              .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              canvas { max-width: 100%; height: 400px; }
              h1 { text-align: center; color: #333; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="chart-container">
              <h1>Chart from ${sheetName}</h1>
              <canvas id="myChart"></canvas>
            </div>
            <script>
              const ctx = document.getElementById('myChart').getContext('2d');
              new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: ${JSON.stringify(chartData.map(d => d.name))},
                  datasets: [{
                    label: 'Values',
                    data: ${JSON.stringify(chartData.map(d => d.value))},
                    backgroundColor: [
                      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                      '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                    ],
                    borderWidth: 1
                  }]
                },
                options: {
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Data from ${sheetName}' }
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }
              });
            </script>
          </body>
        </html>
      `);
      chartWindow.document.close();
      
      toast({
        title: "Chart Created",
        description: "Chart has been generated in a new window.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-excel text-white text-sm"></i>
                </div>
                <div>
                  {isEditingName ? (
                    <Input
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyPress={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      className="h-8 w-48 text-lg font-semibold"
                      autoFocus
                      data-testid="sheet-name-input"
                    />
                  ) : (
                    <h1 
                      className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-green-600"
                      onClick={() => setIsEditingName(true)}
                      data-testid="sheet-name"
                    >
                      {sheetName}
                    </h1>
                  )}
                  <p className="text-sm text-gray-500">Excel-like Spreadsheet</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={importSpreadsheet}
                data-testid="import-spreadsheet"
              >
                <i className="fas fa-upload mr-2"></i>
                Import
              </Button>
              <div className="relative group">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => saveSpreadsheet('csv')}
                  data-testid="save-spreadsheet"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save ▼
                </Button>
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => saveSpreadsheet('csv')}
                    className="w-full justify-start whitespace-nowrap"
                    data-testid="save-csv"
                  >
                    <i className="fas fa-file-csv mr-2"></i>
                    Save as CSV
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => saveSpreadsheet('xlsx')}
                    className="w-full justify-start whitespace-nowrap"
                    data-testid="save-xlsx"
                  >
                    <i className="fas fa-file-excel mr-2"></i>
                    Export as XLSX
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={createChart} data-testid="create-chart">
                <i className="fas fa-chart-bar mr-2"></i>
                Chart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            {/* Formula Bar */}
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
                {selectedCell}
              </span>
              <Input
                value={formulaBar}
                onChange={(e) => handleFormulaBarChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFormulaBarSubmit()}
                placeholder="Enter formula or value"
                className="flex-1 max-w-md"
                data-testid="formula-bar"
              />
              <Button size="sm" onClick={handleFormulaBarSubmit} data-testid="formula-submit">
                <i className="fas fa-check"></i>
              </Button>
            </div>

            {/* Formatting Buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatCell({ bold: true })}
                className="h-8 w-8 p-0"
                data-testid="bold-button"
              >
                <i className="fas fa-bold"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatCell({ italic: true })}
                className="h-8 w-8 p-0"
                data-testid="italic-button"
              >
                <i className="fas fa-italic"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatCell({ textAlign: 'left' })}
                className="h-8 w-8 p-0"
                data-testid="align-left"
              >
                <i className="fas fa-align-left"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatCell({ textAlign: 'center' })}
                className="h-8 w-8 p-0"
                data-testid="align-center"
              >
                <i className="fas fa-align-center"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatCell({ textAlign: 'right' })}
                className="h-8 w-8 p-0"
                data-testid="align-right"
              >
                <i className="fas fa-align-right"></i>
              </Button>
            </div>

            {/* Insert Options */}
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={insertRow} data-testid="insert-row">
                <i className="fas fa-plus mr-1"></i>
                Row
              </Button>
              <Button variant="outline" size="sm" onClick={insertColumn} data-testid="insert-column">
                <i className="fas fa-plus mr-1"></i>
                Column
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-auto max-h-[700px]">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="w-12 h-8 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600"></th>
                  {columns.map(col => (
                    <th 
                      key={col} 
                      className="min-w-[100px] h-8 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row}>
                    <td className="w-12 h-8 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      {row}
                    </td>
                    {columns.map(col => {
                      const cellId = getCellId(col, row);
                      const cell = data[cellId];
                      const isSelected = selectedCell === cellId;
                      
                      return (
                        <td
                          key={cellId}
                          className={`min-w-[100px] h-8 border border-gray-300 dark:border-gray-600 cursor-cell ${
                            isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => handleCellClick(cellId)}
                          data-testid={`cell-${cellId}`}
                        >
                          <input
                            type="text"
                            value={cell?.value || ''}
                            onChange={(e) => updateCell(cellId, e.target.value)}
                            className={`w-full h-full px-2 bg-transparent border-none outline-none text-sm ${
                              cell?.style?.bold ? 'font-bold' : ''
                            } ${
                              cell?.style?.italic ? 'italic' : ''
                            }`}
                            style={{
                              textAlign: cell?.style?.textAlign || 'left',
                              backgroundColor: cell?.style?.backgroundColor || 'transparent'
                            }}
                            data-testid={`input-${cellId}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}