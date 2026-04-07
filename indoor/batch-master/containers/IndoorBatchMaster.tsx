import React, { useState } from 'react';
import { Button } from '../../shared/ui/button';
import {
  Download,
  Plus,
  MoreHorizontal,
  FlaskConical,
  Microscope,
  TestTube,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  Clock,
  Lock,
  Skull
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../shared/ui/dropdown-menu';
import { useIndoorBatchMaster } from '../hooks/useIndoorBatchMaster';
import apiClient from '../../shared/services/apiClient';
import { useNotify } from '../../shared/hooks/useNotify';
import { cn } from '../../shared/ui/utils';
import { Tooltip, TooltipProvider } from '../../shared/ui/tooltip';
import { DataTable } from '../../shared/components/DataTable';
import { ModalLayout } from '../../shared/components/ModalLayout';
import { CreateBatchForm } from '../forms/CreateBatchForm';
import { SubcultureForm } from '../../subculturing/forms/SubcultureForm';
import { IncubationForm } from '../../incubation/forms/IncubationForm';
import { SampleForm } from '../../sampling/forms/SampleForm';
import { ReportSampleForm } from '../../sampling/forms/ReportSampleForm';
import { MakeAvailableConfirm } from '../forms/MakeAvailableConfirm';
import { RecordContaminationModal } from '../../contamination/components/RecordContaminationModal';
import { Batch } from '../types';

type ModalType = 'CREATE' | 'SUBCULTURE' | 'INCUBATE' | 'SAMPLE' | 'REPORT' | 'EXPORT' | 'TIMELINE' | 'CONTAMINATION' | null;

const IndoorBatchMaster: React.FC = () => {
  const {
    batches,
    operators,
    loading,
    pagination,
    fetchBatches,
    fetchOperators,
    createBatch,
    recordSubculture,
    recordIncubation,
    submitSample,
    reportSampleResult,
    exportToOutdoor,
    unexportFromOutdoor,
    previewUndo,
    undoLastAction,
    getBatchTimeline
  } = useIndoorBatchMaster();

  const notify = useNotify();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [mediaCodes, setMediaCodes] = useState<string[]>([]);
  const [undoLockReasons, setUndoLockReasons] = useState<Record<string, string[]>>({});

  const handlePageChange = (page: number) => {
    fetchBatches(page);
  };

  const handleDropdownOpen = async (open: boolean, batch: Batch) => {
    if (!open) return;
    const preview = await previewUndo(batch.batch_code);
    if (preview.success) {
      const reasons: string[] = preview.data.lockReasons ?? (
        (!preview.data.canUndo || preview.data.isUndoLocked) ? [preview.data.message ?? 'Undo locked'] : []
      );
      setUndoLockReasons(prev => ({ ...prev, [batch.batch_code]: reasons }));
    }
  };

  // Fetch data when component mounts
  React.useEffect(() => {
    fetchBatches();
    fetchOperators();
    
    const fetchMediaCodes = async () => {
      try {
        const codes = await apiClient.get('/indoor/form-data/media-codes');
        setMediaCodes(codes);
      } catch (error) {
        console.error('Failed to fetch media codes:', error);
        setMediaCodes(['MS-001', 'MS-002', 'MS-003', 'PDA-001', 'PDA-002', 'YPD-001']);
      }
    };
    
    fetchMediaCodes();
  }, [fetchBatches, fetchOperators]);

  const openModal = (type: ModalType, batch?: Batch) => {
    if (batch) setSelectedBatch(batch);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedBatch(null);
    setTimelineData([]);
  };

  const handleCreateBatch = async (data: any) => {
    const result = await createBatch(data);
    if (result.success) {
      notify.success('Batch created successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to create batch');
    }
  };

  const handleSubculture = async (data: any) => {
    if (!selectedBatch) return;
    
    const apiData = {
      mediaCode: data.mediaCode,
      currentBottles: data.currentBottles,
      newBottlesCount: parseInt(data.noOfBottles) || 0,
      notes: data.notes || '',
      operators: data.operatorIds.map((id: any) => ({ id: parseInt(id) }))
    };
    
    const result = await recordSubculture(selectedBatch.batch_code, apiData);
    if (result.success) {
      notify.success('Subculture recorded successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to record subculture');
    }
  };

  const handleIncubation = async (data: any) => {
    if (!selectedBatch) return;
    
    const apiData = {
      mediaCode: data.mediaCode || undefined,
      incubationPeriod: data.incubationPeriod ? parseInt(data.incubationPeriod) : 7,
      temperature: data.temperature ? parseFloat(data.temperature) : undefined,
      humidity: data.humidity ? parseFloat(data.humidity) : undefined,
      lightIntensity: data.lightIntensity ? parseFloat(data.lightIntensity) : undefined,
      contaminationCount: data.contaminationCount ? parseInt(data.contaminationCount) : 0,
      operators: data.operatorIds ? data.operatorIds.map((id: any) => ({ id: parseInt(id) })) : []
    };
    
    const result = await recordIncubation(selectedBatch.batch_code, apiData);
    if (result.success) {
      notify.success('Incubation recorded successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to record incubation');
    }
  };

  const handleSample = async (data: any) => {
    if (!selectedBatch) return;
    const result = await submitSample(selectedBatch.batch_code, data);
    if (result.success) {
      notify.success('Sample submitted successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to submit sample');
    }
  };

  const handleReportSample = async (data: any) => {
    if (!selectedBatch) return;
    const result = await reportSampleResult(selectedBatch.batch_code, data);
    if (result.success) {
      notify.success('Sample result reported successfully');
      closeModal();
    } else {
      notify.error(result.error || 'Failed to report sample result');
    }
  };

  const handleExportBatch = async () => {
    if (!selectedBatch) return;
    const result = await exportToOutdoor(selectedBatch.batch_code, { notes: '' });
    if (result.success) {
      notify.success('Batch is now available for outdoor module');
      closeModal();
    } else {
      throw new Error(result.error || 'Failed to make batch available');
    }
  };

  const handleUnexportBatch = async (batch: Batch) => {
    if (!confirm(`Remove "${batch.batch_code}" from outdoor availability? This will unlock subculture and incubation.`)) return;
    const result = await unexportFromOutdoor(batch.batch_code);
    if (result.success) {
      notify.success('Batch removed from outdoor availability');
    } else {
      notify.error(result.error || 'Failed to unmark batch');
    }
  };

  const handleUndo = async (batch: Batch) => {
    const preview = await previewUndo(batch.batch_code);
    if (!preview.success) {
      notify.error(preview.error || 'Failed to check undo status');
      return;
    }

    const { canUndo, isUndoLocked, message } = preview.data;

    if (!canUndo || isUndoLocked) {
      notify.error(message || 'Undo is not available for this batch');
      return;
    }

    if (!confirm(message || `Undo last action for batch ${batch.batch_code}?`)) return;

    const result = await undoLastAction(batch.batch_code);
    if (result.success) {
      notify.success('Last action undone successfully');
    } else {
      notify.error(result.error || 'Failed to undo last action');
    }
  };

  const handleTimeline = async (batch: Batch) => {
    const result = await getBatchTimeline(batch.batch_code);
    if (result.success) {
      setTimelineData(result.data || []);
      setSelectedBatch(batch);
      setActiveModal('TIMELINE');
    } else {
      notify.error(result.error || 'Failed to load timeline');
    }
  };

  // Stage-0 batches have 0 bottles by design — they are NOT sold out
  const isSoldOut = (batch: Batch) =>
    batch.state === 'SOLD_OUT' || ((batch.available_bottles ?? 0) <= 0 && batch.stage !== 'Stage-0');

  // Visibility: phase/stage based (same logic as before, no sold-out check)
  const showSubculture = (batch: Batch) => {
    const n = parseInt(batch.stage?.split('-')[1] || '0');
    return (n === 0 && batch.phase === 'subculturing') ||
           (n >= 1 && n <= 8 && batch.phase === 'incubation');
  };
  const showIncubate = (batch: Batch) => {
    const n = parseInt(batch.stage?.split('-')[1] || '0');
    return n >= 1 && n <= 8 && batch.phase === 'subculturing';
  };
  const showExport = (batch: Batch) => {
    const n = parseInt(batch.stage?.split('-')[1] || '0');
    return batch.state !== 'OUTDOOR_READY' && batch.state !== 'AT_OUTDOOR' && n >= 1 && batch.event_count >= 1;
  };

  // Lock vs active: sold-out + state check (only evaluated when item is already visible)
  const canSubculture   = (batch: Batch) => !isSoldOut(batch) && batch.state === 'ACTIVE' && !(batch.stage === 'Stage-8' && batch.phase === 'incubation');
  const canIncubate     = (batch: Batch) => !isSoldOut(batch) && batch.state === 'ACTIVE';
  const canSample       = (batch: Batch) => !isSoldOut(batch) && batch.state === 'ACTIVE' && batch.is_sampled === 'n';
  const canReportSample = (batch: Batch) => !isSoldOut(batch) && batch.state === 'ACTIVE' && batch.is_sampled === 's';
  const canExport       = (batch: Batch) => !isSoldOut(batch) && batch.state === 'ACTIVE';
  const canUnexport     = (batch: Batch) => batch.state === 'OUTDOOR_READY';

  const canRecordContamination = (batch: Batch) =>
    !isSoldOut(batch) && batch.state === 'ACTIVE' && batch.phase === 'incubation';

  const handleExportData = () => {
    const exportData = batches.map(batch => ({
      'Batch Code': batch.batch_code,
      'Plant Name': batch.plant_name,
      'Current Age (Days)': batch.current_age,
      'Phase': batch.phase_display,
      'Stage': batch.stage,
      'Current Bottles': batch.current_bottles_count,
      'Contamination': batch.contamination_count,
      'Events': batch.event_count
    }));
    console.log('Export data:', exportData);
    alert('Export functionality would download Excel file here');
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const columns = [
    { key: 'batch_code', label: 'Batch Code', render: (v: string) => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'created_date', label: 'Created Date', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'plant_name', label: 'Plant Name' },
    { key: 'current_age', label: 'Current Age', render: (v: number) => <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">{v} days</span> },
    { key: 'phase_display', label: 'Phase', render: (v: string) => <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{v}</span> },
    { key: 'stage', label: 'Stage', render: (v: string) => v ? v.replace('Stage-', '') : '-' },
    { key: 'current_bottles_count', label: 'Current Bottles', render: (v: number) => v ?? '-' },
    { key: 'current_contamination', label: 'Current Contamination', render: (v: number) => <span className="text-red-600">{v || 0}</span> },
    { key: 'current_stage_sold', label: 'Current Stage Sold', render: (v: number) => (v || 0).toLocaleString() },
    { key: 'available_bottles', label: 'Available Bottles', render: (v: number) => <span className="text-green-700 font-semibold">{(v ?? 0).toLocaleString()}</span> },
    { key: 'total_sold_bottles', label: 'Total Bottles Sold', render: (v: number) => (v || 0).toLocaleString() },
    { key: 'contamination_count', label: 'Total Contamination', render: (v: number) => <span className="text-red-600">{v}</span> },
    { key: 'event_count', label: 'Events', render: (v: number) => <span className="font-semibold">{v}</span> },
    { key: 'is_sampled', label: 'Sampling', render: (v: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        v === 'c' ? 'bg-emerald-100 text-emerald-700' :
        v === 's' ? 'bg-amber-100 text-amber-700' :
        'bg-slate-100 text-slate-400'
      }`}>
        {v === 'c' ? 'Result Reported' : v === 's' ? 'Sample Sent' : 'Not Sampled'}
      </span>
    )},
    { key: 'state', label: 'State', render: (v: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        v === 'ACTIVE' ? 'bg-green-100 text-green-800' :
        v === 'OUTDOOR_READY' ? 'bg-orange-100 text-orange-800' :
        v === 'SOLD_OUT' ? 'bg-rose-100 text-rose-800' :
        v === 'AT_OUTDOOR' ? 'bg-purple-100 text-purple-800' :
        'bg-gray-100 text-gray-700'
      }`}>
        {v}
      </span>
    )},
    {
      key: '_actions',
      label: 'Actions',
      render: (_: any, batch: Batch) => (
        <DropdownMenu onOpenChange={(open: boolean) => handleDropdownOpen(open, batch)}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions for {batch.batch_code}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {showSubculture(batch) && (
              canSubculture(batch) ? (
                <DropdownMenuItem onClick={() => openModal('SUBCULTURE', batch)}>
                  <FlaskConical className="mr-2 h-4 w-4 text-green-600" />
                  <span>{batch.stage === 'Stage-0' ? 'Subculture' : 'Continue Subculture'}</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>{batch.stage === 'Stage-0' ? 'Subculture' : 'Continue Subculture'}</span>
                </DropdownMenuItem>
              )
            )}
            {showIncubate(batch) && (
              canIncubate(batch) ? (
                <DropdownMenuItem onClick={() => openModal('INCUBATE', batch)}>
                  <Microscope className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Incubate</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Incubate</span>
                </DropdownMenuItem>
              )
            )}
            {batch.is_sampled !== 's' && (
              canSample(batch) ? (
                <DropdownMenuItem onClick={() => openModal('SAMPLE', batch)}>
                  <TestTube className="mr-2 h-4 w-4 text-cyan-600" />
                  <span>Submit Sample</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Submit Sample</span>
                </DropdownMenuItem>
              )
            )}
            {batch.is_sampled === 's' && (
              canReportSample(batch) ? (
                <DropdownMenuItem onClick={() => openModal('REPORT', batch)}>
                  <TestTube className="mr-2 h-4 w-4 text-purple-600" />
                  <span>Report Sample Result</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Report Sample Result</span>
                </DropdownMenuItem>
              )
            )}
            {showExport(batch) && (
              canExport(batch) ? (
                <DropdownMenuItem onClick={() => openModal('EXPORT', batch)}>
                  <ArrowUpRight className="mr-2 h-4 w-4 text-orange-600" />
                  <span>Make Available for Outdoor</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Make Available for Outdoor</span>
                </DropdownMenuItem>
              )
            )}
            {canUnexport(batch) && (
              <DropdownMenuItem onClick={() => handleUnexportBatch(batch)}>
                <ArrowDownLeft className="mr-2 h-4 w-4 text-amber-600" />
                <span>Unmark from Outdoor</span>
              </DropdownMenuItem>
            )}
            {canRecordContamination(batch) ? (
              <DropdownMenuItem onClick={() => openModal('CONTAMINATION', batch)} className="text-red-600">
                <Skull className="mr-2 h-4 w-4" />
                <span>Record Contamination</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                <Lock className="mr-2 h-4 w-4" />
                <span>Record Contamination</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleTimeline(batch)}>
              <Clock className="mr-2 h-4 w-4 text-gray-600" />
              <span>View Timeline</span>
            </DropdownMenuItem>
            {(undoLockReasons[batch.batch_code]?.length ?? 0) > 0 ? (
              <TooltipProvider>
                <Tooltip side="left" content={
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {undoLockReasons[batch.batch_code].map((r, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                        <span style={{ color: '#f87171', marginTop: 1 }}>•</span>
                        <span style={{ color: '#f8fafc' }}>{r}</span>
                      </li>
                    ))}
                  </ul>
                }>
                  <span className="block w-full">
                    <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                      <Lock className="h-4 w-4 mr-2" /> Undo Locked
                    </DropdownMenuItem>
                  </span>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <DropdownMenuItem onClick={() => handleUndo(batch)} className="text-red-600">
                <RotateCcw className="mr-2 h-4 w-4" />
                <span>Undo Last Action</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Indoor Batch Master - Command Center"
        columns={columns}
        records={batches.map(batch => ({
          ...batch,
          className: cn(
            batch.state === 'SOLD_OUT' && "bg-rose-50/30 opacity-80",
            batch.state === 'AT_OUTDOOR' && "bg-purple-50/30"
          )
        }))}
        filterConfig={{
          filter1Key: 'plant_name',
          filter1Label: 'Plant Name',
          filter2Key: 'batch_code',
          filter2Label: 'Batch Code'
        }}
        exportFileName="indoor_batch_master"
        addButton={
          <Button onClick={() => openModal('CREATE')} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />Create New Batch
          </Button>
        }
        pagination={{
          currentPage: pagination.page || pagination.currentPage || 1,
          totalPages: pagination.totalPages,
          total: pagination.total,
          limit: pagination.limit,
          onPageChange: handlePageChange
        }}
      />

      {/* Modal forms */}
      {activeModal === 'CREATE' && (
        <ModalLayout title="Create New Batch" width="w-[600px]">
          <CreateBatchForm mediaCodes={mediaCodes} onSubmit={handleCreateBatch} onCancel={closeModal} />
        </ModalLayout>
      )}

      {activeModal === 'SUBCULTURE' && selectedBatch && (
        <ModalLayout title={`Subculture Batch ${selectedBatch.batch_code}`} width="w-[700px]">
          <SubcultureForm initialData={null} selectedBatch={selectedBatch} operators={operators} records={mediaCodes.map(code => ({ media_code: code }))} onSubmit={handleSubculture} onCancel={closeModal} />
        </ModalLayout>
      )}

      {activeModal === 'INCUBATE' && selectedBatch && (
        <ModalLayout title={`Incubate Batch ${selectedBatch.batch_code}`} width="w-[700px]">
          <IncubationForm initialData={null} selectedBatch={selectedBatch} operators={operators} onSubmit={handleIncubation} onCancel={closeModal} />
        </ModalLayout>
      )}

      {activeModal === 'SAMPLE' && selectedBatch && (
        <SampleForm batch={selectedBatch} onClose={closeModal} onSubmit={handleSample} />
      )}

      {activeModal === 'REPORT' && selectedBatch && (
        <ReportSampleForm batch={selectedBatch} onClose={closeModal} onSubmit={handleReportSample} />
      )}

      {activeModal === 'EXPORT' && selectedBatch && (
        <ModalLayout title={`Make ${selectedBatch.batch_code} Available for Outdoor`} width="w-[450px]" maxHeight="h-auto">
          <MakeAvailableConfirm batchCode={selectedBatch.batch_code} onConfirm={handleExportBatch} onCancel={closeModal} />
        </ModalLayout>
      )}

      {activeModal === 'CONTAMINATION' && selectedBatch && (
        <RecordContaminationModal
          batch={selectedBatch}
          onClose={closeModal}
          onSuccess={fetchBatches}
        />
      )}

      {activeModal === 'TIMELINE' && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border shadow-lg flex flex-col" style={{ width: '850px', maxHeight: '90vh' }}>
            <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-semibold">Indoor Batch Timeline — {selectedBatch.batch_code}</h4>
                <Button variant="outline" size="sm" onClick={closeModal}>Close</Button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-gray-600">Plant: </span><span className="font-semibold">{selectedBatch.plant_name}</span></div>
                <div><span className="text-gray-600">Stage: </span><span className="font-semibold">{selectedBatch.stage}</span></div>
                <div><span className="text-gray-600">Phase: </span><span className="font-semibold">{selectedBatch.phase_display}</span></div>
                <div><span className="text-gray-600">Age: </span><span className="font-semibold text-green-600">{selectedBatch.current_age} days</span></div>
                <div><span className="text-gray-600">Bottles: </span><span className="font-semibold text-blue-600">{selectedBatch.current_bottles_count}</span></div>
                <div><span className="text-gray-600">Contamination: </span><span className="font-semibold text-red-600">{selectedBatch.contamination_count}</span></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: 0 }}>
              {timelineData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No events found for this batch</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {timelineData.filter(event => event.event_type !== 'CREATE').map((event, idx) => {
                      const eventData = event.event_data || {};
                      const getIcon = () => {
                        switch (event.event_type) {
                          case 'CREATE': return Plus;
                          case 'SUBCULTURE': return FlaskConical;
                          case 'INCUBATE': return Microscope;
                          case 'EXPORT': return ArrowUpRight;
                          default: return Clock;
                        }
                      };
                      const getColor = () => {
                        switch (event.event_type) {
                          case 'CREATE': return 'bg-green-100 text-green-600';
                          case 'SUBCULTURE': return 'bg-blue-100 text-blue-600';
                          case 'INCUBATE': return 'bg-purple-100 text-purple-600';
                          case 'EXPORT': return 'bg-orange-100 text-orange-600';
                          default: return 'bg-gray-100 text-gray-600';
                        }
                      };
                      const Icon = getIcon();
                      const colorClass = getColor();
                      return (
                        <div key={idx} className="relative flex gap-3">
                          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="bg-white border rounded-lg p-3 shadow-sm">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium">
                                  {event.event_type === 'CREATE' && 'Batch Created'}
                                  {event.event_type === 'SUBCULTURE' && `Subculture to ${eventData.next_stage || eventData.nextStage || 'Next Stage'}`}
                                  {event.event_type === 'INCUBATE' && `Incubation at ${eventData.stage || eventData.current_stage || 'Current Stage'}`}
                                  {event.event_type === 'EXPORT' && 'Exported to Outdoor'}
                                </h3>
                                <div className="text-xs text-gray-500">{new Date(event.created_at).toLocaleDateString()}</div>
                              </div>
                              <div className="bg-gray-50 rounded p-2 space-y-1.5 text-sm text-gray-600">
                                {event.age_at_arrival !== null && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 min-w-[120px]">Arrival Age</span>
                                    <span className="font-semibold text-green-600">{event.age_at_arrival} days</span>
                                  </div>
                                )}
                                {event.age_at_departure !== null && event.event_state === 'completed' && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 min-w-[120px]">Departure Age</span>
                                    <span className="font-semibold text-green-600">{event.age_at_departure} days</span>
                                  </div>
                                )}
                                {eventData.media_code && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 min-w-[120px]">Media Code</span>
                                    <span className="font-semibold text-gray-800">{eventData.media_code}</span>
                                  </div>
                                )}
                                {eventData.current_bottles_count !== null && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 min-w-[120px]">Bottles (Before)</span>
                                    <span className="font-semibold text-gray-800">{eventData.current_bottles_count}</span>
                                  </div>
                                )}
                                {eventData.new_bottles_count !== null && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 min-w-[120px]">Bottles (After)</span>
                                    <span className="font-semibold text-blue-600">{eventData.new_bottles_count}</span>
                                  </div>
                                )}
                                {event.contamination_count > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 min-w-[120px]">Contamination</span>
                                    <span className="font-semibold text-red-600">{event.contamination_count}</span>
                                  </div>
                                )}
                                {eventData.notes && (
                                  <div className="flex items-start gap-2 pt-1 border-t border-gray-200">
                                    <span className="text-gray-400 min-w-[120px]">Notes</span>
                                    <span className="text-gray-700">{eventData.notes}</span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${event.event_state === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                  {event.event_state}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndoorBatchMaster;