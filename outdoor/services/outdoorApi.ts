import apiClient from '../../shared/services/apiClient';
import { 
  ShiftPayload, 
  TransitionPayload, 
  UndoPayload 
} from '../types/outdoor.types';

export const outdoorApi = {

  // Batch operations - shift, transition, undo
  batchOperations: {
    makeShift:           (data: ShiftPayload)      => apiClient.post('/outdoor/batch-operations/shift', data),
    phaseTransition:     (data: TransitionPayload) => apiClient.post('/outdoor/batch-operations/transition', data),
    undoLastAction:      (data: UndoPayload)       => apiClient.post('/outdoor/batch-operations/undo', data),
    getUndoPreview:      (batchCode: string)       => apiClient.get(`/outdoor/batch-operations/undo-preview/${batchCode}`),
  },

  // Dashboard - batches, stats, tunnel occupancy, holding area
  dashboard: {
    getAllBatches:       (page?: number, limit?: number) => apiClient.get(`/outdoor/dashboard/batches?page=${page || 1}&limit=${limit || 10}`),
    getDashboardStats:   (params?: string) => apiClient.get(`/outdoor/dashboard/stats${params || ''}`),
    getTunnelOccupancy:  (params?: string) => apiClient.get(`/outdoor/dashboard/tunnel-occupancy${params || ''}`),
    getSHOccupancy:      (params?: string) => apiClient.get(`/outdoor/dashboard/sh-occupancy${params || ''}`),
    getHoldingArea:      ()                => apiClient.get('/outdoor/dashboard/holding-area'),
  },

  // Phase view endpoints
  phaseViews: {
    getPrimaryHardening:   (page?: number, limit?: number) => apiClient.get(`/outdoor/primary-hardening?page=${page || 1}&limit=${limit || 10}`),
    getSecondaryHardening: (page?: number, limit?: number) => apiClient.get(`/outdoor/secondary-hardening?page=${page || 1}&limit=${limit || 10}`),
    getTunnelShifts:       (page?: number, limit?: number) => apiClient.get(`/outdoor/tunnel-shifts?page=${page || 1}&limit=${limit || 10}`),
    getHoldingArea:        (page?: number, limit?: number) => apiClient.get(`/outdoor/holding-area?page=${page || 1}&limit=${limit || 10}`),
  },

  // PH Units (tunnels within units like A1, A2, B1, B2)
  phUnits: {
    getAll:  ()                        => apiClient.get('/outdoor/ph-units'),
    create:  (data: { name: string })  => apiClient.post('/outdoor/ph-units', data),
    update:  (id: number, data: { name: string }) => apiClient.put(`/outdoor/ph-units/${id}`, data),
  },

  // SH Units
  shUnits: {
    getAll:  ()                        => apiClient.get('/outdoor/sh-units'),
    create:  (data: { name: string })  => apiClient.post('/outdoor/sh-units', data),
    update:  (id: number, data: { name: string }) => apiClient.put(`/outdoor/sh-units/${id}`, data),
  },

  // Workers
  workers: {
    getAll:    (page?: number, limit?: number) => apiClient.get(`/outdoor/workers?page=${page || 1}&limit=${limit || 10}`),
    getLog:    (page?: number, limit?: number, batch?: string) => apiClient.get(`/outdoor/workers/log?page=${page || 1}&limit=${limit || 10}${batch ? `&batch=${batch}` : ''}`),
    create:    (data: any)         => apiClient.post('/outdoor/workers', data),
    update:    (id: number, data: any) => apiClient.put(`/outdoor/workers/${id}`, data),
    delete:    (id: number)        => apiClient.delete(`/outdoor/workers/${id}`),
    updateAssignment: (id: number, worker_id: number) => 
      apiClient.put(`/outdoor/workers/assignment/${id}`, { worker_id }),
    getAssignments: (eventCode: string, activityType: string = 'event', fertilizationId?: number) =>
      apiClient.get(`/outdoor/workers/assignment?event_code=${eventCode}&activity_type=${activityType}${fertilizationId ? `&fertilization_id=${fertilizationId}` : ''}`),
    addAssignment: (data: {
      event_code?: string;
      worker_id: number;
      role?: string;
      tunnel?: string;
      phase?: string;
      activity_type?: string;
      fertilization_id?: number;
    }) => apiClient.post('/outdoor/workers/assignment', data),
    removeAssignment: (id: number) =>
      apiClient.delete(`/outdoor/workers/assignment/${id}`),
  },

  // Batches — indoor bridge
  batches: {
    getAll:             (page?: number, limit?: number) => {
      const response = apiClient.get(`/outdoor/dashboard/batches?page=${page || 1}&limit=${limit || 10}`);
      return response;
    },
    getIndoorAvailable: ()                  => apiClient.get('/outdoor/batches/indoor-available'),
    importFromIndoor:   (data: any)         => apiClient.post('/outdoor/batches/import-from-indoor', data),
    delete:             (batchCode: string) => apiClient.delete(`/outdoor/batches/${batchCode}`),
  },

  // Mortality — stored on tunnel_shifts, synced to batches.total_mortality via trigger
  mortality: {
    getHistory:       ()                  => apiClient.get('/outdoor/outdoor-mortality'),
    getLog:           (page?: number, limit?: number) => apiClient.get(`/outdoor/outdoor-mortality/log?page=${page || 1}&limit=${limit || 10}`),
    getSummary:       (page?: number, limit?: number) => apiClient.get(`/outdoor/outdoor-mortality/summary?page=${page || 1}&limit=${limit || 10}`),
    getByBatch:       (batchCode: string) => apiClient.get(`/outdoor/outdoor-mortality/batch/${batchCode}`),
    // Returns { id, mortality_count, reason } for the current tunnel stay
    getCurrentStay:   (batchCode: string) => apiClient.get(`/outdoor/outdoor-mortality/current-stay/${batchCode}`),
    // SET absolute mortality value (not additive) — trigger recalculates totals
    recordMortality:  (batchCode: string, mortalityCount: number, reason?: string, expected_mortality?: number) =>
      apiClient.post(`/outdoor/outdoor-mortality/${batchCode}`, { mortalityCount, reason, expected_mortality }),
  },

  // Fertilization
  fertilization: {
    getAll:    (page?: number, limit?: number) => apiClient.get(`/outdoor/fertilization/history?page=${page || 1}&limit=${limit || 10}`),
    create:    (data: any)             => apiClient.post('/outdoor/fertilization', data),
    update:    (id: number, data: any) => apiClient.put(`/outdoor/fertilization/${id}`, data),
    delete:    (id: number)            => apiClient.delete(`/outdoor/fertilization/${id}`),
  },

  // Sampling — renamed from create_sampling/report_sampling
  sampling: {
    getSubmissions: (page?: number, limit?: number) => apiClient.get(`/outdoor/sampling/create?page=${page || 1}&limit=${limit || 10}`),
    getResults:     (page?: number, limit?: number) => apiClient.get(`/outdoor/sampling/report?page=${page || 1}&limit=${limit || 10}`),
    getSummary:     (page?: number, limit?: number) => apiClient.get(`/outdoor/sampling/summary?page=${page || 1}&limit=${limit || 10}`),
    submit:         (data: any)             => apiClient.post('/outdoor/sampling/submit', data),
    reportResult:   (id: number, data: any) => apiClient.put(`/outdoor/sampling/${id}/result`, data),
    deleteSubmission: (id: number)          => apiClient.delete(`/outdoor/sampling/create/${id}`),
    deleteResult:     (id: number)          => apiClient.delete(`/outdoor/sampling/report/${id}`),
  },

  // Batch timeline
  batchTimeline: {
    getBatches:  ()                  => apiClient.get('/outdoor/batch-timeline/batches'),
    getTimeline: (batchCode: string) => apiClient.get(`/outdoor/batch-timeline/${batchCode}`),
    getStats:    (batchCode: string) => apiClient.get(`/outdoor/batch-timeline/${batchCode}/stats`),
  },
};
