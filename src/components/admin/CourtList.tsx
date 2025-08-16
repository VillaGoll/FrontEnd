import { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Card, CardContent, Chip, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import courtService from '../../services/court.service';
import { formatCurrency } from '../../utils/currency';

interface Court {
    _id: string;
    name: string;
    color: string;
    pricing?: {
        sixAM?: number;
        sevenToFifteen?: number;
        sixteenToTwentyOne?: number;
        twentyTwo?: number;
        twentyThree?: number;
    }
}

interface CourtListProps {
    onEdit: (court: Court) => void;
    refresh: boolean;
}

const CourtList = ({ onEdit, refresh }: CourtListProps) => {
    const [courts, setCourts] = useState<Court[]>([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);

    const fetchCourts = () => {
        courtService.getAllCourts()
            .then(response => {
                setCourts(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    };

    useEffect(() => {
        fetchCourts();
    }, [refresh]);

    const handleOpenDeleteDialog = (id: string) => {
        setSelectedCourtId(id);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setSelectedCourtId(null);
        setOpenDeleteDialog(false);
    };

    const handleDelete = () => {
        if (selectedCourtId) {
            courtService.deleteCourt(selectedCourtId)
                .then(() => {
                    fetchCourts();
                    handleCloseDeleteDialog();
                })
                .catch(err => console.error(err));
        }
    };

    return (
        <Card sx={{ mt: 4 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>Canchas</Typography>
                <List>
                    {courts.map(court => (
                        <ListItem key={court._id} secondaryAction={
                            <>
                                <IconButton edge="end" aria-label="edit" onClick={() => onEdit(court)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(court._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        }>
                            <ListItemText
                                primary={court.name}
                                secondary={
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <Chip size="small" label={`6:00 ${formatCurrency(court.pricing?.sixAM ?? 0)}`} />
                                        <Chip size="small" label={`7-15 ${formatCurrency(court.pricing?.sevenToFifteen ?? 0)}`} />
                                        <Chip size="small" label={`16-21 ${formatCurrency(court.pricing?.sixteenToTwentyOne ?? 0)}`} />
                                        <Chip size="small" label={`22:00 ${formatCurrency(court.pricing?.twentyTwo ?? 0)}`} />
                                        <Chip size="small" label={`23:00 ${formatCurrency(court.pricing?.twentyThree ?? 0)}`} />
                                    </Stack>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de que deseas eliminar esta cancha? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default CourtList;