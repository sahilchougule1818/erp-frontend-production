import apiClient from '../../shared/services/apiClient';

export const reportsApi = {
  fetchReport: (tab: string, params?: { startDate?: string; endDate?: string }) =>
    apiClient.get(`/reports/${tab}`, { params })
};
