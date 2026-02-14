import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, FlaskConical, Package, TrendingUp, Download, Calendar } from 'lucide-react';
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
        autoclave: autoclave.data,
        batches: batches.data,
        subculture: subculture.data,
        incubation: incubation.data
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewReport = () => {
    setApplied(dateRange);
    setDateModal(false);
  };

  const handleExport = () => {
    const html = `<html><head><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f2f2f2}</style></head><body><h2>Indoor Dashboard Report</h2><p>Date Range: ${exportRange.from || 'All'} to ${exportRange.to || 'All'}</p><table><thead><tr>${TABLE_HEADERS.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${stats.map(s => `<tr><td>${s.name}</td><td>${s.media.toFixed(1)} L</td><td>${s.types.join(', ')}</td><td>${s.vessels}</td><td>${s.shoots}</td></tr>`).join('')}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `indoor-dashboard_${exportRange.from || 'all'}_to_${exportRange.to || 'all'}.html`;
    a.click();
    setModal(false);
    setExportRange({ from: '', to: '' });
  };

  const isInRange = (date: string) => {
    if (!applied.from || !applied.to) return true;
    const d = new Date(date);
    return d >= new Date(applied.from) && d <= new Date(applied.to);
  };

  const stats = useMemo(() => {
    const operators = {};
    [...data.autoclave, ...data.batches, ...data.subculture, ...data.incubation]
      .filter(r => isInRange(r.date || r.transfer_date || r.subculture_date))
      .forEach(r => {
        const opName = r.operator_name;
        if (!opName) return;
        const op = operators[opName] ||= { name: opName, media: 0, bottles: 0, vessels: 0, shoots: 0, types: new Set() };
        if (r.media_total) op.media += parseFloat(r.media_total) || 0;
        if (r.type_of_media) op.types.add(r.type_of_media);
        if (r.bottles) op.bottles += r.bottles;
        if (r.no_of_bottles) op.vessels += r.no_of_bottles;
        if (r.no_of_shoots) op.shoots += r.no_of_shoots;
      });
    return Object.values(operators).map(o => ({ ...o, types: Array.from(o.types) }));
  }, [data, applied]);

  const totals = useMemo(() => 
    stats.reduce((acc, s) => ({
      media: acc.media + s.media,
      bottles: acc.bottles + s.bottles,
      vessels: acc.vessels + s.vessels,
      shoots: acc.shoots + s.shoots
    }), { media: 0, bottles: 0, vessels: 0, shoots: 0 })
  , [stats]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Indoor Dashboard</h1>
        <div className="flex gap-2">
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

      <div className="grid grid-cols-4 gap-4">
        {STAT_CARDS.map(({ title, icon: Icon, bgColor, iconBg, iconColor, key, suffix, desc }) => {
          const value = key === 'length' ? stats.length : totals[key];
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
        <CardHeader><CardTitle>Operator Performance Report</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {TABLE_HEADERS.map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {stats.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No data available</td></tr>
                ) : (
                  stats.map((s: any, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{s.name}</td>
                      <td className="px-4 py-3"><Badge className="bg-green-100 text-green-700">{s.media.toFixed(1)} L</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.types.map((t: string, j: number) => <Badge key={j} variant="outline" className="text-xs">{t}</Badge>)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{s.vessels.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-green-700">{s.shoots.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
