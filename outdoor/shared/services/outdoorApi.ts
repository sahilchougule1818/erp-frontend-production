import apiClient from './apiClient';
import { 
  ShiftPayload, 
  TransitionPayload, 
  UndoPayload 
} from '../types/outdoor.types';

export const outdoorApi = {

  // Unified batch operations — shift, transition, undo
  unified: {
    getRegistry:         (page?: number, limit?: number) => apiClient.get(`/outdoor/unified/registry?page=${page || 1}&limit=${limit || 10}`),
    getDashboardStats:   (params?: string) => apiClient.get(`/outdoor/unified/dashboard/stats${params || ''}`),
    getTunnelOccupancy:  (params?: string) => apiClient.get(`/outdoor/unified/dashboard/tunnel-occupancy${params || ''}`),
    getHoldingArea:      ()                => apiClient.get('/outdoor/unified/dashboard/holding-area'),
    makeShift:           (data: ShiftPayload)      => apiClient.post('/outdoor/unified/shift', data),
    phaseTransition:     (data: TransitionPayload) => apiClient.post('/outdoor/unified/transition', data),
    undoLastAction:      (data: UndoPayload)       => apiClient.post('/outdoor/unified/undo', data),
    getUndoPreview:      (batchCode: string)       => apiClient.get(`/outdoor/unified/undo-preview/${batchCode}`),
  },

  // Phase view endpoints — renamed from 'shifting' to 'tunnel-shifts'
  phaseViews: {
    getPrimaryHardening:   (page?: number, limit?: number) => apiClient.get(`/outdoor/views/primary-hardening?page=${page || 1}&limit=${limit || 10}`),
    getSecondaryHardening: (page?: number, limit?: number) => apiClient.get(`/outdoor/views/secondary-hardening?page=${page || 1}&limit=${limit || 10}`),
    getTunnelShifts:       (page?: number, limit?: number) => apiClient.get(`/outdoor/views/tunnel-shifts?page=${page || 1}&limit=${limit || 10}`),
    getHoldingArea:        (page?: number, limit?: number) => apiClient.get(`/outdoor/views/holding-area?page=${page || 1}&limit=${limit || 10}`),
  },

  // Tunnels — capacity is visual only, no enforcement
  tunnels: {
    getAll:  ()                                                => apiClient.get('/outdoor/tunnels'),
    create:  (data: { tunnelName: string; capacity?: number }) => apiClient.post('/outdoor/tunnels', data),
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
      const response = apiClient.get(`/outdoor/unified/registry?page=${page || 1}&limit=${limit || 10}`);
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
    getAll:    (page?: number, limit?: number) => apiClient.get(`/outdoor/activity/fertilization/history?page=${page || 1}&limit=${limit || 10}`),
    create:    (data: any)             => apiClient.post('/outdoor/activity/fertilization', data),
    update:    (id: number, data: any) => apiClient.put(`/outdoor/activity/fertilization/${id}`, data),
    delete:    (id: number)            => apiClient.delete(`/outdoor/activity/fertilization/${id}`),
  },

  // Sampling — renamed from create_sampling/report_sampling
  sampling: {
    getSubmissions: (page?: number, limit?: number) => apiClient.get(`/outdoor/activity/sampling/create?page=${page || 1}&limit=${limit || 10}`),
    getResults:     (page?: number, limit?: number) => apiClient.get(`/outdoor/activity/sampling/report?page=${page || 1}&limit=${limit || 10}`),
    getSummary:     (page?: number, limit?: number) => apiClient.get(`/outdoor/activity/sampling/summary?page=${page || 1}&limit=${limit || 10}`),
    submit:         (data: any)             => apiClient.post('/outdoor/activity/sampling/submit', data),
    reportResult:   (id: number, data: any) => apiClient.put(`/outdoor/activity/sampling/${id}/result`, data),
    deleteSubmission: (id: number)          => apiClient.delete(`/outdoor/activity/sampling/create/${id}`),
    deleteResult:     (id: number)          => apiClient.delete(`/outdoor/activity/sampling/report/${id}`),
  },

  // Batch timeline
  batchTimeline: {
    getBatches:  ()                  => apiClient.get('/outdoor/batch-timeline/batches'),
    getTimeline: (batchCode: string) => apiClient.get(`/outdoor/batch-timeline/${batchCode}`),
    getStats:    (batchCode: string) => apiClient.get(`/outdoor/batch-timeline/${batchCode}/stats`),
  },
};
