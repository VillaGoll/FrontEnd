import api from './api';
import type { BookingData } from '../types/booking';

const getBookingsByCourt = (courtId: string) => {
    return api.get(`/bookings/court/${courtId}`);
};

const getBookingsByCourtAndDateRange = (courtId: string, startDate: string, endDate: string) => {
    return api.get(`/bookings/court/${courtId}/range?startDate=${startDate}&endDate=${endDate}`);
};

const createBooking = (data: BookingData) => {
    return api.post('/bookings', data);
};

const updateBooking = (id: string, data: Partial<BookingData>) => {
    return api.put(`/bookings/${id}`, data);
};

const deleteBooking = (id: string) => {
    return api.delete(`/bookings/${id}`);
};

// Método para hacer una reserva permanente
const makePermanentBooking = (id: string, isPermanent: boolean) => {
    return api.put(`/bookings/${id}/permanent`, { isPermanent });
};

const bookingService = {
    getBookingsByCourt,
    getBookingsByCourtAndDateRange,
    createBooking,
    updateBooking,
    deleteBooking,
    makePermanentBooking,
};

export default bookingService;