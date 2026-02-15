import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, FlaskConical, Package, TrendingUp, Download, Calendar, TestTube, Microscope } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import * as indoorApi from '../../services/indoorApi';

const STAT_CARDS = [
  { title: 'Total Operators', icon: Users, bgColor: 'bg-blue-50', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-600', key: 'length', suffix: '', desc: 'operators involved' },
  { title: 'Media Prepared', icon: FlaskConical, bgColor: 'bg-green-50', iconBg: 'bg-green-500/10', iconColor: 'text-green-600', key: 'media', suffix: ' L', desc: 'media prepared' },
  { title: 'Total Bottles', icon: Package, bgColor: 'bg-purple-50', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-600', key: 'bottles', suffix: '', desc: 'bottles processed' },
  { title: 'Total Shoots', icon: TrendingUp, bgColor: 'bg-orange-50', iconBg: 'bg-orange-500/10', iconColor: 'text-orange-600', key: 'shoots', suffix: '', desc: 'shoots generated' }
];

const TABLE_HEADERS = ['Operator', 'Media (L)', 'Media Types', 'Bottles', 'Shoots'];

export function IndoorDashboard() {
  const [data, setData] = useState({ autoclave: [], batches: [], subculture: [], incubation: [] });
  const [modal, setModal] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [exportRange, setExportRange] = useState({ from: '', to: '' });
  const [applied, setApplied] = useState({ from: '', to: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [autoclave, batches, subculture, incubation] = await Promise.all([
        indoorApi.getAutoclaveCycles(),
        indoorApi.getMediaBatches(),
        indoorApi.getSubculturing(),
        indoorApi.getIncubation()
      ]);
      setData({
        autoclave: autoclave.data || [],
        batches: batches.data || [],
        subculture: subculture.data || [],
        incubation: incubation.data || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setData({ autoclave: [], batches: [], subculture: [], incubation: [] });
    }
  };

  const isInRange = useCallback((date: string) => {
    if (!applied.from || !applied.to) return true;
    const d = new Date(date);
    return d >= new Date(applied.from) && d <= new Date(applied.to);
  }, [applied]);

  const mediaPrepStats = useMemo(() => {
    try {
      const operators = {};
      [...(data.autoclave || []), ...(data.batches || [])]
        .filter(r => isInRange(r.date))
        .forEach(r => {
          const opName = r.operator_name;
          if (!opName) return;
          const op = operators[opName] ||= { name: opName, media: 0, types: new Set(), cycles: 0, contamination: 0, total: 0 };
          if (r.media_total) op.media += parseFloat(r.media_total) || 0;
          if (r.type_of_media) op.types.add(r.type_of_media);
          if (r.autoclave_on_time) op.cycles += 1;
          if (r.contamination && r.contamination !== 'None') op.contamination += 1;
          if (r.bottles) op.total += 1;
        });
      return Object.values(operators).map(o => ({ 
        ...o, 
        types: Array.from(o.types),
        contaminationRate: o.total > 0 ? ((o.contamination / o.total) * 100).toFixed(1) : '0'
      }));
    } catch (error) {
      console.error('Error in mediaPrepStats:', error);
      return [];
    }
  }, [data, isInRange]);

  const labOpsStats = useMemo(() => {
    try {
      const operators = {};
      [...(data.subculture || []), ...(data.incubation || [])]
        .filter(r => isInRange(r.transfer_date || r.subculture_date))
        .forEach(r => {
          const opName = r.operator_name;
          if (!opName) return;
          const op = operators[opName] ||= { name: opName, bottles: 0, shoots: 0, batches: 0, mortality: 0 };
          if (r.no_of_bottles) op.bottles += r.no_of_bottles;
          if (r.no_of_shoots) op.shoots += r.no_of_shoots;
          if (r.mortality && r.mortality !== 'Low') op.mortality += 1;
          op.batches += 1;
        });
      return Object.values(operators);
    } catch (error) {
      console.error('Error in labOpsStats:', error);
      return [];
    }
  }, [data, isInRange]);

  const totals = useMemo(() => {
    const allOps = [...mediaPrepStats, ...labOpsStats];
    const uniqueOps = new Set(allOps.map(o => o.name));
    return {
      operators: uniqueOps.size,
      media: mediaPrepStats.reduce((acc, s) => acc + s.media, 0),
      bottles: labOpsStats.reduce((acc, s) => acc + s.bottles, 0),
      shoots: labOpsStats.reduce((acc, s) => acc + s.shoots, 0)
    };
  }, [mediaPrepStats, labOpsStats]);

  const handleViewReport = useCallback(() => {
    setApplied(dateRange);
    setDateModal(false);
  }, [dateRange]);

  const handleExport = useCallback(() => {
    const html = `<html><head><style>table{border-collapse:collapse;width:100%;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2}h3{color:#16a34a;margin-top:30px}</style></head><body><h2>Indoor Dashboard Report</h2><p>Date Range: ${exportRange.from || 'All'} to ${exportRange.to || 'All'}</p><h3>🧪 Media Preparation Team</h3><table><thead><tr><th>Operator</th><th>Media (L)</th><th>Media Types</th><th>Cycles</th><th>Contamination</th></tr></thead><tbody>${mediaPrepStats.map(s => `<tr><td>${s.name}</td><td>${s.media.toFixed(1)} L</td><td>${s.types.join(', ')}</td><td>${s.cycles}</td><td>${s.contaminationRate}%</td></tr>`).join('')}</tbody></table><h3>🔬 Lab Operations Team</h3><table><thead><tr><th>Operator</th><th>Bottles</th><th>Shoots</th><th>Batches</th><th>Success Rate</th></tr></thead><tbody>${labOpsStats.map(s => `<tr><td>${s.name}</td><td>${s.bottles}</td><td>${s.shoots}</td><td>${s.batches}</td><td>${s.successRate}%</td></tr>`).join('')}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `indoor-dashboard_${exportRange.from || 'all'}_to_${exportRange.to || 'all'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setModal(false);
    setExportRange({ from: '', to: '' });
  }, [exportRange, mediaPrepStats, labOpsStats]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold">Indoor Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Dialog open={modal} onOpenChange={setModal}>
            <DialogTrigger asChild>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Export Data</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input type="date" value={exportRange.from} onChange={(e) => setExportRange({ ...exportRange, from: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input type="date" value={exportRange.to} onChange={(e) => setExportRange({ ...exportRange, to: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setModal(false); setExportRange({ from: '', to: '' }); }}>Cancel</Button>
                {exportRange.from && exportRange.to && (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleExport}>Download</Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dateModal} onOpenChange={setDateModal}>
            <DialogTrigger asChild>
              <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Date Range</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Select Date Range</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
                </div>
                {dateRange.from && dateRange.to && (
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleViewReport}>View Report</Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ title, icon: Icon, bgColor, iconBg, iconColor, key, suffix, desc }) => {
          const value = key === 'length' ? totals.operators : totals[key];
          const display = key === 'media' ? value.toFixed(1) : value.toLocaleString();
          return (
            <Card key={title} className={bgColor}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-normal text-gray-500">{title}</CardTitle>
                <div className={`${iconBg} rounded-full p-2`}><Icon className={`h-5 w-5 ${iconColor}`} /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{display}{suffix}</div>
                <p className="text-xs text-gray-500">{desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-green-600" />
            <CardTitle>Media Preparation Team</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Operator</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Media Prepared</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Media Types</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Autoclave Cycles</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Contamination Rate</th>
                </tr>
              </thead>
              <tbody>
                {mediaPrepStats.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No data available</td></tr>
                ) : (
                  mediaPrepStats.map((s: any, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">{s.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><Badge className="bg-green-100 text-green-700">{s.media.toFixed(1)} L</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.types.map((t: string, j: number) => <Badge key={j} variant="outline" className="text-xs">{t}</Badge>)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{s.cycles}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge className={parseFloat(s.contaminationRate) > 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {s.contaminationRate}%
                        </Badge>
                      </td>
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
          <div className="flex items-center gap-2">
            <Microscope className="w-5 h-5 text-blue-600" />
            <CardTitle>Lab Operations Team</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Operator</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Bottles Processed</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Shoots Generated</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Batches Handled</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">Mortality</th>
                </tr>
              </thead>
              <tbody>
                {labOpsStats.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No data available</td></tr>
                ) : (
                  labOpsStats.map((s: any, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">{s.name}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{s.bottles.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-green-700 font-semibold whitespace-nowrap">{s.shoots.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{s.batches}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{s.mortality}</td>
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
