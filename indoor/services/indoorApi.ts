import apiClient from '../../shared/services/apiClient';

export const indoorApi = {
  // Batch operations - create, subculture, incubate, export, undo, delete
  batchOperations: {
    getAllBatches:        (params?: { page?: number }) => apiClient.get('/indoor/dashboard/batches', { params }),
    createBatch:          (data: any) => apiClient.post('/indoor/batch/create', data),
    subculture:           (data: any) => apiClient.post('/indoor/subculture', data),
    incubate:             (data: any) => apiClient.post('/indoor/incubation', data),
    exportBatch:          (data: any) => apiClient.post('/indoor/batch/export', data),
    unexportBatch:        (data: any) => apiClient.post('/indoor/batch/unexport', data),
    undoLastAction:       (data: any) => apiClient.post('/indoor/batch/undo', data),
    getUndoPreview:       (batchCode: string) => apiClient.get(`/indoor/batch/undo-preview/${batchCode}`),
    deleteBatch:          (batchCode: string) => apiClient.delete(`/indoor/batch/${batchCode}`)
  },

  // Dashboard - stats, stage distribution, ready for export
  dashboard: {
    getDashboardStats:    (params?: string) => apiClient.get(`/indoor/dashboard/indoor-stats${params || ''}`),
    getStageDistribution: () => apiClient.get('/indoor/dashboard/stage-distribution'),
    getReadyForExport:    () => apiClient.get('/indoor/dashboard/ready-for-export')
  },

  phaseViews: {
    getSubculturing: (page?: number, limit?: number) => apiClient.get('/indoor/subculture', { params: { page, limit } }),
    getIncubation:   (page?: number, limit?: number) => apiClient.get('/indoor/incubation', { params: { page, limit } }),
    updateIncubationDetails: (eventCode: string, data: { incubationPeriod: number; temperature?: number; humidity?: number; lightIntensity?: number }) => 
      apiClient.put(`/indoor/incubation/${eventCode}`, data)
  },

  sampling: {
    getSubmissions:    (params?: { page?: number }) => apiClient.get('/indoor/sampling/submissions', { params }),
    getResults:        (params?: { page?: number }) => apiClient.get('/indoor/sampling/results', { params }),
    getSummary:        (params?: { page?: number }) => apiClient.get('/indoor/sampling/summary', { params }),
    submit:            (data: any) => apiClient.post('/indoor/sampling/submit', data),
    reportResult:      (id: number | string, data: any) => apiClient.put(`/indoor/sampling/result/${id}`, data),
    deleteSubmission:  (id: number | string) => apiClient.delete(`/indoor/sampling/submission/${id}`),
    deleteResult:      (id: number | string) => apiClient.delete(`/indoor/sampling/result/${id}`)
  },

  contamination: {
    getAll:           (params?: { page?: number }) => apiClient.get('/indoor/contamination', { params }),
    getSummary:       () => apiClient.get('/indoor/contamination/summary'),
    getByBatch:       (batchCode: string) => apiClient.get(`/indoor/contamination/batch/${batchCode}`),
    getActiveRecord:  (batchCode: string) => apiClient.get(`/indoor/contamination/batch/${batchCode}/active`),
    update:           (id: number | string, data: { contamination_count: number; notes?: string | null; expected_contamination?: number }) => apiClient.put(`/indoor/contamination/${id}`, data)
  },

  operators: {
    getAll:    (params?: { page?: number; limit?: number }) => apiClient.get('/indoor/operators', { params }),
    getLog:    () => apiClient.get('/indoor/operator-log'),
    create:    (data: any) => apiClient.post('/indoor/operators', data),
    update:    (id: number | string, data: any) => apiClient.put(`/indoor/operators/${id}`, data),
    delete:    (id: number | string) => apiClient.delete(`/indoor/operators/${id}`),
    getAssignments: (params: { event_code?: string; activity_type?: string; media_code?: string; cleaning_id?: number; cleaning_type?: string }) => {
      const { event_code, activity_type = 'event', media_code, cleaning_id, cleaning_type } = params;
      let url = `/indoor/operators/assignment?activity_type=${activity_type}`;
      if (media_code) url += `&media_code=${media_code}`;
      if (event_code) url += `&event_code=${event_code}`;
      if (cleaning_id) url += `&cleaning_id=${cleaning_id}&cleaning_type=${cleaning_type}`;
      return apiClient.get(url);
    },
    addAssignment: (data: {
      event_code?: string;
      operator_id: number;
      role?: string;
      activity_type?: string;
      media_code?: string;
      batch_code?: string;
      stage?: string;
      cleaning_id?: number;
      cleaning_type?: string;
    }) => apiClient.post('/indoor/operators/assignment', data),
    removeAssignment: (id: number) => apiClient.delete(`/indoor/operators/assignment/${id}`)
  },

  batchTimeline: {
    getBatches:  () => apiClient.get('/indoor/batch-timeline/batches'),
    getTimeline: (batchCode: string) => apiClient.get(`/indoor/batch-timeline/${batchCode}`)
  },

  mediaPreparation: {
    getAll:       (params?: { page?: number; status?: string }) => apiClient.get('/indoor/media-batches', { params }),
    getPending:   () => apiClient.get('/indoor/media-batches/pending'),
    getCompleted: () => apiClient.get('/indoor/media-batches/completed'),
    create:       (data: any) => apiClient.post('/indoor/media-batches', data),
    update:       (id: number | string, data: any) => apiClient.put(`/indoor/media-batches/${id}`, data),
    delete:       (id: number | string) => apiClient.delete(`/indoor/media-batches/${id}`)
  },

  autoclave: {
    getAll:  () => apiClient.get('/indoor/autoclave-cycles'),
    create:  (data: any) => apiClient.post('/indoor/autoclave-cycles', data),
    update:  (id: number | string, data: any) => apiClient.put(`/indoor/autoclave-cycles/${id}`, data),
    delete:  (id: number | string) => apiClient.delete(`/indoor/autoclave-cycles/${id}`)
  },

  cleaning: {
    getAll:  (params?: { type?: string; page?: number }) => {
      const queryParams: any = {};
      if (params?.type) queryParams.type = params.type;
      if (params?.page) queryParams.page = params.page;
      return apiClient.get('/indoor/cleaning', { params: queryParams });
    },
    create:  (data: any) => apiClient.post('/indoor/cleaning', data),
    update:  (id: number | string, data: any) => apiClient.put(`/indoor/cleaning/${id}`, data),
    delete:  (id: number | string, type: string) => apiClient.delete(`/indoor/cleaning/${id}?type=${type}`)
  }
};
