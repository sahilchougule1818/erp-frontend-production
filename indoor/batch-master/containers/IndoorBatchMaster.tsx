import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/tabs';
import { Button } from '../../../shared/ui/button';
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
  Skull,
  GitBranch,
  GitMerge
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../../shared/ui/dropdown-menu';
import { useIndoorBatchMaster } from '../hooks/useIndoorBatchMaster';
import apiClient from '../../../shared/services/apiClient';
import { useNotify } from '../../../shared/hooks/useNotify';
import { cn } from '../../../shared/ui/utils';
import { Tooltip, TooltipProvider } from '../../../shared/ui/tooltip';
import { DataTable } from '../../../shared/components/DataTable';
import { ModalLayout } from '../../../shared/components/ModalLayout';
import { CreateBatchForm } from '../forms/CreateBatchForm';
import { SubcultureForm } from '../../subculturing/forms/SubcultureForm';
import { IncubationForm } from '../../incubation/forms/IncubationForm';
import { SampleForm } from '../../sampling/forms/SampleForm';
import { ReportSampleForm } from '../../sampling/forms/ReportSampleForm';
import { MakeAvailableConfirm } from '../forms/MakeAvailableConfirm';
import { RecordContaminationModal } from '../../contamination/components/RecordContaminationModal';
import { PartialRootingForm } from '../../rooting/forms/PartialRootingForm';
import { FullRootingForm } from '../../rooting/forms/FullRootingForm';
import { indoorApi } from '../../services/indoorApi';
import { useLabContext } from '../../contexts/LabContext';
import { useAuth } from '../../../auth/AuthContext';
import { Batch } from '../../types';
import { BatchTimelineModal } from '../components/BatchTimelineModal';

type ModalType = 'CREATE' | 'SUBCULTURE' | 'INCUBATE' | 'SAMPLE' | 'REPORT' | 'EXPORT' | 'TIMELINE' | 'CONTAMINATION' | 'PARTIAL_ROOTING' | 'FULL_ROOTING' | null;

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

  const { user } = useAuth();
  const { labNumber } = useLabContext();
  const notify = useNotify();

  // Helper to get lock reason for actions
  const getActionLockReason = (action: string, batch: Batch): string | null => {
    // Universal locks
    if (isSoldOut(batch)) {
      return 'Batch is sold out - no actions available';
    }
    if (batch.state !== 'ACTIVE' && action !== 'UNEXPORT') {
      if (batch.state === 'OUTDOOR_READY') {
        return 'Batch is marked for outdoor - unmark first to perform actions';
      }
      if (batch.state === 'AT_OUTDOOR') {
        return 'Batch is currently at outdoor module';
      }
      return 'Batch is not active - action locked';
    }

    const stageNum = parseInt(batch.stage?.split('-')[1] || '0');
    const isTerminalBatch = isTerminal(batch);

    switch (action) {
      case 'SUBCULTURE':
        if (isTerminalBatch) {
          return 'Terminal incubation batches cannot be subcultured';
        }
        if (batch.stage === 'Stage-9' && batch.phase === 'incubation') {
          return 'Cannot subculture from Stage-9 incubation - this is the final stage';
        }
        if (batch.phase !== 'batch_created' && batch.phase !== 'subculturing' && batch.phase !== 'incubation') {
          return 'Subculture only available in batch_created, subculturing or incubation phase';
        }
        if (stageNum === 0 && batch.phase !== 'batch_created' && batch.phase !== 'subculturing') {
          return 'Stage-0 can only subculture when in batch_created or subculturing phase';
        }
        if (stageNum >= 1 && stageNum <= 9 && batch.phase !== 'incubation') {
          return 'Stage 1-9 can only subculture when in incubation phase';
        }
        return null;
      
      case 'INCUBATE':
        if (isTerminalBatch) {
          return 'Terminal incubation batches cannot be incubated again';
        }
        if (stageNum < 1 || stageNum > 9) {
          return 'Incubation only available for Stage 1-9';
        }
        if (batch.phase !== 'subculturing') {
          return 'Can only incubate when in subculturing phase';
        }
        return null;
      
      case 'SAMPLE':
        if (batch.is_sampled !== 'n') {
          return 'Sample already submitted';
        }
        return null;

      case 'REPORT':
        if (batch.is_sampled !== 's') {
          return 'Sample not yet submitted';
        }
        return null;
      
      case 'PARTIAL_ROOTING':
        if (batch.phase !== 'subculturing') {
          return 'Partial rooting only available from subculturing phase';
        }
        return null;
      
      case 'FULL_ROOTING':
        if (batch.phase !== 'subculturing') {
          return 'Full rooting only available from subculturing phase';
        }
        return null;
      
      case 'CONTAMINATION':
        if (batch.phase !== 'incubation' && batch.phase !== 'rooting') {
          return 'Contamination can only be recorded in incubation or rooting phase';
        }
        return null;
      
      case 'EXPORT':
        if (batch.state === 'OUTDOOR_READY' || batch.state === 'AT_OUTDOOR') {
          return 'Batch already exported to outdoor';
        }
        // Rooting batches can be exported
        if (batch.phase === 'rooting' || batch.stage === 'Rooting') {
          return null;
        }
        if (stageNum < 1) {
          return 'Batch must be at least Stage-1 to export';
        }
        if (batch.event_count < 1) {
          return 'Batch must have at least one event before export';
        }
        return null;
      
      case 'UNEXPORT':
        if (batch.state !== 'OUTDOOR_READY') {
          return 'Batch is not marked for outdoor';
        }
        return null;
      
      default:
        return null;
    }
  };

  const formatPhaseDisplay = (phase: string): string => {
    switch (phase) {
      case 'batch_created': return 'Batch Created';
      case 'subculturing': return 'Subculturing';
      case 'incubation': return 'Incubation';
      case 'rooting': return 'Rooting';
      case 'partial_rooting': return 'Partial Rooting';
      default: return phase;
    }
  };

  const formatStateDisplay = (state: string): string => {
    switch (state) {
      case 'ACTIVE': return 'Active';
      case 'OUTDOOR_READY': return 'Outdoor Ready';
      case 'AT_OUTDOOR': return 'At Outdoor';
      case 'SOLD_OUT': return 'Sold Out';
      case 'COMPLETED': return 'Completed';
      default: return state;
    }
  };

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [mediaCodes, setMediaCodes] = useState<string[]>([]);
  const [undoLockReasons, setUndoLockReasons] = useState<Record<string, string[]>>({});
  const [batchPermissions, setBatchPermissions] = useState<Record<string, any>>({});

  const handlePageChange = (page: number) => {
    fetchBatches(page);
  };

  const handleDropdownOpen = async (open: boolean, batch: Batch) => {
    if (!open) return;
    
    // Fetch permissions for this batch
    try {
      const response = await indoorApi.batchActions.getPermissions(batch.batch_code);
      const permissions = response.permissions || response.data?.permissions;
      setBatchPermissions(prev => ({ ...prev, [batch.batch_code]: permissions }));
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
    
    // Fetch undo preview
    const preview = await previewUndo(batch.batch_code);
    if (preview.success) {
      const reasons: string[] = preview.data.lockReasons ?? (
        (!preview.data.canUndo || preview.data.isUndoLocked) ? [preview.data.message ?? 'Undo locked'] : []
      );
      setUndoLockReasons(prev => ({ ...prev, [batch.batch_code]: reasons }));
    }
  };

  // Fetch data when component mounts or lab changes
  React.useEffect(() => {
    fetchBatches(1);
    fetchOperators();
    
    const fetchMediaCodes = async () => {
      try {
        const codes = await apiClient.get('/indoor/form-data/media-codes', { params: { lab_number: labNumber } });
        setMediaCodes(codes);
      } catch (error) {
        console.error('Failed to fetch media codes:', error);
        setMediaCodes(['MS-001', 'MS-002', 'MS-003', 'PDA-001', 'PDA-002', 'YPD-001']);
      }
    };
    
    fetchMediaCodes();
  }, [labNumber, fetchBatches, fetchOperators]);

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

  const handlePartialRooting = async (data: any) => {
    try {
      await indoorApi.rooting.makePartialRooting({
        ...data,
        created_by: 'system'
      });
      notify.success('Partial rooting completed successfully');
      closeModal();
      fetchBatches();
    } catch (error: any) {
      notify.error(error.response?.data?.message || error.message || 'Failed to create partial rooting');
    }
  };

  const handleFullRooting = async (data: any) => {
    try {
      await indoorApi.rooting.moveFullBatchToRooting({
        ...data,
        created_by: 'system'
      });
      notify.success(`Full batch moved to rooting: ${data.batchCode}`);
      closeModal();
      fetchBatches();
    } catch (error: any) {
      notify.error(error.response?.data?.message || error.message || 'Failed to move batch to rooting');
    }
  };

  const handleMakeRooting = async (batch: Batch) => {
    // REMOVED - Partial rooting is now single-step
  };

  const handleMoveToTerminalIncubation = async (data: any) => {
    // REMOVED - No terminal incubation anymore
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
    batch.state === 'SOLD_OUT' || ((batch.qty_available ?? 0) <= 0 && batch.stage !== 'Stage-0');

  // === VISIBILITY: phase/stage based ===

  const isTerminal = (batch: Batch) => batch.stage === 'Rooting';

  const showSubculture = (batch: Batch) => {
    if (batch.stage === 'Rooting') return false;
    const n = parseInt(batch.stage?.split('-')[1] || '0');
    return (n === 0 && (batch.phase === 'batch_created' || batch.phase === 'subculturing')) ||
           (n >= 1 && n <= 9 && batch.phase === 'incubation');
  };

  const showIncubate = (batch: Batch) => {
    if (batch.stage === 'Rooting') return false;
    const n = parseInt(batch.stage?.split('-')[1] || '0');
    return n >= 1 && n <= 9 && batch.phase === 'subculturing';
  };

  const showExport = (batch: Batch) => {
    if (batch.state === 'OUTDOOR_READY' || batch.state === 'AT_OUTDOOR') return false;
    
    // Rooting batches can be exported
    if (batch.phase === 'rooting' || batch.stage === 'Rooting') return true;
    
    // Stage-1 and above can be exported
    const n = parseInt(batch.stage?.split('-')[1] || '0');
    return n >= 1 && batch.event_count >= 1;
  };

  const showPartialRooting = (batch: Batch) => batch.phase === 'subculturing';
  const showFullRooting = (batch: Batch) => batch.phase === 'subculturing';

  const showContamination = (batch: Batch) => batch.phase === 'incubation' || batch.phase === 'rooting';

  const handleExportData = () => {
    const exportData = batches.map(batch => ({
      'Batch Code': batch.batch_code,
      'Plant Name': batch.plant_name,
      'Current Age (Days)': batch.current_age,
      'Phase': formatPhaseDisplay(batch.phase),
      'Stage': batch.stage,
      'Current Bottles': batch.qty_in,
      'Contamination': batch.qty_contaminated,
      'Events': batch.event_count
    }));
    notify.error('Export functionality would download Excel file here');
  };

  if (loading) return <div className="p-4">Loading...</div>;

const columns = [
    { key: 'batch_code',             label: 'Batch Code',            render: (v: string) => v },
    { key: 'created_date',           label: 'Created Date',          render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    { key: 'plant_name',             label: 'Plant Name' },
    { key: 'lab_number',             label: 'Lab',                   render: (v: number) => v ? `Lab ${v}` : '-' },
    { key: 'current_age',            label: 'Current Age',           render: (v: number) => `${v} days` },
    { key: 'phase',                  label: 'Phase',                 render: (v: string) => formatPhaseDisplay(v) },
    { key: 'stage',                  label: 'Stage',                 render: (v: string) => v ? v.replace('Stage-', '') : '-' },
    { key: 'qty_in',                 label: 'Current Bottles',       render: (v: number) => v?.toLocaleString() ?? '-' },
    { key: 'qty_contaminated',       label: 'Current Contamination' },
    { key: 'qty_p_rooted',           label: 'Current Partial Rooting', render: (v: number) => (v || 0).toLocaleString() },
    { key: 'qty_sold',               label: 'Current Stage Sold',    render: (v: number) => (v || 0).toLocaleString() },
    { key: 'qty_available',          label: 'Available Bottles' },
    { key: 'is_sampled',             label: 'Sampling',              render: (v: string) => v === 'c' ? 'Result Reported' : v === 's' ? 'Sample Sent' : 'Not Sampled' },
    { key: 'state',                  label: 'State' },
    { key: 'total_qty_sold',         label: 'Total Bottles Sold',    render: (v: number) => (v || 0).toLocaleString() },
    { key: 'total_qty_contaminated', label: 'Total Contamination' },
    { key: 'total_qty_p_rooted',     label: 'Total Partial Rooting', render: (v: number) => (v || 0).toLocaleString() },
    { key: 'event_count',            label: 'Events',                render: (v: number) => v },
    { key: 'is_partial_rooting',     label: 'Partial Rooting',       render: (v: boolean) => v ? 'Yes' : '' },
    { key: 'source_batch_code',      label: 'Source Batch',          render: (v: string) => v || '' },
    { key: 'source_batch_stage',     label: 'Source Stage',          render: (v: string, record: any) => (v && record.source_batch_code) ? v : '' },
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
            
            {/* Timeline - Always visible */}
            <DropdownMenuItem onClick={() => handleTimeline(batch)}>
              <Clock className="mr-2 h-4 w-4 text-gray-600" />
              <span>View Timeline</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Subculture — Stage-0 batch_created/subculturing OR Stage 1-9 incubation (alternates with Incubate) */}
            {batch.phase !== 'partial_rooting' && ((batch.stage === 'Stage-0' && (batch.phase === 'batch_created' || batch.phase === 'subculturing')) || (parseInt(batch.stage?.split('-')[1] || '0') >= 1 && batch.phase === 'incubation')) && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batch_code];
              const permission = batchPermissions[batch.batch_code]?.canSubculture;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>{batch.stage === 'Stage-0' ? 'Subculture' : 'Continue Subculture'}</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('SUBCULTURE', batch)}>
                  <FlaskConical className="mr-2 h-4 w-4 text-green-600" />
                  <span>{batch.stage === 'Stage-0' ? 'Subculture' : 'Continue Subculture'}</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Incubate — alternates with Subculture */}
            {batch.phase === 'subculturing' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batch_code];
              const permission = batchPermissions[batch.batch_code]?.canIncubate;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Incubate</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('INCUBATE', batch)}>
                  <Microscope className="mr-2 h-4 w-4 text-blue-600" />
                  <span>Incubate</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Submit Sample — alternates with Report */}
            {batch.is_sampled === 'n' && batch.phase !== 'partial_rooting' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batch_code];
              const permission = batchPermissions[batch.batch_code]?.canSubmitSample;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Submit Sample</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('SAMPLE', batch)}>
                  <TestTube className="mr-2 h-4 w-4 text-cyan-600" />
                  <span>Submit Sample</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Report Sample Result — alternates with Submit Sample */}
            {batch.is_sampled === 's' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batch_code];
              const permission = batchPermissions[batch.batch_code]?.canReportSampleResult;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Report Sample Result</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('REPORT', batch)}>
                  <TestTube className="mr-2 h-4 w-4 text-purple-600" />
                  <span>Report Sample Result</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Partial Rooting */}
            {batch.phase !== 'partial_rooting' && batch.phase !== 'rooting' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batch_code];
              const permission = batchPermissions[batch.batch_code]?.canPartialRooting;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Make Partial Rooting</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('PARTIAL_ROOTING', batch)}>
                  <GitBranch className="mr-2 h-4 w-4 text-orange-600" />
                  <span>Make Partial Rooting</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Full Rooting */}
            {batch.phase === 'subculturing' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batch_code];
              const permission = batchPermissions[batch.batch_code]?.canFullRooting;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Move Full Batch to Rooting</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('FULL_ROOTING', batch)}>
                  <GitMerge className="mr-2 h-4 w-4 text-orange-600" />
                  <span>Move Full Batch to Rooting</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Contamination */}
            {batch.phase !== 'partial_rooting' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batch_code];
              const permission = batchPermissions[batch.batch_code]?.canRecordContamination;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Record Contamination</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('CONTAMINATION', batch)} className="text-red-600">
                  <Skull className="mr-2 h-4 w-4" />
                  <span>Record Contamination</span>
                </DropdownMenuItem>
              );
            })()}
            
            <DropdownMenuSeparator />
            
            {/* Export to Outdoor — alternates with Unmark */}
            {batch.state !== 'OUTDOOR_READY' && batch.state !== 'AT_OUTDOOR' && batch.phase !== 'partial_rooting' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batch_code];
              const permission = batchPermissions[batch.batch_code]?.canExportToOutdoor;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Make Available for Outdoor</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => openModal('EXPORT', batch)}>
                  <ArrowUpRight className="mr-2 h-4 w-4 text-orange-600" />
                  <span>Make Available for Outdoor</span>
                </DropdownMenuItem>
              );
            })()}
            
            {/* Unmark from Outdoor — alternates with Export */}
            {batch.state === 'OUTDOOR_READY' && (() => {
              const isLoadingPermissions = !batchPermissions[batch.batch_code];
              const permission = batchPermissions[batch.batch_code]?.canUnexportFromOutdoor;
              const isLocked = isLoadingPermissions || (permission && !permission.allowed);
              const lockReason = isLoadingPermissions ? 'Loading permissions...' : permission?.reason;
              
              return isLocked ? (
                <TooltipProvider>
                  <Tooltip side="left" content={lockReason}>
                    <span className="block w-full">
                      <DropdownMenuItem disabled className="text-slate-400 cursor-not-allowed pointer-events-none">
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Unmark from Outdoor</span>
                      </DropdownMenuItem>
                    </span>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <DropdownMenuItem onClick={() => handleUnexportBatch(batch)}>
                  <ArrowDownLeft className="mr-2 h-4 w-4 text-amber-600" />
                  <span>Unmark from Outdoor</span>
                </DropdownMenuItem>
              );
            })()}
            
            <DropdownMenuSeparator />
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
      <Tabs defaultValue="master" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="master">Indoor Batch Master</TabsTrigger>
        </TabsList>
        
        <TabsContent value="master">
          <DataTable
        title="Indoor Batch Master"
        columns={columns}
        records={batches.map(batch => ({ ...batch }))}
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
        hideBorder={true}
      />
        </TabsContent>
      </Tabs>

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

      {activeModal === 'PARTIAL_ROOTING' && selectedBatch && (
        <PartialRootingForm
          record={{
            ...selectedBatch,
            id: selectedBatch.current_source_id,
            remaining_bottles: selectedBatch.qty_in,
            to_stage: selectedBatch.stage,
            next_stage: selectedBatch.stage
          }}
          onSubmit={handlePartialRooting}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'FULL_ROOTING' && selectedBatch && (
        <FullRootingForm
          record={{
            ...selectedBatch,
            id: selectedBatch.current_source_id
          }}
          onSubmit={handleFullRooting}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'CONTAMINATION' && selectedBatch && (
        <RecordContaminationModal
          batch={selectedBatch}
          onClose={closeModal}
          onSuccess={fetchBatches}
        />
      )}

      {activeModal === 'TIMELINE' && selectedBatch && (
        <BatchTimelineModal
          batch={selectedBatch}
          timelineData={timelineData}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default IndoorBatchMaster;