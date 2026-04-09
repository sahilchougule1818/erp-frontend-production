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
        <div className="p-5 bg-green-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-green-800 uppercase tracking-wider">Total Media Batches</span>
            <FlaskConical className="text-green-600 w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-green-900 mt-2">{totalMediaBatches}</div>
        </div>

        <div className="p-5 bg-teal-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">Total Batches</span>
            <Package className="text-teal-600 w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-teal-900 mt-2">{totalBatches}</div>
        </div>

        <div className="p-5 bg-blue-50 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Total Bottles Processed</span>
            <Boxes className="text-blue-600 w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-blue-900 mt-2">{totalBottles.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Media Batches Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Media Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Media Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Media Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediaBatches.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-base text-gray-500">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      mediaBatches.map((media: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-base">{media.media_code}</td>
                          <td className="px-4 py-3 text-base">{media.media_type || '—'}</td>
                          <td className="px-4 py-3 text-base">{media.media_total || '—'}</td>
                          <td className="px-4 py-3 text-base">{media.completed_date ? new Date(media.completed_date).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Active Plant Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plant Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Bottles</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBatches.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-base text-gray-500">
                          No data available
                        </td>
                      </tr>
                    ) : (
                      activeBatches.map((batch: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-base">{batch.batch_code}</td>
                          <td className="px-4 py-3 text-base">{batch.plant_name || '—'}</td>
                          <td className="px-4 py-3 text-base">{batch.current_bottles}</td>
                          <td className="px-4 py-3 text-base">{batch.created_date ? new Date(batch.created_date).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
