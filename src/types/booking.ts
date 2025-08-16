export interface BookingData {
    _id?: string;
    court: string;
    date: string;
    timeSlot: string;
    clientName: string;
    client?: string; 
    deposit: number;
    status: 'Llegó' | 'No llegó';
    isPermanent?: boolean;
    permanentEndDate?: string;
}