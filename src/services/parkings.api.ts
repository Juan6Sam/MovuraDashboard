
import apiClient from './apiClient';
import { Parking, Comercio, ConfiguracionParking } from '../types';

// --- Parkings Endpoints ---

// Endpoint: GET /api/parkings
export const getParkings = async (activeOnly: boolean = false): Promise<Parking[]> => {
  const response = await apiClient.get('/parkings', { params: { activeOnly } });
  return response.data;
};

// Endpoint: GET /api/parkings/{parkingId}
export const getParkingById = async (parkingId: string): Promise<Parking> => {
  const response = await apiClient.get(`/parkings/${parkingId}`);
  return response.data;
};

// Endpoint: PUT /api/parkings/{parkingId}/config
export const updateParkingConfig = async (parkingId: string, config: ConfiguracionParking): Promise<{ success: boolean; config: ConfiguracionParking }> => {
  const response = await apiClient.put(`/parkings/${parkingId}/config`, config);
  return response.data;
};

// --- Comercios Endpoints ---

// Endpoint: GET /api/parkings/{parkingId}/comercios
export const getComercios = async (parkingId: string): Promise<Comercio[]> => {
  const response = await apiClient.get(`/parkings/${parkingId}/comercios`);
  return response.data;
};

// Endpoint: POST /api/parkings/{parkingId}/comercios
export const createComercio = async (parkingId: string, comercio: Omit<Comercio, 'id'>): Promise<Comercio> => {
  const response = await apiClient.post(`/parkings/${parkingId}/comercios`, comercio);
  return response.data;
};

// Endpoint: PUT /api/parkings/{parkingId}/comercios/{comercioId}
export const updateComercio = async (parkingId: string, comercioId: number, comercio: Comercio): Promise<Comercio> => {
  const response = await apiClient.put(`/parkings/${parkingId}/comercios/${comercioId}`, comercio);
  return response.data;
};

// Endpoint: DELETE /api/parkings/{parkingId}/comercios/{comercioId}
export const deleteComercio = async (parkingId: string, comercioId: number): Promise<void> => {
  await apiClient.delete(`/parkings/${parkingId}/comercios/${comercioId}`);
};

// Endpoint: PUT /api/parkings/{parkingId}/comercios (Bulk Update)
export const bulkUpdateComercios = async (parkingId: string, comercios: Comercio[]): Promise<Comercio[]> => {
  const response = await apiClient.put(`/parkings/${parkingId}/comercios`, comercios);
  return response.data;
};

// Endpoint: POST /api/parkings/{parkingId}/comercios/{comercioId}/notify
export const notifyComercioUsers = async (parkingId: string, comercioId: number, accounts: string[]): Promise<void> => {
  await apiClient.post(`/parkings/${parkingId}/comercios/${comercioId}/notify`, accounts);
};
