import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FlaskConical, Thermometer, TestTube, CheckCircle, FileText, Download, ArrowLeft } from 'lucide-react';
import * as indoorApi from '../../services/indoorApi';

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
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ status: '', shoots: 0, stage: '', readyForOutdoor: false });
  const [isAvailableForOutdoor, setIsAvailableForOutdoor] = useState(false);

  const transferToOutdoor = async (batchCode: string) => {
    console.log('Transferring batch to outdoor:', batchCode);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/batches/transfer-to-outdoor/${batchCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Transfer response:', response.status);
      if (response.ok) {
        alert('Batch marked as available for outdoor!');
        loadTimeline(); // Reload to show updated status
      } else {
        const errorText = await response.text();
        console.error('Transfer failed:', errorText);
        alert('Failed to mark batch for outdoor');
      }
    } catch (error) {
      console.error('Error marking batch for outdoor:', error);
      alert('Error marking batch for outdoor');
    }
  };
  
  const undoOutdoorTransfer = async (batchCode: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/batches/undo-outdoor-transfer/${batchCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Outdoor availability removed!');
        loadTimeline(); // Reload to show updated status
      } else {
        alert('Failed to undo outdoor transfer');
      }
    } catch (error) {
      console.error('Error undoing outdoor transfer:', error);
      alert('Error undoing outdoor transfer');
    }
  };

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
      const subculturing = await indoorApi.getSubculturing();
      console.log('Subculturing data:', subculturing);
      const allBatches = new Set<string>();
      if (subculturing.data && Array.isArray(subculturing.data)) {
        subculturing.data.forEach((r: any) => {
          if (r.batch_code) allBatches.add(r.batch_code);
        });
      }
      
      const batchList = Array.from(allBatches).sort();
      console.log('Batch list:', batchList);
      setBatches(batchList);
      if (batchList.length > 0) setSelectedBatch(batchList[0]);
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  };

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const [subculturing, incubation, sampling] = await Promise.all([
        indoorApi.getSubculturing(),
        indoorApi.getIncubation(),
        indoorApi.getSampling()
      ]);

      const events: any[] = [];

      // Subculturing events
      subculturing.data
        .filter((r: any) => r.batch_code === selectedBatch)
        .forEach((r: any) => {
          events.push({
            type: 'subculturing',
            date: r.transfer_date,
            title: `Subculturing - ${r.stage_number}`,
            details: `${r.no_of_shoots || 0} shoots, ${r.no_of_bottles || 0} bottles, Media: ${r.media_code || 'N/A'}`,
            status: 'completed',
            stage: r.stage_number,
            shoots: r.no_of_shoots || 0
          });
        });

      // Incubation events
      incubation.data
        .filter((r: any) => r.batch_code === selectedBatch)
        .forEach((r: any) => {
          events.push({
            type: 'incubation',
            date: r.subculture_date,
            title: `Incubation - ${r.stage}`,
            details: `${r.no_of_shoots || 0} shoots, Temp: ${r.temp || 'N/A'}, Humidity: ${r.humidity || 'N/A'}`,
            status: 'completed',
            stage: r.stage,
            shoots: r.no_of_shoots || 0
          });
        });

      // Sampling events
      sampling.data
        .filter((r: any) => r.batch_code === selectedBatch)
        .forEach((r: any) => {
          events.push({
            type: 'sampling',
            date: r.sample_date,
            title: `Sampling - ${r.stage}`,
            details: `Status: ${r.status || 'N/A'}, Certificate: ${r.govt_certificate || 'N/A'}`,
            status: r.status === 'passed' ? 'completed' : 'active'
          });
        });

      // Sort by date
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Find latest subculturing stage
      const latestSubculturing = events
        .filter(e => e.type === 'subculturing')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      const currentStage = latestSubculturing?.stage || 'Stage-1';
      const currentShoots = latestSubculturing?.shoots || 0;
      const isStage8 = currentStage === 'Stage-8';
      
      console.log('Current stage:', currentStage);
      console.log('Is Stage 8:', isStage8);
      console.log('Latest subculturing:', latestSubculturing);

      // Check if batch is available for outdoor
      console.log('Checking outdoor availability for batch:', selectedBatch);
      const outdoorEntry = subculturing.data.find((r: any) => 
        r.batch_code === selectedBatch && r.available_for_outdoor !== null
      );
      console.log('Outdoor entry found:', outdoorEntry);
      
      const isMarkedForOutdoor = !!outdoorEntry;
      setIsAvailableForOutdoor(isMarkedForOutdoor);
      
      // Add outdoor availability event if marked
      if (isMarkedForOutdoor) {
        events.push({
          type: 'completed',
          date: outdoorEntry.transfer_date,
          title: '✅ Made Available for Outdoor',
          details: `Batch ${selectedBatch} is available for outdoor operations`,
          status: 'outdoor-available',
          batchCode: selectedBatch
        });
      }

      setTimeline(events);
      console.log('Timeline events:', events);
      console.log('Latest subculturing:', latestSubculturing);
      console.log('Is Stage 8:', isStage8);
      setStats({
        status: `${currentStage} - Transfer Available`,
        shoots: currentShoots,
        stage: currentStage,
        readyForOutdoor: isStage8
      });

    } catch (error) {
      console.error('Error loading timeline:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Debug info */}
      <div className="text-sm text-gray-500">
        Batches loaded: {batches.length}, Selected: {selectedBatch}
      </div>
      
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
                className={`inline-block px-3 py-1 rounded-md text-sm font-medium text-white ${
                  stats.readyForOutdoor ? 'bg-green-600' : 'bg-blue-600'
                }`}
              >
                {stats.status}
              </div>
            </div>

            <div className="border-l border-gray-200 pl-4">
              <div className="text-sm text-gray-600 mb-1">Current Stage</div>
              <div className="text-2xl font-semibold">{stats.stage}</div>
            </div>

            <div className="border-l border-gray-200 pl-4">
              <div className="text-sm text-gray-600 mb-1">Total Shoots</div>
              <div className="text-2xl font-semibold">{stats.shoots.toLocaleString()}</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-end">
            {selectedBatch && !isAvailableForOutdoor && (
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => transferToOutdoor(selectedBatch)}
              >
                Make Available for Outdoor
              </Button>
            )}
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
        <h2 className="mb-6">Indoor Batch Timeline — {selectedBatch}</h2>

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
                      <div className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                        event.type === 'completed' ? 'border-green-200 bg-green-50' : ''
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="text-sm text-gray-600 mt-1">{event.details}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">{event.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div>
                            {event.status === 'outdoor-available' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => undoOutdoorTransfer(event.batchCode)}
                              >
                                Undo
                              </Button>
                            )}
                          </div>
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
                                ? 'Ready for Outdoor' 
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
        )}
      </Card>
    </div>
  );
}