import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Search, Printer, FileSpreadsheet } from 'lucide-react';
import { loadLedger, LedgerEntry, SALES_EVENTS } from './salesData';

type DateFilter = 'all' | 'today' | 'weekly' | 'monthly' | 'custom';

const parseEntryType = (particulars: string): string => {
  if (particulars.includes('Buyer Payment')) return 'Buyer Payment';
  if (particulars.includes('Buyer Booking') || particulars.includes('Booking -')) return 'Buyer Booking';
  if (particulars.includes('Seller Payment')) return 'Seller Payment';
  if (particulars.includes('Seller Purchase') || particulars.includes('Payment -')) return 'Seller Purchase Expense';
  return 'Other';
};

const parsePartyName = (particulars: string): string => {
  const match = particulars.match(/- (.+?)(?:\s*\(|$)/);
  return match ? match[1].trim() : '-';
};

const getEntryType = (entry: LedgerEntry): string => {
  if (entry.entryType) {
    if (entry.entryType === 'Buyer') {
      return entry.particulars.includes('Payment') ? 'Buyer Payment' : 'Buyer Booking';
    }
    if (entry.entryType === 'Seller') {
      return entry.particulars.includes('Payment') ? 'Seller Payment' : 'Seller Purchase Expense';
    }
    return entry.entryType;
  }
  return parseEntryType(entry.particulars);
};

const getPartyName = (entry: LedgerEntry): string => {
  if (entry.partyName) return entry.partyName;
  return parsePartyName(entry.particulars);
};

export const LedgerSection: React.FC = () => {
  const [ledger, setLedger] = React.useState<LedgerEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState<DateFilter>('all');
  const [customFromDate, setCustomFromDate] = React.useState('');
  const [customToDate, setCustomToDate] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  React.useEffect(() => {
    setLedger(loadLedger());

    if (typeof window === 'undefined') {
      return;
    }

    const handleRefresh = () => setLedger(loadLedger());
    window.addEventListener(SALES_EVENTS.ledger, handleRefresh);
    return () => window.removeEventListener(SALES_EVENTS.ledger, handleRefresh);
  }, []);

  const getDateRange = (): { from: Date | null; to: Date | null } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return { from: today, to: today };
      case 'weekly':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { from: weekAgo, to: today };
      case 'monthly':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { from: monthAgo, to: today };
      case 'custom':
        return {
          from: customFromDate ? new Date(customFromDate) : null,
          to: customToDate ? new Date(customToDate) : null,
        };
      default:
        return { from: null, to: null };
    }
  };

  const filteredLedger = React.useMemo(() => {
    const { from, to } = getDateRange();
    
    return ledger.filter((entry) => {
      const entryType = getEntryType(entry);
      const partyName = getPartyName(entry);
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!partyName.toLowerCase().includes(searchLower) && 
            !entry.particulars.toLowerCase().includes(searchLower) &&
            !entryType.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      if (typeFilter !== 'all' && entryType !== typeFilter) {
        return false;
      }
      
      if (from && to) {
        const entryDate = new Date(entry.date);
        if (entryDate < from || entryDate > to) {
          return false;
        }
      }
      
      return true;
    });
  }, [ledger, searchTerm, dateFilter, customFromDate, customToDate, typeFilter]);

  const normalizedLedger = React.useMemo(() => {
    let runningBalance = 0;
    return filteredLedger.map((entry) => {
      runningBalance += entry.debit - entry.credit;
      return { ...entry, balance: runningBalance };
    });
  }, [filteredLedger]);

  const stats = React.useMemo(() => {
    const debit = normalizedLedger.reduce((acc, entry) => acc + entry.debit, 0);
    const credit = normalizedLedger.reduce((acc, entry) => acc + entry.credit, 0);
    const closing = normalizedLedger[normalizedLedger.length - 1]?.balance ?? 0;
    return { debit, credit, closing };
  }, [normalizedLedger]);

  const getPeriodDisplay = (): string => {
    const { from, to } = getDateRange();
    if (!from || !to) return 'All Time';
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    
    if (dateFilter === 'today') return `Today: ${formatDate(from)}`;
    return `Ledger: ${formatDate(from)} – ${formatDate(to)}`;
  };

  const handleExportExcel = () => {
    const csvContent = [
      ['Date', 'Type', 'Party Name', 'Particulars', 'Debit', 'Credit', 'Balance'],
      ...normalizedLedger.map(entry => [
        entry.date,
        getEntryType(entry),
        getPartyName(entry),
        entry.particulars,
        entry.debit || '',
        entry.credit || '',
        entry.balance
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-xs text-red-700">Total Debits</p>
            <p className="text-2xl text-red-900 mt-1">₹{stats.debit.toLocaleString()}</p>
            <p className="text-xs text-red-600 mt-1">from bookings & expenses</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <p className="text-xs text-green-700">Total Credits</p>
            <p className="text-2xl text-green-900 mt-1">₹{stats.credit.toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1">from payments</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700">Closing Balance</p>
            <p className="text-2xl text-blue-900 mt-1">₹{stats.closing.toLocaleString()}</p>
            <p className="text-xs text-blue-600 mt-1">current balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>Ledger Entries</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export to Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search by party name, type..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-[180px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Buyer Payment">Buyer Payment</SelectItem>
                    <SelectItem value="Buyer Booking">Buyer Booking</SelectItem>
                    <SelectItem value="Seller Payment">Seller Payment</SelectItem>
                    <SelectItem value="Seller Purchase Expense">Seller Purchase Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-[150px]">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Period</label>
                <Select value={dateFilter} onValueChange={(v: string) => setDateFilter(v as DateFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {dateFilter === 'custom' && (
                <>
                  <div className="w-[150px]">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">From</label>
                    <Input
                      type="date"
                      value={customFromDate}
                      onChange={(e) => setCustomFromDate(e.target.value)}
                    />
                  </div>
                  <div className="w-[150px]">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">To</label>
                    <Input
                      type="date"
                      value={customToDate}
                      onChange={(e) => setCustomToDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-gray-100 px-4 py-2 rounded-md">
              <p className="text-sm font-medium text-gray-700">{getPeriodDisplay()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Party Name</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Particulars</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Debit</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Credit</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Balance</th>
                </tr>
              </thead>
              <tbody>
                {normalizedLedger.map((entry) => {
                  const entryType = getEntryType(entry);
                  const partyName = getPartyName(entry);
                  
                  const getTypeBadgeClass = (type: string) => {
                    switch (type) {
                      case 'Buyer Payment': return 'bg-green-100 text-green-700';
                      case 'Buyer Booking': return 'bg-blue-100 text-blue-700';
                      case 'Seller Payment': return 'bg-purple-100 text-purple-700';
                      case 'Seller Purchase Expense': return 'bg-orange-100 text-orange-700';
                      default: return 'bg-gray-100 text-gray-700';
                    }
                  };
                  
                  return (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{entry.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge className={getTypeBadgeClass(entryType)}>{entryType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{partyName}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium">{entry.particulars}</span>
                        {entry.referenceId && (
                          <p className="text-xs text-gray-500">Ref: {entry.referenceId}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-600">
                        {entry.debit ? `₹${entry.debit.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        {entry.credit ? `₹${entry.credit.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-700">
                        ₹{entry.balance.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {normalizedLedger.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No ledger entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
