import api from './api';

export interface PeriodFilter {
  type: 'week' | 'month' | 'year';
  startDate?: Date;
  endDate?: Date;
}

export interface ClientStats {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bookingsCount: number;
  attendanceCount: number;
  attendanceRate: number;
}

export interface FinancialStats {
  totalIncome: number;
  byPeriod: {
    date: string;
    income: number;
  }[];
  byCourt: {
    courtId: string;
    courtName: string;
    income: number;
  }[];
  bySchedule: {
    hour: number;
    income: number;
  }[];
}

export interface NoShowDetail {
  date: string;
  timeSlot: string;
  courtName: string;
  deposit: number;
}

export interface NoShowClient {
  _id: string;
  name: string;
  phone: string;
  totalBookings: number;
  noShowCount: number;
  noShowRate: number;
  noShowDetails: NoShowDetail[];
}

const statsService = {
  // Obtener estadísticas de clientes
  getClientStats: async (filter: PeriodFilter): Promise<ClientStats[]> => {
    const { data } = await api.get('/stats/clients', { params: filter });
    return data;
  },

  // Obtener top clientes por reservas
  getTopClientsByBookings: async (filter: PeriodFilter, limit: number = 10): Promise<ClientStats[]> => {
    const { data } = await api.get('/stats/clients/top-bookings', { 
      params: { ...filter, limit } 
    });
    return data;
  },

  // Obtener top clientes por asistencia
  getTopClientsByAttendance: async (filter: PeriodFilter, limit: number = 10): Promise<ClientStats[]> => {
    const { data } = await api.get('/stats/clients/top-attendance', { 
      params: { ...filter, limit } 
    });
    return data;
  },

  // Obtener estadísticas financieras
  getFinancialStats: async (filter: PeriodFilter): Promise<FinancialStats> => {
    const { data } = await api.get('/stats/financial', { params: filter });
    return data;
  },

  // Exportar datos de clientes a Excel
  exportClientsToExcel: async (filter: PeriodFilter): Promise<Blob> => {
    const response = await api.get('/stats/clients/export', { 
      params: filter,
      responseType: 'blob'
    });
    return response.data;
  },

  // Exportar datos financieros a Excel
  exportFinancialToExcel: async (filter: PeriodFilter): Promise<Blob> => {
    const response = await api.get('/stats/financial/export', { 
      params: filter,
      responseType: 'blob'
    });
    return response.data;
  },

  // Obtener reporte anual de clientes (veces jugadas por mes)
  getClientAnnualReport: async (): Promise<{ year: number; clients: { name: string; phone: string; months: number[]; total: number }[] }> => {
    const { data } = await api.get('/stats/clients/annual-report');
    return data;
  },

  // Obtener estadísticas de no-shows
  getNoShowStats: async (filter: PeriodFilter, courtId?: string): Promise<NoShowClient[]> => {
    const params: Record<string, string> = { type: filter.type };
    if (filter.startDate) params.startDate = filter.startDate.toISOString();
    if (filter.endDate) params.endDate = filter.endDate.toISOString();
    if (courtId) params.courtId = courtId;
    const { data } = await api.get('/stats/no-shows', { params });
    return data;
  },

  // Exportar datos de no-shows a Excel
  exportNoShowsToExcel: async (filter: PeriodFilter, courtId?: string): Promise<Blob> => {
    const params: Record<string, string> = { type: filter.type };
    if (filter.startDate) params.startDate = filter.startDate.toISOString();
    if (filter.endDate) params.endDate = filter.endDate.toISOString();
    if (courtId) params.courtId = courtId;
    const response = await api.get('/stats/no-shows/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default statsService;