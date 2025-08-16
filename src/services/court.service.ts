import api from './api';

export interface CourtPricingPayload {
    pricing?: {
        sixAM?: number;
        sevenToFifteen?: number;
        sixteenToTwentyOne?: number;
        twentyTwo?: number;
        twentyThree?: number;
    };
    name?: string;
    color?: string;
    createOriginal?: boolean;
}

const getAllCourts = () => {
    return api.get('/courts');
};

const createCourt = (data: CourtPricingPayload) => {
    return api.post('/courts', data);
};

const updateCourt = (id: string, data: CourtPricingPayload) => {
    return api.put(`/courts/${id}`, data);
};

const deleteCourt = (id: string) => {
    return api.delete(`/courts/${id}`);
};

const getOriginalCourts = () => {
    return api.get('/courts/originals');
};

const courtService = {
    getAllCourts,
    createCourt,
    updateCourt,
    deleteCourt,
    getOriginalCourts,
};

export default courtService;