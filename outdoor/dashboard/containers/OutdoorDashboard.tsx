import { useState, useEffect } from 'react';
import { Leaf, TreePine, Warehouse, Skull } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { outdoorApi } from '../../shared/services/outdoorApi';

const UNITS = [
  { name: 'Unit A', prefix: 'A', tunnels: 10 },
  { name: 'Unit B', prefix: 'B', tunnels: 10 },
  { name: 'Unit C', prefix: 'C', tunnels: 10 },
  { name: 'Unit D', prefix: 'D', tunnels: 10 },
  { name: 'Unit E', prefix: 'E', tunnels: 10 }
];

const COLORS_HEX = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const OutdoorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [holdingBatches, setHoldingBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTunnel, setExpandedTunnel] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, occupancyData, holdingData] = await Promise.all([
          outdoorApi.unified.getDashboardStats(),
          outdoorApi.unified.getTunnelOccupancy(),
          outdoorApi.unified.getHoldingArea()
        ]);
        setStats(statsData);
        setOccupancy(occupancyData);
        setHoldingBatches(holdingData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTunnelData = (tunnelName: string) => {
    return occupancy.find(o => o.tunnel === tunnelName);
  };

  const renderOccupancyBar = (tunnelName: string) => {
    const data = getTunnelData(tunnelName);
    const batches = data?.batches || [];
    const totalPlants = batches.reduce((sum: number, b: any) => sum + (b.plants || 0), 0);
    const capacity = data?.capacity || 0;
    const isOverCapacity = capacity > 0 && totalPlants > capacity;
    const isExpanded = expandedTunnel === tunnelName;

    return (
      <div key={tunnelName}>
        {/* Summary Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 100px',
            padding: '12px 0',
            borderBottom: '1px solid #f1f5f9',
            cursor: 'pointer',
            backgroundColor: isExpanded ? '#f8fafc' : 'transparent',
            transition: 'background 0.2s'
          }}
          onClick={() => setExpandedTunnel(isExpanded ? null : tunnelName)}
        >
          {/* 1. Tunnel ID + overflow warning */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontWeight: '600', color: isOverCapacity ? '#ef4444' : '#64748b' }}>{tunnelName}</span>
            {isOverCapacity && <span style={{ fontSize: '0.55rem', fontWeight: '700', color: '#ef4444', lineHeight: 1, whiteSpace: 'nowrap' }}>OVERCROWDED</span>}
          </div>

          {/* 2. Occupancy & Batch Count */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                {batches.length > 1 ? `${batches.length} Batches` : (batches.length === 1 ? '1 Batch' : '')}
              </span>
              {batches.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Active</span>
              )}
            </div>
            
            {/* Stacked progress bar — vs capacity if set, else proportional among batches */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              {batches.length > 0 ? (
                batches.map((batch: any, idx: number) => {
                  const base = capacity > 0 ? capacity : totalPlants;
                  const pct = base > 0 ? Math.min((batch.plants / base) * 100, 100) : 0;
                  const color = COLORS_HEX[idx % COLORS_HEX.length];
                  return (
                    <div
                      key={idx}
                      style={{ width: `${pct}%`, height: '100%', backgroundColor: color, transition: 'width 0.3s ease' }}
                      title={`${batch.batch_code}: ${batch.plants} plants`}
                    />
                  );
                })
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0' }} />
              )}
            </div>
          </div>

          {/* 3. Plant count vs capacity */}
          <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 'bold', color: isOverCapacity ? '#ef4444' : '#0f172a' }}>
              {totalPlants > 0 ? totalPlants.toLocaleString() : '—'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
              {capacity > 0 ? `/ ${capacity.toLocaleString()}` : 'plants'}
            </div>
          </div>
        </div>

        {/* Expanded Detail View */}
        {isExpanded && batches.length > 0 && (
          <div style={{ backgroundColor: '#f8fafc', padding: '12px 12px 12px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {batches.map((batch: any, idx: number) => {
              const color = COLORS_HEX[idx % COLORS_HEX.length];
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    borderLeft: `4px solid ${color}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '12px', padding: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                        {batch.batch_code}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {batch.plant_name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
                        {batch.plants}
                      </div>
                      {batch.mortality > 0 && (
                        <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.7rem' }}>
                          ⚠ {batch.mortality}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderUnitCard = (unit: any) => (
    <div key={unit.prefix} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '6px', height: '20px', backgroundColor: '#10b981', borderRadius: '4px' }} />
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>{unit.name}</h3>
      </div>
      <div style={{ padding: '0 16px', overflowY: 'auto', maxHeight: '280px', scrollbarWidth: 'thin' }}>
        {Array.from({ length: unit.tunnels }).map((_, idx) => {
          const tunnelName = `${unit.prefix}${idx + 1}`;
          return renderOccupancyBar(tunnelName);
        })}
      </div>
    </div>
  );

  const renderHoldingArea = () => {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #fed7aa', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #ffedd5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '20px', backgroundColor: '#ea580c', borderRadius: '4px' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 'bold' }}>Holding Area</h3>
        </div>
        <div style={{ padding: '16px', overflowY: 'auto', maxHeight: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {holdingBatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
              <Warehouse style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.75rem', margin: 0 }}>No batches in holding</p>
            </div>
          ) : (
            holdingBatches.map((batch: any, idx: number) => {
              return (
                <div
                  key={idx}
                  style={{ padding: '12px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', cursor: 'pointer' }}
                  onClick={() => navigate(`/batch-timeline?batch=${batch.batch_code}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>{batch.batch_code}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{batch.plant_name}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#ea580c' }}>{batch.plants}</div>
                      <div style={{ fontSize: '10px', color: '#fb923c', fontWeight: 'bold', textTransform: 'uppercase' }}>Plants</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* KPI Cards Row */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div style={{ padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '12px', border: '1px solid #e2e8f0', borderBottom: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#047857' }}>Primary Hardening</span>
              <Leaf style={{ color: '#059669', width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#064e3b', marginTop: '8px' }}>{stats?.primary_count || 0}</div>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #e2e8f0', borderBottom: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1d4ed8' }}>Secondary Hardening</span>
              <TreePine style={{ color: '#2563eb', width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#1e3a8a', marginTop: '8px' }}>{stats?.secondary_count || 0}</div>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #e2e8f0', borderBottom: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#b45309' }}>Holding Area</span>
              <Warehouse style={{ color: '#d97706', width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#78350f', marginTop: '8px' }}>{holdingBatches.length}</div>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#fff1f2', borderRadius: '12px', border: '1px solid #e2e8f0', borderBottom: '4px solid #f43f5e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#be123c' }}>Total Mortality</span>
              <Skull style={{ color: '#e11d48', width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#881337', marginTop: '8px' }}>{stats?.total_mortality || 0}</div>
          </div>
        </div>
      )}

      {/* Grid Schematic Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        {UNITS.map((unit) => renderUnitCard(unit))}
        {renderHoldingArea()}
      </div>
    </div>
  );
};
