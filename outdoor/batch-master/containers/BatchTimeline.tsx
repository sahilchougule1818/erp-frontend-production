import { useState, useEffect } from 'react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/ui/select';
import { FileText, Download, TreePine, Sprout, ArrowRightLeft, Droplet, Package, Box } from 'lucide-react';
import { Badge } from '../../../shared/ui/badge';
import apiClient from '../../../shared/services/apiClient';
import { useSearchParams } from 'react-router-dom';

const getPhaseIcon = (phase: string, eventType: string) => {
  if (eventType === 'IMPORT') {
    return Sprout; // Primary hardening icon for import
  }
  if (eventType === 'SHIFT') {
    return ArrowRightLeft;
  }
  if (eventType === 'TRANSITION') {
    const phaseStr = phase?.toLowerCase() || '';
    if (phaseStr.includes('secondary') || phaseStr === 'secondary_hardening') {
      return TreePine;
    }
    if (phaseStr.includes('holding') || phaseStr === 'holding_area') {
      return Box;
    }
  }
  return Package;
};

const getPhaseColor = (phase: string, eventType: string) => {
  if (eventType === 'IMPORT') {
    return 'bg-green-100 text-green-600'; // Primary hardening color
  }
  if (eventType === 'SHIFT') {
    return 'bg-purple-100 text-purple-600';
  }
  if (eventType === 'TRANSITION') {
    const phaseStr = phase?.toLowerCase() || '';
    if (phaseStr.includes('holding') || phaseStr === 'holding_area') {
      return 'bg-orange-100 text-orange-600';
    }
    if (phaseStr.includes('secondary') || phaseStr === 'secondary_hardening') {
      return 'bg-blue-100 text-blue-600'; // Secondary hardening color
    }
  }
  return 'bg-gray-100 text-gray-600';
};

export function BatchTimeline() {
  const [searchParams] = useSearchParams();
  const batchFromUrl = searchParams.get('batch');
  
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (batchFromUrl && batches.includes(batchFromUrl)) {
      setSelectedBatch(batchFromUrl);
    }
  }, [batchFromUrl, batches]);

  useEffect(() => {
    if (selectedBatch) {
      fetchTimeline();
      fetchStats();
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const data = await apiClient.get('/outdoor/batch-timeline/batches');
      const batchCodes = Array.isArray(data) ? data.map((b: any) => b.batch_code) : [];
      setBatches(batchCodes);
      if (batchCodes.length > 0) setSelectedBatch(batchCodes[0]);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatches([]);
    }
  };

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get(`/outdoor/batch-timeline/${selectedBatch}`);
      setTimeline(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.get(
        `/outdoor/batch-timeline/${selectedBatch}/stats`
      );
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    }
  };

  const handleExport = () => {
    const html = `<html><head><style>body{font-family:Arial;padding:20px}h1{color:#16a34a}.timeline{margin:20px 0}.event{margin:10px 0;padding:10px;border:1px solid #ddd;border-radius:5px}</style></head><body><h1>Batch Timeline - ${selectedBatch}</h1><div class="timeline">${timeline.map(event => `<div class="event"><h3>${event.event_type} - ${event.phase}</h3><p>Plants: ${event.plants || 'N/A'}, Tunnel: ${event.tunnel || 'N/A'}</p><small>${new Date(event.created_at).toLocaleString()}</small></div>`).join('')}</div></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    Object.assign(a, { href: url, download: `batch-timeline-${selectedBatch}.html` });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Batch Timeline</h1>
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

            {stats && (
              <>
                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Current Phase</div>
                  <div className="text-lg font-semibold">
                    {stats.current_phase
                      ?.replace(/_/g, ' ')
                      .replace(/\b\w/g, (c: string) => c.toUpperCase()) 
                      || 'N/A'}
                  </div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Current Tunnel</div>
                  <div className="text-lg font-semibold">{stats.current_tunnel || 'N/A'}</div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">
                    Current Age
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {stats.current_age ?? 0} days
                  </div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Total Plants</div>
                  <div className="text-xl font-semibold">{stats.plants?.toLocaleString() || 0}</div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Total Mortality</div>
                  <div className="text-xl font-semibold text-red-600">
                    {stats.total_mortality?.toLocaleString() || 0}
                  </div>
                </div>

                <div className="border-l border-gray-200 pl-4">
                  <div className="text-base text-gray-600 mb-1">Net Plants</div>
                  <div className="text-xl font-semibold text-green-600">{stats.total_plants?.toLocaleString() || 0}</div>
                </div>
              </>
            )}
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
            <h2 className="mb-6 text-xl font-semibold">Outdoor Batch Timeline — {selectedBatch}</h2>
            
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-6">
                {timeline.map((event, idx) => {
                  const Icon = getPhaseIcon(event.phase, event.event_type);
                  const phaseColor = getPhaseColor(event.phase, event.event_type);
                  const eventLabel =
                    event.event_type === 'IMPORT'
                      ? (idx === 0
                          ? `Import to Primary Hardening`
                          : `Import to ${event.phase}`)
                    : event.event_type === 'SHIFT'
                      ? `Shift within ${event.phase}`
                    : event.event_type === 'TRANSITION'
                      ? `Transition to ${event.phase}`
                    : event.event_type;
                  return (
                    <div key={idx} className="relative flex gap-4">
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${phaseColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 pb-6">
                        <div className="bg-white border rounded-lg p-4
                          shadow-sm hover:shadow-md transition-shadow">

                          {/* Row 1: Title + Date */}
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-medium">{eventLabel}</h3>
                            <div className="text-base text-gray-500">
                              {new Date(event.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Row 2: Main details — left: tunnel/plants/activities, right: age metrics */}
                          <div className="bg-gray-50 rounded-md p-3 flex gap-6 text-base text-gray-600 mb-3">

                            {/* Left column — tunnel, plants, mortality, fertilization */}
                            <div className="flex flex-col gap-2 flex-1">
                              {event.tunnel && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 min-w-[60px]">Tunnel</span>
                                  <span className="font-semibold text-gray-800">{event.tunnel}</span>
                                </div>
                              )}
                              {event.plants && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 min-w-[60px]">Plants</span>
                                  <span className="font-semibold text-gray-800">{event.plants}</span>
                                </div>
                              )}
                              {event.mortality_count > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 min-w-[60px]">Mortality</span>
                                  <span className="font-semibold text-red-600">{event.mortality_count}</span>
                                </div>
                              )}
                              {event.fertilizations && event.fertilizations.length > 0 && (
                                <div className="mt-1 pt-2 border-t border-gray-200">
                                  <div className="text-gray-400 text-base mb-1.5">Fertilization:</div>
                                  {event.fertilizations.map((fert: any, fertIdx: number) => (
                                    <div key={fertIdx} className="flex items-center gap-1.5 text-base mb-1">
                                      <Droplet className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                      <span className="font-medium text-gray-800">{fert.fertilizer_name}</span>
                                      <span className="text-gray-500">({fert.quantity})</span>
                                      <span className="text-gray-400 text-base ml-auto">
                                        {new Date(fert.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right column — age metrics only */}
                            <div className="flex flex-col gap-1.5 items-end min-w-[180px]">
                              {event.age_at_arrival !== null && event.age_at_arrival !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-base">Age at Arrival</span>
                                  <span className="px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-base font-semibold text-green-700">
                                    {event.age_at_arrival} days
                                  </span>
                                </div>
                              )}
                              {event.age_at_departure !== null && event.age_at_departure !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-base">Age at Departure</span>
                                  <span className="px-2 py-0.5 bg-orange-50 border border-orange-200 rounded-full text-base font-semibold text-orange-600">
                                    {event.age_at_departure} days
                                  </span>
                                </div>
                              )}
                              {event.age_at_arrival !== null && event.age_at_departure !== null &&
                               event.age_at_arrival !== undefined && event.age_at_departure !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 text-base">Time in Tunnel</span>
                                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-base font-semibold text-blue-700">
                                    {event.age_at_departure - event.age_at_arrival} days
                                  </span>
                                </div>
                              )}
                            </div>
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
