import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface Table {
  id: string;
  name: string;
  fields: Field[];
  records: Record[];
}

interface Field {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  required: boolean;
}

interface Record {
  id: string;
  data: { [fieldId: string]: any };
}

export default function DatabaseManager() {
  const [tables, setTables] = useState<Table[]>([
    {
      id: '1',
      name: 'Customers',
      fields: [
        { id: '1', name: 'Name', type: 'text', required: true },
        { id: '2', name: 'Email', type: 'text', required: true },
        { id: '3', name: 'Phone', type: 'text', required: false },
        { id: '4', name: 'Age', type: 'number', required: false }
      ],
      records: [
        { id: '1', data: { '1': 'John Doe', '2': 'john@example.com', '3': '123-456-7890', '4': 30 } },
        { id: '2', data: { '1': 'Jane Smith', '2': 'jane@example.com', '3': '098-765-4321', '4': 25 } }
      ]
    }
  ]);

  const [activeTable, setActiveTable] = useState<string>('1');
  const [activeView, setActiveView] = useState<'table' | 'form' | 'query'>('table');
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [isEditingRecord, setIsEditingRecord] = useState<string | null>(null);

  const [newTable, setNewTable] = useState({
    name: '',
    fields: [{ name: '', type: 'text' as const, required: false }]
  });

  const [newRecord, setNewRecord] = useState<{ [fieldId: string]: any }>({});
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM Customers');
  const [queryResult, setQueryResult] = useState<any[]>([]);

  const getCurrentTable = () => tables.find(t => t.id === activeTable);

  const addField = () => {
    setNewTable({
      ...newTable,
      fields: [...newTable.fields, { name: '', type: 'text', required: false }]
    });
  };

  const updateField = (index: number, field: Partial<typeof newTable.fields[0]>) => {
    const updatedFields = [...newTable.fields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setNewTable({ ...newTable, fields: updatedFields });
  };

  const removeField = (index: number) => {
    if (newTable.fields.length > 1) {
      setNewTable({
        ...newTable,
        fields: newTable.fields.filter((_, i) => i !== index)
      });
    }
  };

  const createTable = () => {
    if (!newTable.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a table name.",
        variant: "destructive"
      });
      return;
    }

    const validFields = newTable.fields.filter(f => f.name.trim());
    if (validFields.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one field.",
        variant: "destructive"
      });
      return;
    }

    const table: Table = {
      id: Date.now().toString(),
      name: newTable.name,
      fields: validFields.map((f, i) => ({ ...f, id: (i + 1).toString() })),
      records: []
    };

    setTables([...tables, table]);
    setNewTable({ name: '', fields: [{ name: '', type: 'text', required: false }] });
    setIsCreatingTable(false);
    setActiveTable(table.id);

    toast({
      title: "Table Created",
      description: `Table "${table.name}" has been created successfully.`,
    });
  };

  const addRecord = () => {
    const currentTable = getCurrentTable();
    if (!currentTable) return;

    // Validate required fields
    const requiredFields = currentTable.fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!newRecord[field.id]) {
        toast({
          title: "Error",
          description: `Please fill in the required field: ${field.name}`,
          variant: "destructive"
        });
        return;
      }
    }

    const record: Record = {
      id: Date.now().toString(),
      data: { ...newRecord }
    };

    const updatedTables = tables.map(table =>
      table.id === activeTable
        ? { ...table, records: [...table.records, record] }
        : table
    );

    setTables(updatedTables);
    setNewRecord({});

    toast({
      title: "Record Added",
      description: "New record has been added to the table.",
    });
  };

  const updateRecord = (recordId: string) => {
    const updatedTables = tables.map(table =>
      table.id === activeTable
        ? {
            ...table,
            records: table.records.map(record =>
              record.id === recordId ? { ...record, data: { ...newRecord } } : record
            )
          }
        : table
    );

    setTables(updatedTables);
    setIsEditingRecord(null);
    setNewRecord({});

    toast({
      title: "Record Updated",
      description: "Record has been updated successfully.",
    });
  };

  const deleteRecord = (recordId: string) => {
    const updatedTables = tables.map(table =>
      table.id === activeTable
        ? { ...table, records: table.records.filter(record => record.id !== recordId) }
        : table
    );

    setTables(updatedTables);

    toast({
      title: "Record Deleted",
      description: "Record has been deleted successfully.",
    });
  };

  const executeQuery = () => {
    // Simple query parser for demonstration
    const currentTable = getCurrentTable();
    if (!currentTable) return;

    try {
      if (sqlQuery.toLowerCase().includes('select * from')) {
        setQueryResult(currentTable.records.map(record => ({
          id: record.id,
          ...record.data
        })));
      } else {
        setQueryResult([]);
      }

      toast({
        title: "Query Executed",
        description: `Found ${queryResult.length} results.`,
      });
    } catch (error) {
      toast({
        title: "Query Error",
        description: "Invalid SQL query. Please check your syntax.",
        variant: "destructive"
      });
    }
  };

  const exportTable = () => {
    const currentTable = getCurrentTable();
    if (!currentTable) return;

    const headers = currentTable.fields.map(f => f.name);
    const csvContent = [
      headers.join(','),
      ...currentTable.records.map(record =>
        currentTable.fields.map(field => record.data[field.id] || '').join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTable.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Table Exported",
      description: `${currentTable.name} has been exported as CSV.`,
    });
  };

  const importCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Import Error",
            description: "CSV file must contain at least a header and one data row.",
            variant: "destructive"
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const dataLines = lines.slice(1);

        // Create new table from CSV
        const newTableId = Date.now().toString();
        const fields = headers.map((header, index) => ({
          id: (index + 1).toString(),
          name: header,
          type: 'text' as const,
          required: false
        }));

        const records = dataLines.map((line, recordIndex) => {
          const values = line.split(',').map(v => v.trim());
          const data: { [fieldId: string]: any } = {};
          
          headers.forEach((header, fieldIndex) => {
            const fieldId = (fieldIndex + 1).toString();
            const value = values[fieldIndex] || '';
            
            // Try to detect data types
            if (!isNaN(Number(value)) && value !== '') {
              data[fieldId] = Number(value);
            } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
              data[fieldId] = value.toLowerCase() === 'true';
            } else {
              data[fieldId] = value;
            }
          });

          return {
            id: (recordIndex + 1).toString(),
            data
          };
        });

        const newTable: Table = {
          id: newTableId,
          name: file.name.replace('.csv', ''),
          fields,
          records
        };

        setTables(prev => [...prev, newTable]);
        setActiveTable(newTableId);
        
        toast({
          title: "Data Imported",
          description: `Successfully imported ${records.length} records from ${file.name}.`,
        });
      };
      
      reader.readAsText(file);
    };
    input.click();
  };

  const exportAsJSON = () => {
    const currentTable = getCurrentTable();
    if (!currentTable) return;

    const exportData = {
      table: currentTable.name,
      fields: currentTable.fields,
      records: currentTable.records.map(record => ({
        id: record.id,
        ...currentTable.fields.reduce((acc, field) => ({
          ...acc,
          [field.name]: record.data[field.id]
        }), {})
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTable.name}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Table Exported",
      description: `${currentTable.name} has been exported as JSON.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-database text-white text-sm"></i>
                </div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Database Manager</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreatingTable(true)}
                data-testid="create-table"
              >
                <i className="fas fa-plus mr-2"></i>
                New Table
              </Button>
              <Button variant="outline" size="sm" onClick={importCSV} data-testid="import-csv">
                <i className="fas fa-upload mr-2"></i>
                Import CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportTable} data-testid="export-csv">
                <i className="fas fa-file-csv mr-2"></i>
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportAsJSON} data-testid="export-json">
                <i className="fas fa-file-code mr-2"></i>
                Export JSON
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Tables</h3>
            <div className="space-y-2">
              {tables.map((table) => (
                <Button
                  key={table.id}
                  variant={activeTable === table.id ? 'default' : 'ghost'}
                  className="w-full justify-between"
                  onClick={() => setActiveTable(table.id)}
                  data-testid={`table-${table.id}`}
                >
                  <div className="flex items-center">
                    <i className="fas fa-table mr-2"></i>
                    {table.name}
                  </div>
                  <Badge variant="secondary">{table.records.length}</Badge>
                </Button>
              ))}
            </div>

            <div className="mt-8">
              <h4 className="text-md font-medium mb-2">Views</h4>
              <div className="space-y-1">
                <Button
                  variant={activeView === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveView('table')}
                  data-testid="table-view"
                >
                  <i className="fas fa-table mr-2"></i>
                  Table View
                </Button>
                <Button
                  variant={activeView === 'form' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveView('form')}
                  data-testid="form-view"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Form View
                </Button>
                <Button
                  variant={activeView === 'query' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveView('query')}
                  data-testid="query-view"
                >
                  <i className="fas fa-code mr-2"></i>
                  Query View
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeView === 'table' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{getCurrentTable()?.name || 'Select a table'}</h2>
                <Button onClick={() => setActiveView('form')} data-testid="add-record">
                  <i className="fas fa-plus mr-2"></i>
                  Add Record
                </Button>
              </div>

              {getCurrentTable() && (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                            {getCurrentTable()!.fields.map((field) => (
                              <th
                                key={field.id}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                              >
                                {field.name}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {field.type}
                                </Badge>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {getCurrentTable()!.records.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-3">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setIsEditingRecord(record.id);
                                      setNewRecord(record.data);
                                      setActiveView('form');
                                    }}
                                    data-testid={`edit-record-${record.id}`}
                                  >
                                    <i className="fas fa-edit text-xs"></i>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteRecord(record.id)}
                                    data-testid={`delete-record-${record.id}`}
                                  >
                                    <i className="fas fa-trash text-xs text-red-500"></i>
                                  </Button>
                                </div>
                              </td>
                              {getCurrentTable()!.fields.map((field) => (
                                <td key={field.id} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                  {record.data[field.id] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeView === 'form' && getCurrentTable() && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {isEditingRecord ? 'Edit Record' : 'Add New Record'}
                </h2>
                <Button variant="outline" onClick={() => setActiveView('table')} data-testid="back-to-table">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Table
                </Button>
              </div>

              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle>{getCurrentTable()!.name} Form</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getCurrentTable()!.fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium mb-2">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {field.type}
                        </Badge>
                      </label>
                      {field.type === 'text' && (
                        <Input
                          value={newRecord[field.id] || ''}
                          onChange={(e) => setNewRecord({ ...newRecord, [field.id]: e.target.value })}
                          placeholder={`Enter ${field.name.toLowerCase()}`}
                          data-testid={`field-${field.id}`}
                        />
                      )}
                      {field.type === 'number' && (
                        <Input
                          type="number"
                          value={newRecord[field.id] || ''}
                          onChange={(e) => setNewRecord({ ...newRecord, [field.id]: Number(e.target.value) })}
                          placeholder={`Enter ${field.name.toLowerCase()}`}
                          data-testid={`field-${field.id}`}
                        />
                      )}
                      {field.type === 'date' && (
                        <Input
                          type="date"
                          value={newRecord[field.id] || ''}
                          onChange={(e) => setNewRecord({ ...newRecord, [field.id]: e.target.value })}
                          data-testid={`field-${field.id}`}
                        />
                      )}
                      {field.type === 'boolean' && (
                        <Select
                          value={newRecord[field.id]?.toString() || ''}
                          onValueChange={(value) => setNewRecord({ ...newRecord, [field.id]: value === 'true' })}
                        >
                          <SelectTrigger data-testid={`field-${field.id}`}>
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}

                  <div className="flex space-x-2 pt-4">
                    {isEditingRecord ? (
                      <Button onClick={() => updateRecord(isEditingRecord)} data-testid="update-record">
                        <i className="fas fa-save mr-2"></i>
                        Update Record
                      </Button>
                    ) : (
                      <Button onClick={addRecord} data-testid="save-record">
                        <i className="fas fa-save mr-2"></i>
                        Save Record
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewRecord({});
                        setIsEditingRecord(null);
                        setActiveView('table');
                      }}
                      data-testid="cancel-form"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'query' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">SQL Query</h2>
                <Button variant="outline" onClick={() => setActiveView('table')} data-testid="back-to-table-query">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Table
                </Button>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Query Editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">SQL Query</label>
                    <textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      placeholder="Enter your SQL query here..."
                      data-testid="sql-query"
                    />
                  </div>
                  <Button onClick={executeQuery} data-testid="execute-query">
                    <i className="fas fa-play mr-2"></i>
                    Execute Query
                  </Button>
                </CardContent>
              </Card>

              {queryResult.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Query Results ({queryResult.length} rows)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            {Object.keys(queryResult[0] || {}).map((key) => (
                              <th
                                key={key}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {queryResult.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              {Object.values(row).map((value: any, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                  {value?.toString() || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Table Modal */}
      {isCreatingTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Table</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingTable(false)}
                  data-testid="close-create-table"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Table Name</label>
                  <Input
                    value={newTable.name}
                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                    placeholder="Enter table name"
                    data-testid="table-name"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Fields</label>
                    <Button size="sm" onClick={addField} data-testid="add-field">
                      <i className="fas fa-plus mr-2"></i>
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {newTable.fields.map((field, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          placeholder="Field name"
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          className="flex-1"
                          data-testid={`field-name-${index}`}
                        />
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(index, { type: value as any })}
                        >
                          <SelectTrigger className="w-32" data-testid={`field-type-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateField(index, { required: !field.required })}
                          className={field.required ? 'text-red-500' : 'text-gray-400'}
                          data-testid={`field-required-${index}`}
                        >
                          <i className="fas fa-asterisk"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(index)}
                          disabled={newTable.fields.length === 1}
                          data-testid={`remove-field-${index}`}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreatingTable(false)} data-testid="cancel-create-table">
                    Cancel
                  </Button>
                  <Button onClick={createTable} data-testid="save-create-table">
                    <i className="fas fa-save mr-2"></i>
                    Create Table
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}