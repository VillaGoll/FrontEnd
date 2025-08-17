import { useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import BookingGrid from '../components/booking/BookingGrid';

const CourtPage = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <Container>
            <BookingGrid courtId={id} />
        </Container>
    );
};

export default CourtPage;