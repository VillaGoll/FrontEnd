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
  }
};

export default statsService;