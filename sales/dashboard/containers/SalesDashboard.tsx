import { Package, ArrowUp } from 'lucide-react';
import { DataTable } from '../../shared/components/DataTable';
import { useIndoorStock, useOutdoorStock, useDashboardStats } from '../../shared/hooks/useSalesApi';

// ─── Stat card ────────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: string;
  sub: string;
  bg: string;
  border: string;
  labelColor: string;
  valueColor: string;
  subColor: string;
  icon: React.ReactNode;
};

function StatCard({ label, value, sub, bg, border, labelColor, valueColor, subColor, icon }: StatCardProps) {
  return (
    <div style={{ padding: '20px', backgroundColor: bg, borderRadius: '12px', borderBottom: `4px solid ${border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: labelColor }}>{label}</span>
        {icon}
      </div>
      <div style={{ fontSize: '1.875rem', fontWeight: '900', color: valueColor, marginTop: '8px' }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: subColor, fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>{sub}</div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>{title}</h2>
      <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{sub}</p>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function SalesDashboard() {
  const { stock: indoorStock } = useIndoorStock();
  const { stock: outdoorStock } = useOutdoorStock();
  const { stats } = useDashboardStats();

  const totalIndoorBottles = Number(stats?.total_indoor_bottles) || 0;
  const totalOutdoorPlants = Number(stats?.total_outdoor_plants) || 0;

  // ── Columns ──────────────────────────────────────────────────────────────

  const indoorColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'stage', label: 'Stage' },
    { key: 'bookable_bottles', label: 'Bookable Bottles', render: (val: number) => Number(val).toLocaleString() },
    { key: 'age_days', label: 'Age (days)', render: (val: any) => val || 0 }
  ];

  const outdoorColumns = [
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'bookable_plants', label: 'Bookable Plants', render: (val: number) => Number(val).toLocaleString() },
    { key: 'age_days', label: 'Age (days)', render: (val: any) => val || 0 }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>Sales Overview</h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
          Live snapshot of available stock for sales.
        </p>
      </div>

      {/* KPI Cards — 2 in one row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <StatCard
          label="Indoor Stock"
          value={totalIndoorBottles.toLocaleString()}
          sub="Available Bottles (Incubation)"
          bg="#f5f3ff" border="#8b5cf6" labelColor="#6d28d9" valueColor="#4c1d95" subColor="#c4b5fd"
          icon={<ArrowUp style={{ color: '#7c3aed', width: '20px', height: '20px' }} />}
        />
        <StatCard
          label="Outdoor Stock"
          value={totalOutdoorPlants.toLocaleString()}
          sub="Available Plants (Holding Area)"
          bg="#ecfdf5" border="#10b981" labelColor="#047857" valueColor="#064e3b" subColor="#6ee7b7"
          icon={<Package style={{ color: '#059669', width: '20px', height: '20px' }} />}
        />
      </div>

      {/* ── STOCK ANALYSIS ── */}
      <div>
        <SectionHeader
          title="Stock Analysis"
          sub="Current batches across indoor incubation and outdoor holding areas"
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <DataTable
            title="Indoor Stock (Incubation)"
            columns={indoorColumns}
            records={indoorStock}
            exportFileName="indoor_stock"
          />
          <DataTable
            title="Outdoor Stock (Holding)"
            columns={outdoorColumns}
            records={outdoorStock}
            exportFileName="outdoor_stock"
          />
        </div>
      </div>

    </div>
  );
}

export default SalesDashboard;
