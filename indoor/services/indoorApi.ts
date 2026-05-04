import apiClient from '../../shared/services/apiClient';

export const indoorApi = {
  // Batch operations - create, subculture, incubate, export, undo, delete
  batchOperations: {
    getAllBatches:        (params?: { page?: number; lab_number?: number }) => apiClient.get('/indoor/batch-master', { params }),
    createBatch:          (data: any) => apiClient.post('/indoor/batch-master/create', data),
    subculture:           (data: any) => apiClient.post('/indoor/subculture', data),
    incubate:             (data: any) => apiClient.post('/indoor/incubation', data),
    exportBatch:          (data: any) => apiClient.post('/indoor/batch-master/export', data),
    unexportBatch:        (data: any) => apiClient.post('/indoor/batch-master/unexport', data),
    undoLastAction:       (data: any) => apiClient.post('/indoor/batch-master/undo', data),
    getUndoPreview:       (batchCode: string) => apiClient.get(`/indoor/batch-master/undo-preview/${batchCode}`),
    deleteBatch:          (batchCode: string) => apiClient.delete(`/indoor/batch-master/${batchCode}`)
  },

  // Dashboard - stats, stage distribution, ready for export
  dashboard: {
    getDashboardStats:    (params?: string, labNumber?: number) => {
      const queryParams = params || '';
      const labParam = labNumber !== undefined ? `${queryParams ? '&' : '?'}lab_number=${labNumber}` : '';
      return apiClient.get(`/indoor/dashboard/indoor-stats${queryParams}${labParam}`);
    },
    getStageDistribution: (labNumber?: number) => apiClient.get('/indoor/dashboard/stage-distribution', { params: { lab_number: labNumber } }),
    getReadyForExport:    (labNumber?: number) => apiClient.get('/indoor/dashboard/ready-for-export', { params: { lab_number: labNumber } })
  },

  phaseViews: {
    getSubculturing: (page?: number, limit?: number, labNumber?: number) => apiClient.get('/indoor/subculture', { params: { page, limit, lab_number: labNumber } }),
    getIncubation:   (page?: number, limit?: number, labNumber?: number) => apiClient.get('/indoor/incubation', { params: { page, limit, lab_number: labNumber } }),
    updateIncubationDetails: (eventCode: string, data: { incubationPeriod: number; temperature?: number; humidity?: number; lightIntensity?: number }) => 
      apiClient.put(`/indoor/incubation/${eventCode}`, data)
  },

  sampling: {
    getSubmissions:    (params?: { page?: number; lab_number?: number }) => apiClient.get('/indoor/sampling/submissions', { params }),
    getResults:        (params?: { page?: number; lab_number?: number }) => apiClient.get('/indoor/sampling/results', { params }),
    getSummary:        (params?: { page?: number; lab_number?: number }) => apiClient.get('/indoor/sampling/summary', { params }),
    submit:            (data: any) => apiClient.post('/indoor/sampling/submit', data),
    reportResult:      (id: number | string, data: any) => apiClient.put(`/indoor/sampling/result/${id}`, data),
    deleteSubmission:  (id: number | string) => apiClient.delete(`/indoor/sampling/submission/${id}`),
    deleteResult:      (id: number | string) => apiClient.delete(`/indoor/sampling/result/${id}`)
  },

  contamination: {
    getAll:           (params?: { page?: number; lab_number?: number }) => apiClient.get('/indoor/contamination', { params }),
    getSummary:       (labNumber?: number) => apiClient.get('/indoor/contamination/summary', { params: { lab_number: labNumber } }),
    getByBatch:       (batchCode: string) => apiClient.get(`/indoor/contamination/batch/${batchCode}`),
    getActiveRecord:  (batchCode: string) => apiClient.get(`/indoor/contamination/batch/${batchCode}/active`),
    update:           (id: number | string, data: { qty_contaminated: number; notes?: string | null; expected_contamination?: number }) => apiClient.put(`/indoor/contamination/${id}`, data)
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
    getBatches:  () => apiClient.get('/indoor/batch-master/batches'),
    getTimeline: (batchCode: string) => apiClient.get(`/indoor/batch-master/${batchCode}`)
  },

  autoclave: {
    getAll:       (params?: { page?: number; status?: string; lab_number?: number }) => apiClient.get('/indoor/autoclave-cycles', { params }),
    getPending:   (params?: { lab_number?: number }) => apiClient.get('/indoor/autoclave-cycles/pending', { params }),
    getCompleted: (params?: { lab_number?: number }) => apiClient.get('/indoor/autoclave-cycles/completed', { params }),
    create:       (data: any) => apiClient.post('/indoor/autoclave-cycles', data),
    update:       (id: number | string, data: any) => apiClient.put(`/indoor/autoclave-cycles/${id}`, data),
    delete:       (id: number | string) => apiClient.delete(`/indoor/autoclave-cycles/${id}`)
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
  },

  rooting: {
    getRootedBatches:       (page = 1, limit = 50, labNumber?: number) => apiClient.get(`/indoor/rooting`, { params: { page, limit, lab_number: labNumber } }),
    makePartialRooting:     (data: any) => apiClient.post('/indoor/rooting/partial', data),
    moveFullBatchToRooting: (data: any) => apiClient.post('/indoor/rooting/full', data),
    undoRootedBatch:        (id: number, created_by: string) => apiClient.delete(`/indoor/rooting/${id}`, { data: { created_by } }),
    recordContamination:    (id: number, data: { qty_contaminated: number; notes?: string }) => apiClient.put(`/indoor/rooting/${id}/contamination`, data),
    markAvailableForOutdoor:(id: number) => apiClient.post(`/indoor/rooting/${id}/mark-outdoor`),
    unmarkFromOutdoor:      (id: number) => apiClient.post(`/indoor/rooting/${id}/unmark-outdoor`)
  },

  labs: {
    getLabs:   () => apiClient.get('/indoor/settings/labs'),
    createLab: (data: { lab_number: number; lab_name: string }) => apiClient.post('/indoor/settings/labs', data),
    updateLab: (id: number, data: { lab_name: string; is_active: boolean }) => apiClient.put(`/indoor/settings/labs/${id}`, data),
    deleteLab: (id: number) => apiClient.delete(`/indoor/settings/labs/${id}`)
  },

  plants: {
    getPlants:    () => apiClient.get('/indoor/settings/plants'),
    createPlant:  (data: { plant_name: string }) => apiClient.post('/indoor/settings/plants', data),
    updatePlant:  (id: number, data: { plant_name: string; is_active: boolean }) => apiClient.put(`/indoor/settings/plants/${id}`, data),
    deletePlant:  (id: number) => apiClient.delete(`/indoor/settings/plants/${id}`)
  },

  batchActions: {
    getPermissions:       (batchCode: string) => apiClient.get(`/indoor/batch-master/${batchCode}/permissions`),
    checkPermission:      (batchCode: string, action: string) => apiClient.get(`/indoor/batch-master/${batchCode}/can/${action}`)
  }
};
