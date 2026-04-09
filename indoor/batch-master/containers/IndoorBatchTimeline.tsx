import { Card } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../shared/ui/select';
import { FileText, Download } from 'lucide-react';
import { Badge } from '../../shared/ui/badge';
import { FlaskConical, Thermometer, TestTube, CheckCircle } from 'lucide-react';
import { useBatchTimeline } from '../hooks/useBatchTimeline';

const iconMap: { [key: string]: any } = {
  subculturing: FlaskConical,
  incubation: Thermometer,
  sampling: TestTube,
  completed: CheckCircle,
};

const colorMap: { [key: string]: string } = {
  subculturing: 'bg-blue-100 text-blue-600',
  incubation: 'bg-orange-100 text-orange-600',
  sampling: 'bg-purple-100 text-purple-600',
  completed: 'bg-green-100 text-green-600',
};

export function IndoorBatchTimeline() {
  const {
    selectedBatch,
    setSelectedBatch,
    batches,
    timeline,
    loading,
    stats,
    isAvailableForOutdoor,
    transferToOutdoor,
    undoOutdoorTransfer
  } = useBatchTimeline();

  const handleExport = () => {
    const html = `<html><head><style>body{font-family:Arial;padding:20px}h1{color:#16a34a}.timeline{margin:20px 0}.event{margin:10px 0;padding:10px;border:1px solid #ddd;border-radius:5px}</style></head><body><h1>Batch Timeline - ${selectedBatch}</h1><div class="timeline">${timeline.map(event => `<div class="event"><h3>${event.title}</h3><p>${event.details}</p><small>${event.date}</small></div>`).join('')}</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    Object.assign(a, { href: url, download: `batch-timeline-${selectedBatch}.html` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[200px]">
              <label className="block text-base text-gray-600 mb-2">Select Batch</label>
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
              <div className="text-base text-gray-600 mb-1">Current Status</div>
              <div 
                className={`inline-block px-3 py-1 rounded-md text-base font-medium text-white ${
                  stats.readyForOutdoor ? 'bg-green-600' : 'bg-blue-600'
                }`}
              >
                {stats.status}
              </div>
            </div>

            <div className="border-l border-gray-200 pl-4">
              <div className="text-base text-gray-600 mb-1">Current Stage</div>
              <div className="text-2xl font-semibold">{stats.stage}</div>
            </div>

            <div className="border-l border-gray-200 pl-4">
              <div className="text-base text-gray-600 mb-1">Total Bottles</div>
              <div className="text-2xl font-semibold">{stats.shoots.toLocaleString()}</div>
            </div>

            <div className="border-l border-gray-200 pl-4">
              {!isAvailableForOutdoor ? (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => transferToOutdoor(selectedBatch)}
                >
                  Transfer Batch to Outdoor
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => undoOutdoorTransfer(selectedBatch)}
                >
                  Undo Transfer
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <FileText className="w-4 h-4 mr-2" />
              Print Timeline
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading timeline...</div>
        ) : timeline.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No events found for this batch</div>
        ) : (
          <div>
            <h2 className="mb-6">Indoor Batch Timeline — {selectedBatch}</h2>
            
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
                        <div className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                          event.type === 'completed' ? 'border-green-200 bg-green-50' : ''
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-medium">{event.title}</h3>
                              <div className="text-base text-gray-600 mt-1">{event.details}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-base text-gray-500">{event.date}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <Badge 
                              className={
                                event.status === 'completed' 
                                  ? event.type === 'completed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                  : 'bg-blue-100 text-blue-700'
                              }
                            >
                              {event.status === 'completed' 
                                ? event.type === 'completed' 
                                  ? 'Transferred to Outdoor' 
                                  : 'Completed' 
                                : 'Active'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}