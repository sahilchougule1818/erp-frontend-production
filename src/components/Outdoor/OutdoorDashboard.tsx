import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { TreeDeciduous, AlertTriangle, Package, Sprout } from 'lucide-react';

const tunnelData = [
  { id: 'T1', name: 'Tunnel T1', occupied: 85, capacity: 100, status: 'normal' },
  { id: 'T2', name: 'Tunnel T2', occupied: 92, capacity: 100, status: 'normal' },
  { id: 'T3', name: 'Tunnel T3', occupied: 78, capacity: 100, status: 'mortality' },
  { id: 'T4', name: 'Tunnel T4', occupied: 65, capacity: 100, status: 'normal' },
];

export function OutdoorDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg text-green-600 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <Badge variant="outline" className="text-green-700 px-2 py-0.5 text-xs font-medium">Active</Badge>
          </div>
          <div className="text-2xl font-bold mb-0.5">24</div>
          <div className="text-xs text-gray-600">Batches in Primary</div>
        </Card>

        <Card className="p-4 bg-blue-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg text-blue-600 flex items-center justify-center">
              <TreeDeciduous className="w-4 h-4" />
            </div>
            <Badge variant="outline" className="text-blue-700 px-2 py-0.5 text-xs font-medium">Active</Badge>
          </div>
          <div className="text-2xl font-bold mb-0.5">18</div>
          <div className="text-xs text-gray-600">Batches in Secondary</div>
        </Card>

        <Card className="p-4 bg-orange-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg text-amber-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <Badge variant="outline" className="text-amber-700 px-2 py-0.5 text-xs font-medium">Holding</Badge>
          </div>
          <div className="text-2xl font-bold mb-0.5">6</div>
          <div className="text-xs text-gray-600">Unsold Batches</div>
        </Card>

        <Card className="p-4 bg-red-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <Badge variant="outline" className="text-red-700 px-2 py-0.5 text-xs font-medium">Alert</Badge>
          </div>
          <div className="text-2xl font-bold mb-0.5">47</div>
          <div className="text-xs text-gray-600">Mortality Cases Today</div>
        </Card>
      </div>

      {/* Tunnel Schematic */}
      <Card className="p-8 bg-white border-0 shadow-none">
        <h2 className="text-2xl font-bold mb-8">Tunnel Schematic Overview</h2>
        
        <div className="grid grid-cols-4 gap-4 mb-8">
          {tunnelData.map((tunnel) => (
            <div 
              key={tunnel.id}
              className={`p-6 rounded-xl border transition-all ${
                tunnel.status === 'mortality' 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-green-300 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-base">{tunnel.name}</h3>
                {tunnel.status === 'mortality' && (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between text-xs mb-2 text-gray-600">
                  <span>Occupancy</span>
                  <span className="font-semibold text-gray-900">{tunnel.occupied}/{tunnel.capacity}</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      tunnel.status === 'mortality' ? 'bg-red-400' : 'bg-green-500'
                    }`}
                    style={{ width: `${(tunnel.occupied / tunnel.capacity) * 100}%` }}
                  />
                </div>
              </div>

              {/* Tray Grid Preview */}
              <div className="grid grid-cols-5 gap-1.5 mb-5 mt-4">
                {Array.from({ length: 20 }).map((_, i) => {
                  const occupiedTrays = Math.floor((tunnel.occupied / tunnel.capacity) * 20);
                  const isOccupied = i < occupiedTrays;
                  
                  let bgColor = '#d1d5db'; // gray-300 for empty
                  if (isOccupied) {
                    bgColor = tunnel.status === 'mortality' ? '#f87171' : '#22c55e'; // red-400 or green-500
                  }
                  
                  return (
                    <div
                      key={i}
                      className="h-6 rounded"
                      style={{ backgroundColor: bgColor }}
                    />
                  );
                })}
              </div>

              <div className="text-xs text-gray-500 text-center">
                Click to expand tray details
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-6 justify-start text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-gray-700">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#d1d5db' }} />
            <span className="text-gray-700">Empty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f87171' }} />
            <span className="text-gray-700">Mortality Alert</span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Transfers</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-sm">B-2024-1145</div>
                <div className="text-xs text-gray-600 mt-0.5">Primary → Secondary</div>
              </div>
              <div className="text-xs text-gray-500">2h ago</div>
            </div>
            <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-sm">B-2024-1144</div>
                <div className="text-xs text-gray-600 mt-0.5">T1 Tray 5 → T2 Tray 3</div>
              </div>
              <div className="text-xs text-gray-500">5h ago</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Mortality Alerts</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-sm text-red-900">T3 - Batch B-2024-1142</div>
                <div className="text-xs text-red-700 mt-0.5">47 plants - Fungal infection</div>
              </div>
              <Badge className="bg-red-600 text-white px-2 py-0.5 text-xs border-0">New</Badge>
            </div>
            <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-sm text-amber-900">T2 - Batch B-2024-1140</div>
                <div className="text-xs text-amber-700 mt-0.5">12 plants - Under observation</div>
              </div>
              <Badge className="bg-amber-600 text-white px-2 py-0.5 text-xs border-0">Monitoring</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
