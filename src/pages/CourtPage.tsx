import { useParams } from 'react-router-dom';
import { Typography, Container } from '@mui/material';
import BookingGrid from '../components/booking/BookingGrid';

const CourtPage = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Cancha 
            </Typography>
            <BookingGrid courtId={id} />
        </Container>
    );
};

export default CourtPage;