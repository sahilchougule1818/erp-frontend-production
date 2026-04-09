import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/tabs';
import { Tooltip, TooltipProvider } from '../../shared/ui/tooltip';
import { Button } from '../../shared/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '../../shared/ui/dropdown-menu';
import { Badge } from '../../shared/ui/badge';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction
} from '../../shared/ui/alert-dialog';
import {
  Upload, MoreHorizontal,
  ArrowRightLeft, ArrowUpRight, RotateCcw, TestTube, Droplet, Download, Lock, Skull, Clock
} from 'lucide-react';
import { DataTable }              from '../../shared/components/DataTable';
import { useBatchMaster }         from '../hooks/useBatchMaster';
import { ModalLayout }              from '../../shared/components/ModalLayout';
import { SampleForm }             from '../../sampling/forms/SampleForm';
import { ReportSampleForm }       from '../../sampling/forms/ReportSampleForm';
import { ShiftForm }              from '../../tunnels/forms/ShiftForm';
import { TransitionForm }         from '../../hardening/forms/TransitionForm';
import { ImportForm }             from '../forms/ImportForm';
import { QuickFertilizeForm }     from '../../fertilization/forms/QuickFertilizeForm';
import { MortalityForm }          from '../../mortality/forms/MortalityForm';
import { outdoorApi }             from '../../shared/services/outdoorApi';
import { useNotify }              from '../../shared/hooks/useNotify';
import { cn }                     from '../../shared/ui/utils';
import { TimelineModal } from '../components/TimelineModal';
import type { Batch } from '../../types/outdoor.types';

type ModalType =
  | 'SHIFT' | 'TRANSITION' | 'UNDO_CONFIRM' | 'DELETE_BATCH'
  | 'SAMPLE' | 'REPORT'
  | 'INDOOR_LIST' | 'FERTILIZE' | 'MORTALITY' | 'TIMELINE'
  | null;

const phaseLabel = (phase: string) => {
  const map: Record<string, string> = {
    primary_hardening:   'Primary Hardening',
    secondary_hardening: 'Secondary Hardening',
    holding_area:        'Holding Area',
  };
  return map[phase] ?? phase;
};

const phaseBadge = (batch: Batch) => {
  const color = batch.is_in_holding_area
    ? 'bg-orange-50 text-orange-700 border-orange-200'
    : batch.current_phase === 'primary_hardening'
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-blue-50 text-blue-700 border-blue-200';
  return (
    <Badge className={cn(color, "border shadow-none text-base")}>
      {phaseLabel(batch.current_phase)}
    </Badge>
  );
};

const sampledBadge = (val: string) => {
  const cfg =
    val === 'c' ? { label: 'Result Reported',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' } :
    val === 's' ? { label: 'Sample Sent',  cls: 'bg-amber-50 text-amber-700 border-amber-200' } :
                  { label: 'Not Sampled',    cls: 'bg-slate-50 text-slate-400 border-slate-200'   };
  return <Badge className={cn(cfg.cls, "border shadow-none text-base")}>{cfg.label}</Badge>;
};

const BatchMaster: React.FC = () => {
  const {
    batches, tunnels, workers, indoorBatches, loading,
    loadData, loadIndoorBatches, makeShift, phaseTransition,
    undoLastAction, recordFertilization,
    submitSample, reportSampleResult, importFromIndoor,
    pagination
  } = useBatchMaster();

  const [modal, setModal]                             = useState<ModalType>(null);
  const [selectedBatch, setSelected]                  = useState<Batch | null>(null);
  const [selectedIndoorBatch, setSelectedIndoorBatch] = useState<any>(null);
  const [undoPreview, setUndoPreview]                 = useState<any>(null);
  const [undoLockReasons, setUndoLockReasons]         = useState<Record<string, string[]>>({});
  const [timelineData, setTimelineData]               = useState<any[]>([]);
  const [timelineStats, setTimelineStats]             = useState<any>(null);

  const notify = useNotify();

  const openModal = (type: ModalType, batch: Batch) => { setSelected(batch); setModal(type); };
  const closeModal = () => { setModal(null); setSelected(null); setSelectedIndoorBatch(null); setUndoPreview(null); setTimelineData([]); setTimelineStats(null); };

  const handleUndoClick = async (batch: Batch) => {
    setSelected(batch);
    try {
      const raw = await outdoorApi.unified.getUndoPreview(batch.batch_code);
      const preview = raw.data || raw;
      setUndoPreview(preview);

      if (!preview.canUndo) {
        const msg = preview.lockReasons?.length
          ? preview.lockReasons.join(' · ')
          : preview.message || 'Undo is not available for this batch.';
        notify.error(msg);
        return;
      }

      if (preview.isFirstRecord) {
        setModal('DELETE_BATCH');
        return;
      }

      setModal('UNDO_CONFIRM');
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to get undo preview');
    }
  };

  const handleDropdownOpen = async (open: boolean, batch: Batch) => {
    if (!open) return;
    try {
      const raw = await outdoorApi.unified.getUndoPreview(batch.batch_code);
      const preview = raw.data || raw;
      setUndoLockReasons(prev => ({
        ...prev,
        [batch.batch_code]: preview.lockReasons ?? [],
      }));
    } catch {
      // silently ignore — undo button stays in default state
    }
  };

  const handleTimeline = async (batch: Batch) => {
    console.log('handleTimeline called for batch:', batch.batch_code);
    try {
      console.log('Fetching timeline data...');
      const [timeline, stats] = await Promise.all([
        outdoorApi.batchTimeline.getTimeline(batch.batch_code),
        outdoorApi.batchTimeline.getStats(batch.batch_code)
      ]);
      console.log('Timeline data:', timeline);
      console.log('Stats data:', stats);
      setTimelineData(timeline || []);
      setTimelineStats(stats || null);
      setSelected(batch);
      setModal('TIMELINE');
      console.log('Modal set to TIMELINE');
    } catch (error: any) {
      console.error('Timeline error:', error);
      notify.error(error.response?.data?.message || 'Failed to load timeline');
    }
  };

  const columns = [
    { key: 'batch_code',             label: 'Batch Code',    render: (v: string) => <span className="font-medium text-gray-900 text-base">{v}</span> },
    { key: 'created_at',             label: 'Created Date',  render: (v: string) => <span className="text-base">{v ? new Date(v).toLocaleDateString() : '—'}</span> },
    { key: 'plant_name',             label: 'Plant Name' },
    { key: 'current_phase',          label: 'Current Phase', render: (_: any, r: Batch) => phaseBadge(r) },
    { key: 'current_tunnel',            label: 'Tunnel',         render: (v: string) => <span className="text-slate-600 text-base">{v || '—'}</span> },
    { key: 'initial_plants',            label: 'Initial Plants', render: (v: number) => <span className="text-slate-600 text-base">{Number(v || 0).toLocaleString()}</span> },
    { key: 'total_mortality',           label: 'Mortality',      render: (v: number) => <span className={Number(v) > 0 ? 'font-semibold text-red-600 text-base' : 'text-slate-400 text-base'}>{Number(v || 0).toLocaleString()}</span> },
    { key: 'total_plants',              label: 'Alive Count',    render: (v: number) => <span className="text-slate-900 text-base">{Number(v || 0).toLocaleString()}</span> },
    { key: 'sold_plants',               label: 'Total Sold',     render: (v: number) => <span className={Number(v) > 0 ? 'font-semibold text-red-600 text-base' : 'text-slate-400 text-base'}>{Number(v || 0).toLocaleString()}</span> },
    { key: 'available_plants',          label: 'Available',      render: (v: number) => <span className="text-green-700 text-base">{v != null ? Number(v).toLocaleString() : '—'}</span> },
    { key: 'current_phase_sold',        label: 'Phase Sold',     render: (v: number) => <span className={Number(v) > 0 ? 'font-semibold text-rose-600 text-base' : 'text-slate-400 text-base'}>{Number(v || 0).toLocaleString()}</span> },
    { key: 'current_age',            label: 'Age (Days)',     render: (v: number) => <Badge variant="outline" className="text-slate-600 text-base bg-slate-50 border-slate-200">{v ?? 0} days</Badge> },
    { key: 'is_sampled',             label: 'Sampling',       render: (v: string) => sampledBadge(v) },
    { key: 'state',                  label: 'State',         render: (v: string) => {
      const config = {
        'SOLD': { label: 'Sold Out', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
        'HOLDING': { label: 'Holding', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
        'ACTIVE': { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      }[v] || { label: v, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
      return <Badge className={cn(config.cls, "border shadow-none text-sm uppercase tracking-tighter")}>{config.label}</Badge>;
    }},
    {
      key: '_actions',
      label: 'Actions',
      render: (_: any, batch: Batch) => (
        <DropdownMenu onOpenChange={(open) => handleDropdownOpen(open, batch)}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Batch Operations</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => handleTimeline(batch)}>
              <Clock className="h-4 w-4 mr-2" /> View Timeline
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            {batch.state === 'ACTIVE' ? (
              <DropdownMenuItem onClick={() => openModal('SHIFT', batch)}>
                <ArrowRightLeft className="h-4 w-4 mr-2" /> Shift Tunnel
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                <Lock className="h-4 w-4 mr-2" /> Shift Tunnel
              </DropdownMenuItem>
            )}
            
            {batch.state === 'ACTIVE' ? (
              <DropdownMenuItem onClick={() => openModal('TRANSITION', batch)}>
                <ArrowUpRight className="h-4 w-4 mr-2" /> Phase Transition
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                <Lock className="h-4 w-4 mr-2" /> Phase Transition
              </DropdownMenuItem>
            )}
            
            {batch.state !== 'SOLD' ? (
              <DropdownMenuItem onClick={() => openModal('FERTILIZE', batch)}>
                <Droplet className="h-4 w-4 mr-2" /> Fertilize
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                <Lock className="h-4 w-4 mr-2" /> Fertilize
              </DropdownMenuItem>
            )}
            
            {batch.state !== 'SOLD' ? (
              <DropdownMenuItem onClick={() => openModal('MORTALITY', batch)} className="text-red-600">
                <Skull className="h-4 w-4 mr-2" /> Record Mortality
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                <Lock className="h-4 w-4 mr-2" /> Record Mortality
              </DropdownMenuItem>
            )}
            
            {batch.is_sampled === 'n' && (
              batch.state === 'ACTIVE' ? (
                <DropdownMenuItem onClick={() => openModal('SAMPLE', batch)}>
                  <TestTube className="h-4 w-4 mr-2" /> Submit Sample
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                  <Lock className="h-4 w-4 mr-2" /> Submit Sample
                </DropdownMenuItem>
              )
            )}
            
            {batch.is_sampled === 's' && (
              batch.state === 'ACTIVE' ? (
                <DropdownMenuItem onClick={() => openModal('REPORT', batch)}>
                  <Download className="h-4 w-4 mr-2" /> Report Result
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                  <Lock className="h-4 w-4 mr-2" /> Report Result
                </DropdownMenuItem>
              )
            )}
            
            <DropdownMenuSeparator />
            
            {(undoLockReasons[batch.batch_code]?.length ?? 0) > 0 ? (
              <TooltipProvider>
                <Tooltip
                  side="left"
                  content={
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {undoLockReasons[batch.batch_code].map((r, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: '#f87171', marginTop: 1 }}>•</span>
                          <span style={{ color: '#f8fafc' }}>{r}</span>
                        </li>
                      ))}
                    </ul>
                  }
                >
                  <span className="block w-full">
                    <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                      <Lock className="h-4 w-4 mr-2" /> Undo Locked
                    </DropdownMenuItem>
                  </span>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <DropdownMenuItem onClick={() => handleUndoClick(batch)} className="text-rose-600">
                <RotateCcw className="h-4 w-4 mr-2" /> Undo Last Action
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Tabs defaultValue="master" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="master">Outdoor Batch Master</TabsTrigger>
        </TabsList>
        
        <TabsContent value="master">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border animate-pulse">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
              <p className="text-base text-slate-500 font-medium tracking-tight">Accessing encrypted registry...</p>
            </div>
          ) : (
            <DataTable
              title=""
              columns={columns}
              records={batches}
              filterConfig={{ filter1Key: 'plant_name', filter1Label: 'Plant Name', filter2Key: 'batch_code', filter2Label: 'Batch Code' }}
              exportFileName="outdoor_batch_registry"
              pagination={pagination}
              addButton={
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                  onClick={async () => { await loadIndoorBatches(); setModal('INDOOR_LIST'); }}
                >
                  <Upload className="h-4 w-4 mr-2" /> Import from Indoor
                </Button>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {modal === 'SHIFT' && selectedBatch && (
        <ShiftForm
          batch={selectedBatch}
          tunnels={tunnels}
          workers={workers}
          onSubmit={(data) => makeShift(selectedBatch.batch_code, data).then(ok => ok && closeModal())}
          onClose={closeModal}
        />
      )}

      {modal === 'TRANSITION' && selectedBatch && (
        <TransitionForm
          batch={selectedBatch}
          tunnels={tunnels}
          workers={workers}
          onSubmit={(data) =>
            phaseTransition(selectedBatch.batch_code, selectedBatch.current_tunnel ?? '', data)
              .then(ok => ok && closeModal())
          }
          onClose={closeModal}
        />
      )}

      {modal === 'UNDO_CONFIRM' && selectedBatch && undoPreview && (
        <AlertDialog open onOpenChange={(open: boolean) => { if (!open) closeModal(); }}>
          <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-slate-900">Restore Previous State?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-2">
                  <p className="font-medium text-slate-600 leading-relaxed">{undoPreview.undo_description}</p>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2 text-base shadow-inner">
                    <p className="text-indigo-900 font-bold flex justify-between">
                      Target Tunnel: <span>{undoPreview.previousState?.tunnel ?? 'N/A'}</span>
                    </p>
                    <p className="text-indigo-900 font-bold flex justify-between">
                      Target Phase: <span className="uppercase">{undoPreview.previousState?.phase?.replace(/_/g, ' ') ?? 'N/A'}</span>
                    </p>
                    <p className="text-indigo-900 font-bold flex justify-between">
                      Plant Count: <span>{undoPreview.previousState?.plants ?? 'N/A'}</span>
                    </p>
                  </div>
                  {undoPreview.willHaveCollision && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
                      <span className="text-orange-500 text-base mt-0.5">⚠</span>
                      <div>
                        <p className="text-base font-bold text-orange-800">Tunnel may be over capacity</p>
                        <p className="text-base text-orange-700 mt-0.5 leading-relaxed">
                          The log will be restored to tunnel {undoPreview.previousState?.tunnel}.
                          If the batch was physically moved, record a new shift after undoing.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 gap-3">
              <AlertDialogCancel className="rounded-xl font-black text-slate-400">Abort</AlertDialogCancel>
              <AlertDialogAction
                className="!bg-indigo-600 !hover:bg-indigo-700 !text-white rounded-xl font-black shadow-lg shadow-indigo-100"
                onClick={() => undoLastAction(selectedBatch.batch_code).then((ok: boolean) => ok && closeModal())}
              >
                Confirm Restoration
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {modal === 'DELETE_BATCH' && selectedBatch && (
        <AlertDialog open onOpenChange={(open: boolean) => { if (!open) closeModal(); }}>
          <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-rose-600 font-serif italic text-center">Caution: Irreversible Action</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-2">
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-inner">
                    <p className="text-base font-bold text-rose-800 leading-relaxed">
                      You are attempting to purge batch{' '}
                      <span className="font-black underline decoration-2">{selectedBatch.batch_code}</span> from the master records. 
                      This will erase all historical data associated with this entry.
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 flex-col sm:flex-row gap-3">
              <AlertDialogCancel className="rounded-xl font-black text-slate-400 border-none bg-slate-100">Cancel Request</AlertDialogCancel>
              <AlertDialogAction
                className="!bg-rose-600 !hover:bg-rose-700 !text-white rounded-xl font-black shadow-xl shadow-rose-100 px-8 h-12"
                onClick={() => undoLastAction(selectedBatch.batch_code).then(ok => ok && closeModal())}
              >
                Execute Purge
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {modal === 'SAMPLE' && selectedBatch && (
        <SampleForm
          batch={{ ...selectedBatch, current_tunnel: selectedBatch.current_tunnel ?? '' }}
          onSubmit={(data) =>
            submitSample(selectedBatch.batch_code, data).then(ok => ok && closeModal())
          }
          onClose={closeModal}
        />
      )}

      {modal === 'REPORT' && selectedBatch && (
        <ReportSampleForm
          batch={selectedBatch}
          onSubmit={(data) =>
            reportSampleResult(selectedBatch.batch_code, data).then(ok => ok && closeModal())
          }
          onClose={closeModal}
        />
      )}

      {modal === 'FERTILIZE' && selectedBatch && (
        <QuickFertilizeForm
          open={true}
          batch={{ ...selectedBatch, current_tunnel: selectedBatch.current_tunnel ?? '' }}
          workers={workers}
          onSubmit={(data) =>
            recordFertilization(selectedBatch.batch_code, data).then(ok => ok && closeModal())
          }
          onClose={closeModal}
        />
      )}

      {modal === 'MORTALITY' && selectedBatch && (
        <MortalityForm
          batch={{
            batch_code: selectedBatch.batch_code,
            current_phase: selectedBatch.current_phase,
            current_tunnel: selectedBatch.current_tunnel ?? '',
            available_plants: Number(selectedBatch.available_plants),
          }}
          onClose={closeModal}
          onSuccess={loadData}
        />
      )}

      {modal === 'INDOOR_LIST' && (
        selectedIndoorBatch ? (
          <ImportForm
            indoorBatch={selectedIndoorBatch}
            tunnels={tunnels}
            workers={workers}
            onSubmit={(data) =>
              importFromIndoor(selectedIndoorBatch.id, data).then(ok => ok && closeModal())
            }
            onClose={closeModal}
          />
        ) : (
          <ModalLayout title="Transition Indoor Assets">
            <div className="p-8 space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <p className="text-base font-bold text-emerald-800 leading-relaxed text-center">
                    Select a high-quality batch from indoor cultivation ready for outdoor hardening.
                </p>
              </div>
              
              {loading ? (
                <div className="py-20 text-center text-base text-slate-400 font-black uppercase tracking-widest bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  Scanning Lab Inventories...
                </div>
              ) : indoorBatches.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <p className="text-base text-slate-500 font-bold">No assets currently ready for transition.</p>
                  <p className="text-base text-slate-400 mt-1 font-medium italic">Verification required in lab module.</p>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50 bg-white shadow-xl max-h-[400px] overflow-y-auto custom-scrollbar">
                  {indoorBatches.map((b: any) => (
                    <div
                      key={b.id}
                      className="group flex justify-between items-center px-6 py-4 hover:bg-emerald-50/40 transition-all cursor-pointer"
                      onClick={() => setSelectedIndoorBatch(b)}
                    >
                      <div className="space-y-1">
                        <div className="font-black text-base text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
                          {b.batch_code}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{b.plant_name}</div>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                        Initiate Transition <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end pt-2">
                <Button variant="ghost" className="text-slate-400 font-black px-8" onClick={closeModal}>Abort</Button>
              </div>
            </div>
          </ModalLayout>
        )
      )}

      {modal === 'TIMELINE' && selectedBatch && (
        <TimelineModal
          batch={selectedBatch}
          timelineData={timelineData}
          timelineStats={timelineStats}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default BatchMaster;
