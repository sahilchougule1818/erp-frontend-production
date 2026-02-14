import { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sprout, TreeDeciduous, ArrowRightLeft, AlertTriangle, Leaf, Package, Download, FileText } from 'lucide-react';

const timelineData = [
  {
    id: 1,
    type: 'primary',
    date: '2024-11-01',
    time: '09:30',
    title: 'Primary Hardening Started',
    details: 'Tunnel T1, Tray 12, 1200 plants',
    actor: 'Rajesh Kumar',
    status: 'completed'
  },
  {
    id: 2,
    type: 'fertilization',
    date: '2024-11-05',
    time: '14:00',
    title: 'Fertilization Applied',
    details: 'NPK 19:19:19, 5kg',
    actor: 'Priya Sharma',
    status: 'completed'
  },
  {
    id: 3,
    type: 'shifting',
    date: '2024-11-08',
    time: '10:15',
    title: 'Location Shift',
    details: 'T1/Tray 12 → T2/Tray 8',
    actor: 'Amit Patel',
    status: 'completed'
  },
  {
    id: 4,
    type: 'mortality',
    date: '2024-11-10',
    time: '11:00',
    title: 'Mortality Event',
    details: '12 plants - Bacterial infection',
    actor: 'Dr. Sharma',
    status: 'alert'
  },
  {
    id: 5,
    type: 'secondary',
    date: '2024-11-15',
    time: '09:00',
    title: 'Secondary Hardening Transfer',
    details: 'Transferred to Bed B1, 1188 plants',
    actor: 'Rajesh Kumar',
    status: 'completed'
  },
  {
    id: 6,
    type: 'holding',
    date: '2024-11-18',
    time: '15:30',
    title: 'Moved to Holding Area',
    details: '1188 plants ready for dispatch',
    actor: 'Sneha Reddy',
    status: 'active'
  },
];

const iconMap: { [key: string]: any } = {
  primary: Sprout,
  secondary: TreeDeciduous,
  shifting: ArrowRightLeft,
  mortality: AlertTriangle,
  fertilization: Leaf,
  holding: Package,
};

const colorMap: { [key: string]: string } = {
  primary: 'bg-green-100 text-green-600',
  secondary: 'bg-blue-100 text-blue-600',
  shifting: 'bg-purple-100 text-purple-600',
  mortality: 'bg-red-100 text-red-600',
  fertilization: 'bg-emerald-100 text-emerald-600',
  holding: 'bg-amber-100 text-amber-600',
};

export function BatchTimeline() {
  const [selectedBatch, setSelectedBatch] = useState('b2024-1145');

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-2">Select Batch</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2024-1145">B-2024-1145 (Rose)</SelectItem>
                  <SelectItem value="b2024-1144">B-2024-1144 (Gerbera)</SelectItem>
                  <SelectItem value="b2024-1143">B-2024-1143 (Carnation)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-l border-gray-200 pl-4">
              <div className="text-sm text-gray-600 mb-1">Current Status</div>
              <div 
                className="inline-block px-3 py-1 rounded-md text-sm font-medium text-white"
                style={{ backgroundColor: '#4CAF50' }}
              >
                In Holding Area
              </div>
            </div>

            <div className="border-l border-gray-200 pl-4">
              <div className="text-sm text-gray-600 mb-1">Total Plants</div>
              <div className="text-2xl font-semibold">1,188</div>
            </div>

            <div className="border-l border-gray-200 pl-4">
              <div className="text-sm text-gray-600 mb-1">Days Active</div>
              <div className="text-2xl font-semibold">17</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Print Timeline
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h2 className="mb-6">Batch Timeline — B-2024-1145</h2>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Timeline Events */}
          <div className="space-y-6">
            {timelineData.map((event) => {
              const Icon = iconMap[event.type];
              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${colorMap[event.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <div className="text-sm text-gray-600 mt-1">{event.details}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{event.date}</div>
                          <div className="text-xs text-gray-400">{event.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-600">
                          By: <span className="font-medium text-gray-900">{event.actor}</span>
                        </div>
                        <Badge 
                          className={
                            event.status === 'completed' 
                              ? 'bg-gray-100 text-gray-700' 
                              : event.status === 'alert'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }
                        >
                          {event.status === 'completed' ? 'Completed' : event.status === 'alert' ? 'Alert' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
