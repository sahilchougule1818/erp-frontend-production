import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PenSquare, Download, Users, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { TableFilter } from './TableFilter';
import { EditSearchButton } from './EditSearchButton';
import * as XLSX from 'xlsx';

interface Column {
  key: string;
  label: string;
  render?: (value: any, record: any) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps {
  title: string;
  columns: Column[];
  records: any[];
  onEdit?: (record: any) => void;
  onEditWorkers?: (record: any) => void;
  onDelete?: (record: any) => void;
  addButton?: React.ReactNode;
  filterConfig?: {
    filter1Key: string;
    filter1Label: string;
    filter2Key: string;
    filter2Label: string;
  } | null;
  exportFileName?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable({
  title,
  columns,
  records = [],
  onEdit,
  onEditWorkers,
  onDelete,
  addButton,
  filterConfig,
  exportFileName = 'data',
  pagination
}: DataTableProps) {
  const [selectedFilter1, setSelectedFilter1] = useState('');
  const [selectedFilter2, setSelectedFilter2] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  const displayRecords = useMemo(() => {
    if (!records || records.length === 0) return [];
    if (!filterConfig || !isFiltered) return records;
    return records.filter(r => {
      const { filter1Key, filter2Key } = filterConfig;
      const match1 = !selectedFilter1 || (filter1Key.includes('date') && r[filter1Key] ? String(r[filter1Key]).split('T')[0] === selectedFilter1 : r[filter1Key] === selectedFilter1);
      const match2 = !selectedFilter2 || r[filter2Key] === selectedFilter2;
      return match1 && match2;
    });
  }, [records, isFiltered, selectedFilter1, selectedFilter2, filterConfig]);

  const handleExport = () => {
    const exportData = displayRecords.map(record => {
      const row: any = {};
      columns.forEach(col => {
        row[col.label] = record[col.key];
      });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {addButton}
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
          {(onEdit || onEditWorkers) && filterConfig && (
            <EditSearchButton
              records={records}
              filter1Key={filterConfig.filter1Key}
              filter1Label={filterConfig.filter1Label}
              filter2Key={filterConfig.filter2Key}
              filter2Label={filterConfig.filter2Label}
              onEdit={onEdit || (() => {})}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filterConfig && records && (
          <TableFilter
            records={records}
            filter1Key={filterConfig.filter1Key}
            filter1Label={filterConfig.filter1Label}
            filter2Key={filterConfig.filter2Key}
            filter2Label={filterConfig.filter2Label}
            selectedFilter1={selectedFilter1}
            selectedFilter2={selectedFilter2}
            onFilter1Change={setSelectedFilter1}
            onFilter2Change={setSelectedFilter2}
            onSearch={() => setIsFiltered(true)}
            onReset={() => { setSelectedFilter1(''); setSelectedFilter2(''); setIsFiltered(false); }}
            isFiltered={isFiltered}
          />
        )}
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                {(onEdit || onEditWorkers || onDelete) && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap sticky right-0 bg-gray-50 z-10 w-24">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {displayRecords.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-sm font-normal text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                displayRecords.map((record: any, index: number) => {
                  const isHistorical = record.is_active === false;
                  return (
                  <tr key={record.id || record.booking_id || record.batch_id || record.batch_code || index} className="border-b hover:bg-gray-50">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-4 text-base font-normal whitespace-nowrap align-middle text-center">
                        {col.render ? col.render(record[col.key], record) : record[col.key]}
                      </td>
                    ))}
                    {(onEdit || onEditWorkers || onDelete) && (
                      <td className="px-4 py-3 text-sm font-normal sticky right-0 bg-white hover:bg-gray-50 z-10">
                        <div className="flex gap-1">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(record)}
                              title={isHistorical ? 'Historical record — editing disabled' : 'Edit'}
                              disabled={isHistorical}
                              className={isHistorical ? 'cursor-not-allowed' : ''}
                            >
                              <PenSquare className="w-4 h-4" />
                            </Button>
                          )}
                          {onEditWorkers && record.state === 'ACTIVE' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => onEditWorkers(record)}
                              title="Edit Workers"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(record)}
                              title="Delete Record"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing <span className="font-medium">{((pagination.currentPage || 1) - 1) * (pagination.limit || 10) + 1}</span> to{' '}
                <span className="font-medium">{Math.min((pagination.currentPage || 1) * (pagination.limit || 10), pagination.total || 0)}</span> of{' '}
                <span className="font-medium">{pagination.total || 0}</span> results
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {(() => {
                const pages: (number | string)[] = [];
                const maxVisible = 5;

                if (pagination.totalPages <= maxVisible) {
                  for (let i = 1; i <= pagination.totalPages; i++) pages.push(i);
                } else {
                  if (pagination.currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) pages.push(i);
                    pages.push('...');
                    pages.push(pagination.totalPages);
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = pagination.totalPages - 3; i <= pagination.totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    pages.push('...');
                    pages.push(pagination.currentPage - 1);
                    pages.push(pagination.currentPage);
                    pages.push(pagination.currentPage + 1);
                    pages.push('...');
                    pages.push(pagination.totalPages);
                  }
                }

                return pages.map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={pagination.currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => pagination.onPageChange(page as number)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                );
              })()}

              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
