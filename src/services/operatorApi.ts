import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getOperators = () => axios.get(`${API_URL}/operators`);

export const getOperatorsBySection = (section: string) => 
  axios.get(`${API_URL}/operators/section/${encodeURIComponent(section)}`);

export const createOperator = (data: any) => axios.post(`${API_URL}/operators`, data);

export const updateOperator = (id: number, data: any) => 
  axios.put(`${API_URL}/operators/${id}`, data);

export const deleteOperator = (id: number) => axios.delete(`${API_URL}/operators/${id}`);
