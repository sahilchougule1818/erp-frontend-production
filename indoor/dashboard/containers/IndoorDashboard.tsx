import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../shared/ui/card';
import { Package, FlaskConical, Boxes } from 'lucide-react';
import { indoorApi } from '../../indoorApi';

export function IndoorDashboard() {
  const [totalMediaBatches, setTotalMediaBatches] = useState(0);
  const [totalBottles, setTotalBottles] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [mediaBatches, setMediaBatches] = useState([]);
  const [activeBatches, setActiveBatches] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await indoorApi.unified.getDashboardStats();
      console.log('Dashboard response:', response);
      setTotalMediaBatches(parseInt(response.totalMediaBatches) || 0);
      setTotalBatches(parseInt(response.totalBatches) || 0);
      setTotalBottles(parseInt(response.totalBottles) || 0);
      setMediaBatches(response.mediaBatches || []);
      setActiveBatches(response.activeBatches || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setTotalMediaBatches(0);
      setTotalBatches(0);
      setTotalBottles(0);
      setMediaBatches([]);
      setActiveBatches([]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Indoor Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time production metrics and operator performance</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div style={{ padding: '20px', backgroundColor: '#ffedd5', borderRadius: '12px', border: '1px solid #e2e8f0', borderBottom: '4px solid #f97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#c2410c' }}>Total Media Batches</span>
            <FlaskConical style={{ color: '#ea580c', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#7c2d12', marginTop: '8px' }}>{totalMediaBatches}</div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f3e8ff', borderRadius: '12px', border: '1px solid #e2e8f0', borderBottom: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#7e22ce' }}>Total Batches</span>
            <Package style={{ color: '#9333ea', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#581c87', marginTop: '8px' }}>{totalBatches}</div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#fce7f3', borderRadius: '12px', border: '1px solid #e2e8f0', borderBottom: '4px solid #ec4899' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#be185d' }}>Total Bottles Processed</span>
            <Boxes style={{ color: '#db2777', width: '20px', height: '20px' }} />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: '900', color: '#831843', marginTop: '8px' }}>{totalBottles.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Media Batches Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Media Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Media Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Media Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Completed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mediaBatches.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    mediaBatches.map((media: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold">{media.media_code}</td>
                        <td className="px-4 py-3 text-sm">{media.media_type || '-'}</td>
                        <td className="px-4 py-3 text-sm">{media.media_total || '-'}</td>
                        <td className="px-4 py-3 text-sm">{media.completed_date ? new Date(media.completed_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Plant Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Batch Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Plant Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Current Bottles</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBatches.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    activeBatches.map((batch: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-bold">{batch.batch_code}</td>
                        <td className="px-4 py-3 text-sm">{batch.plant_name || '-'}</td>
                        <td className="px-4 py-3 text-sm">{batch.current_bottles}</td>
                        <td className="px-4 py-3 text-sm">{batch.created_date ? new Date(batch.created_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
