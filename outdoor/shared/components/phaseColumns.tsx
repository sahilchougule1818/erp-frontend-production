import React from 'react';

// ─── Column config interface ──────────────────────────────────────────────────

interface PhaseColumnConfig {
  includeSourcePhase?:   boolean;   // holding_area: show which phase it came from
  includeStockColumns?:  boolean;   // primary/secondary: show sold, available, total_mortality
}

// ─── Shared column factory ────────────────────────────────────────────────────

export const createPhaseColumns = (config: PhaseColumnConfig = {}) => {
  const {
    includeSourcePhase   = false,
    includeStockColumns  = false,
  } = config;

  const columns: any[] = [
    {
      key: 'created_at',
      label: 'Date',
      render: (val: string) => val?.split('T')[0] ?? '',
    },
    { key: 'batch_code', label: 'Batch Code' },
    { key: 'plant_name', label: 'Plant Name' },
  ];

  if (includeSourcePhase) {
    columns.push({
      key: 'source_phase',
      label: 'Source Phase',
      render: (val: string) => phaseLabel(val),
    });
  }

  columns.push({
    key: 'current_tunnel',
    label: 'Tunnel',
  });

  columns.push(
    {
      key: 'age_at_arrival',
      label: 'Age at Arrival',
      render: (val: number) =>
        val !== null && val !== undefined ? `${val} days` : '—',
    },
    {
      key: 'current_age',
      label: 'Current Age',
      render: (val: number) =>
        val !== null && val !== undefined ? `${val} days` : '—',
    },
    {
      key: 'trays',
      label: 'Trays',
      render: (val: any) => {
        if (!Array.isArray(val) || val.length === 0) return '—';
        return val.map((t: any, i: number) => (
          <div key={i}>T{t.cavityCount} × {t.count}</div>
        ));
      },
    },
    { key: 'initial_plants', label: 'Initial Plants' },
    { key: 'mortality_count', label: 'Mortality' },
  );

  if (includeStockColumns) {
    columns.push(
      { key: 'sold_count',       label: 'Sold', render: (v: number) => <span className={Number(v) > 0 ? 'font-semibold text-rose-600' : 'text-slate-400'}>{Number(v ?? 0).toLocaleString()}</span> },
      { key: 'available_plants', label: 'Available',  render: (v: number) => <span className="font-bold text-green-700">{Number(v ?? 0).toLocaleString()}</span> },
    );
  }

  columns.push({
    key: 'state',
    label: 'Status',
    render: (val: string) => {
      const stateColors: Record<string, string> = {
        'ACTIVE':     'bg-green-100 text-green-700',
        'COMPLETED':  'bg-slate-100 text-slate-500',
        'SOLD_OUT':   'bg-rose-100 text-rose-700',
        'HOLDING':    'bg-blue-100 text-blue-700',
      };
      const colorClass = stateColors[val] ?? 'bg-slate-100 text-slate-500';
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
          {val}
        </span>
      );
    },
  });

  return columns;
};

// ─── Per-component configs — one place to change column sets ──────────────────

export const phaseColumnConfigs = {
  primaryHardening:   { includeStockColumns: true },
  secondaryHardening: { includeStockColumns: true },
  holdingArea:        { includeSourcePhase: true, includeStockColumns: true },
} satisfies Record<string, PhaseColumnConfig>;

// ─── Private helpers ──────────────────────────────────────────────────────────

function phaseLabel(val: string): string {
  const map: Record<string, string> = {
    primary_hardening:   'Primary Hardening',
    secondary_hardening: 'Secondary Hardening',
    holding_area:        'Holding Area',
  };
  return map[val] ?? val;
}
