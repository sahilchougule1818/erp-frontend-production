// ─── Column config interface ──────────────────────────────────────────────────

interface PhaseColumnConfig {
  includeSourcePhase?:   boolean;   // holding_area: show which phase it came from
  includeStockColumns?:  boolean;   // primary/secondary: show sold, available, total_mortality
  tunnelLabel?:          string;    // override column header (e.g. 'SH Unit' for secondary hardening)
}

// ─── Shared column factory ────────────────────────────────────────────────────

export const createPhaseColumns = (config: PhaseColumnConfig = {}) => {
  const {
    includeSourcePhase   = false,
    includeStockColumns  = false,
    tunnelLabel          = 'Tunnel',
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
    label: tunnelLabel,
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
      { key: 'sold_count',       label: 'Sold',      render: (v: number) => Number(v ?? 0).toLocaleString() },
      { key: 'available_plants', label: 'Available' },
    );
  }

  columns.push({
    key: 'state',
    label: 'State',
  });

  return columns;
};

// ─── Per-component configs — one place to change column sets ──────────────────

export const phaseColumnConfigs = {
  primaryHardening:   { includeStockColumns: true },
  secondaryHardening: { includeStockColumns: true, tunnelLabel: 'SH Unit' },
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
