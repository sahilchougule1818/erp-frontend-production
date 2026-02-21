import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sprout, TreeDeciduous, ArrowRightLeft, AlertTriangle, Leaf, Package, Download, FileText } from 'lucide-react';
import { outdoorApi } from '../../services/outdoorApi';

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
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ status: '', plants: 0, days: 0 });

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      loadTimeline();
    }
  }, [selectedBatch]);

  const loadBatches = async () => {
    try {
      const [primary, secondary] = await Promise.all([
        outdoorApi.primaryHardening.getAll(),
        outdoorApi.secondaryHardening.getAll()
      ]);
      
      const allBatches = new Set<string>();
      primary.data.forEach((r: any) => allBatches.add(r.batch_code));
      secondary.data.forEach((r: any) => allBatches.add(r.batch_code));
      
      const batchList = Array.from(allBatches).sort();
      setBatches(batchList);
      if (batchList.length > 0) setSelectedBatch(batchList[0]);
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  };

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const [primary, secondary, shifting, mortality, fertilization, holding] = await Promise.all([
        outdoorApi.primaryHardening.getAll(),
        outdoorApi.secondaryHardening.getAll(),
        outdoorApi.shifting.getAll(),
        outdoorApi.outdoorMortality.getAll(),
        outdoorApi.fertilization.getAll(),
        outdoorApi.holdingArea.getAll()
      ]);

      const events: any[] = [];

      // Primary Hardening
      primary.data.filter((r: any) => r.batch_code === selectedBatch).forEach((r: any) => {
        events.push({
          type: 'primary',
          date: r.date,
          title: 'Primary Hardening Started',
          details: `${r.tunnel || 'N/A'}, ${r.tray || 'N/A'}, ${r.plants || 0} plants`,
          status: 'completed'
        });
      });

      // Secondary Hardening
      secondary.data.filter((r: any) => r.batch_code === selectedBatch).forEach((r: any) => {
        events.push({
          type: 'secondary',
          date: r.transfer_date,
          title: 'Secondary Hardening Transfer',
          details: `From ${r.from_location || 'N/A'} to ${r.to_bed || 'N/A'}, ${r.plants || 0} plants`,
          status: 'completed'
        });
      });

      // Shifting
      shifting.data.filter((r: any) => r.batch_code === selectedBatch).forEach((r: any) => {
        events.push({
          type: 'shifting',
          date: r.date,
          title: 'Location Shift',
          details: `${r.old_location || 'N/A'} → ${r.new_location || 'N/A'}, ${r.plants || 0} plants`,
          status: 'completed'
        });
      });

      // Mortality
      mortality.data.filter((r: any) => r.batch_code === selectedBatch).forEach((r: any) => {
        events.push({
          type: 'mortality',
          date: r.date,
          title: 'Mortality Event',
          details: `${r.affected_plants || 0} plants - ${r.mortality_type || 'Unknown'}`,
          status: 'alert'
        });
      });

      // Fertilization
      fertilization.data.filter((r: any) => r.batch_code === selectedBatch).forEach((r: any) => {
        events.push({
          type: 'fertilization',
          date: r.date,
          title: 'Fertilization Applied',
          details: `${r.materials_used || 'N/A'}, ${r.quantity || 'N/A'}`,
          status: 'completed'
        });
      });

      // Holding Area
      holding.data.filter((r: any) => r.batch_code === selectedBatch).forEach((r: any) => {
        events.push({
          type: 'holding',
          date: r.date,
          title: 'Moved to Holding Area',
          details: `${r.plants || 0} plants, Status: ${r.status || 'N/A'}`,
          status: 'active'
        });
      });

      // Sort by date
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setTimeline(events);

      // Calculate stats
      const latestHolding = holding.data.find((r: any) => r.batch_code === selectedBatch);
      const latestPrimary = primary.data.find((r: any) => r.batch_code === selectedBatch);
      const totalPlants = latestHolding?.plants || latestPrimary?.plants || 0;
      
      setStats({
        status: latestHolding ? 'Ready for Dispatch' : 'In Progress',
        plants: totalPlants,
        days: 0
      });

    } catch (error) {
      console.error('Error loading timeline:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-2">Select Batch</label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map(batch => (
                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-l border-gray-200 pl-4">
              <div className="text-sm text-gray-600 mb-1">Current Status</div>
              <div 
                className="inline-block px-3 py-1 rounded-md text-sm font-medium text-white"
                style={{ backgroundColor: '#4CAF50' }}
              >
                {stats.status}
              </div>
            </div>

            <div className="border-l border-gray-200 pl-4">
              <div className="text-sm text-gray-600 mb-1">Total Plants</div>
              <div className="text-2xl font-semibold">{stats.plants.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
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

      <Card className="p-6">
        <h2 className="mb-6">Batch Timeline — {selectedBatch}</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading timeline...</div>
        ) : timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No events found for this batch</div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {timeline.map((event, idx) => {
                const Icon = iconMap[event.type];
                return (
                  <div key={idx} className="relative flex gap-4">
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${colorMap[event.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 pb-6">
                      <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="text-sm text-gray-600 mt-1">{event.details}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">{event.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end mt-3 pt-3 border-t">
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
        )}
      </Card>
    </div>
  );
}
