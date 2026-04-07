import React, { useState } from 'react';
import { Badge } from '../../shared/ui/badge';
import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useLedger, useBankSummary, useDashboardStats } from '../../shared/hooks/useSalesApi';
import { format } from 'date-fns';
import { DataTable } from '../../shared/components/DataTable';
import { LedgerFilterBar } from '../../shared/components/LedgerFilterBar';
import { cn } from '../../shared/ui/utils';

const ENTRY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ADVANCE_IN:         { label: 'Advance In',   color: 'bg-blue-100 text-blue-700' },
  PAYMENT_IN:         { label: 'Payment In',   color: 'bg-green-100 text-green-700' },
  REFUND_OUT:         { label: 'Refund Out',   color: 'bg-red-100 text-red-700' },
  STOCK_PURCHASE_OUT: { label: 'Purchase Out', color: 'bg-orange-100 text-orange-700' },
};

const LedgerSection: React.FC = () => {
  const [filters, setFilters] = useState({
    bank_account_id: 'all',
    type: 'all',
    from_date: '',
    to_date: '',
  });

  const { entries, pagination, refetch } = useLedger(filters);
  const { summary } = useBankSummary();
  const { stats } = useDashboardStats();

  const handleChange = (key: string, value: string) =>
    setFilters(f => ({ ...f, [key]: value }));

  const handleReset = () =>
    setFilters({ bank_account_id: 'all', type: 'all', from_date: '', to_date: '' });

  const handlePageChange = (page: number) => {
    refetch(page);
  };

  const netInflow  = Number(stats?.net_inflow)  || 0;
  const netOutflow = Number(stats?.net_outflow) || 0;
  const netPending = Number(stats?.net_pending) || 0;

  const fmt = (n: number) =>
    n >= 1_00_000 ? `₹${(n / 1_00_000).toFixed(1)}L`
    : n >= 1_000  ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n.toLocaleString()}`;

  const columns = [
    {
      key: 'entry_date',
      label: 'Date',
      render: (val: string) => format(new Date(val), 'dd MMM yyyy')
    },
    {
      key: 'entry_type',
      label: 'Particular',
      render: (val: string) => {
        const meta = ENTRY_TYPE_LABELS[val] ?? { label: val, color: 'bg-slate-100 text-slate-600' };
        return <Badge className={meta.color}>{meta.label}</Badge>;
      }
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (val: string) => val || '—'
    },
    {
      key: 'booking_id',
      label: 'Booking ID',
      render: (val: string) => val || '—'
    },
    {
      key: 'transaction_number',
      label: 'System TXN No.',
      render: (val: string) => val || '—'
    },
    {
      key: 'payment_reference',
      label: 'Payment Ref',
      render: (val: string) => val || '—'
    },
    {
      key: 'payment_method',
      label: 'Method',
      render: (val: string) => val || 'Cash'
    },
    {
      key: 'bank_account_name',
      label: 'Account',
      render: (val: string) => val || '—'
    },
    {
      key: 'refund_id',
      label: 'Refund ID',
      render: (val: string) => val || '—'
    },
    {
      key: 'stock_purchase_id',
      label: 'Purchase ID',
      render: (val: string) => val || '—'
    },
    {
      key: 'debit_amount',
      label: 'Outflow (−)',
      render: (val: number) => Number(val) > 0 ? `₹${Number(val).toLocaleString()}` : '—'
    },
    {
      key: 'credit_amount',
      label: 'Inflow (+)',
      render: (val: number) => Number(val) > 0 ? `₹${Number(val).toLocaleString()}` : '—'
    },
  ];

  return (
    <div className="p-6 space-y-5">

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ padding: '18px 20px', backgroundColor: '#f0fdf4', borderRadius: '12px', borderBottom: '4px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Funds Inflow</span>
            <TrendingUp style={{ color: '#16a34a', width: '18px', height: '18px' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#14532d', marginTop: '6px' }}>{fmt(netInflow)}</div>
          <div style={{ fontSize: '0.65rem', color: '#86efac', fontWeight: '600', textTransform: 'uppercase', marginTop: '3px' }}>
            {filters.bank_account_id !== 'all' || filters.from_date || filters.to_date ? 'Filtered view' : 'All time'}
          </div>
        </div>

        <div style={{ padding: '18px 20px', backgroundColor: '#fff1f2', borderRadius: '12px', borderBottom: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Funds Outflow</span>
            <TrendingDown style={{ color: '#e11d48', width: '18px', height: '18px' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#881337', marginTop: '6px' }}>{fmt(netOutflow)}</div>
          <div style={{ fontSize: '0.65rem', color: '#fda4af', fontWeight: '600', textTransform: 'uppercase', marginTop: '3px' }}>
            {filters.bank_account_id !== 'all' || filters.from_date || filters.to_date ? 'Filtered view' : 'All time'}
          </div>
        </div>

        <div style={{ padding: '18px 20px', backgroundColor: '#fff7ed', borderRadius: '12px', borderBottom: '4px solid #f97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pending</span>
            <Clock style={{ color: '#ea580c', width: '18px', height: '18px' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#7c2d12', marginTop: '6px' }}>{fmt(netPending)}</div>
          <div style={{ fontSize: '0.65rem', color: '#fdba74', fontWeight: '600', textTransform: 'uppercase', marginTop: '3px' }}>
            Outstanding from customers
          </div>
        </div>
      </div>

      <DataTable
        title="Financial Ledger"
        columns={columns}
        records={entries}
        filterConfig={null}
        addButton={
          <LedgerFilterBar
            filters={filters}
            accounts={summary}
            onChange={handleChange}
            onReset={handleReset}
          />
        }
        exportFileName="financial_ledger"
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
          onPageChange: handlePageChange
        }}
      />

    </div>
  );
};

export default LedgerSection;
export { LedgerSection };
