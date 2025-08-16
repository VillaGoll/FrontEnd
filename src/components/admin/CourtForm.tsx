import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { TextField, Button, Box, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Card, CardContent, InputAdornment } from '@mui/material';
import Grid from '@mui/material/Grid'; // Grid v2
import courtService from '../../services/court.service';
import type { CourtPricingPayload } from '../../services/court.service';
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

interface CourtFormProps {
    court: Court | null;
    onSuccess: () => void;
}

const CourtForm = ({ court, onSuccess }: CourtFormProps) => {
    const [loading, setLoading] = useState(false);
            const [name, setName] = useState(court?.name || '');
    const [color, setColor] = useState(court?.color || '');
    const [open, setOpen] = useState(false);

    // Pricing state
    const [sixAM, setSixAM] = useState<number>(court?.pricing?.sixAM ?? 0);
    const [sevenToFifteen, setSevenToFifteen] = useState<number>(court?.pricing?.sevenToFifteen ?? 0);
    const [sixteenToTwentyOne, setSixteenToTwentyOne] = useState<number>(court?.pricing?.sixteenToTwentyOne ?? 0);
    const [twentyTwo, setTwentyTwo] = useState<number>(court?.pricing?.twentyTwo ?? 0);
    const [twentyThree, setTwentyThree] = useState<number>(court?.pricing?.twentyThree ?? 0);

    useEffect(() => {
        if (court) {
            setName(court.name);
            setColor(court.color);
            setSixAM(court.pricing?.sixAM ?? 0);
            setSevenToFifteen(court.pricing?.sevenToFifteen ?? 0);
            setSixteenToTwentyOne(court.pricing?.sixteenToTwentyOne ?? 0);
            setTwentyTwo(court.pricing?.twentyTwo ?? 0);
            setTwentyThree(court.pricing?.twentyThree ?? 0);
        } else {
            setName('');
            setColor('');
            setSixAM(0);
            setSevenToFifteen(0);
            setSixteenToTwentyOne(0);
            setTwentyTwo(0);
            setTwentyThree(0);
        }
    }, [court]);

    const parseNonNegativeNumber = (value: string) => {
        const num = Number(value.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return 0;
        return Math.max(0, num);
    };

            const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const pricing: CourtPricingPayload['pricing'] = {
            sixAM,
            sevenToFifteen,
            sixteenToTwentyOne,
            twentyTwo,
            twentyThree,
        };
        const courtData: CourtPricingPayload = { name, color, pricing };

        if (court) {
            setLoading(true);
            courtService.updateCourt(court._id, courtData)
                .then(() => {
                    toast.success('Cancha actualizada con éxito');
                    onSuccess();
                })
                .catch(err => {
                    console.error(err)
                    toast.error('Error al actualizar la cancha');
                })
                .finally(() => setLoading(false));
        } else {
            setOpen(true);
        }
    };

        const handleClose = (createOriginal = false) => {
        setOpen(false);
        const pricing: CourtPricingPayload['pricing'] = {
            sixAM,
            sevenToFifteen,
            sixteenToTwentyOne,
            twentyTwo,
            twentyThree,
        };
        const courtData: CourtPricingPayload = { name, color, createOriginal, pricing };
        setLoading(true);
        courtService.createCourt(courtData)
            .then(() => {
                toast.success('Cancha creada con éxito');
                onSuccess();
                setName('');
                setColor('');
                setSixAM(0);
                setSevenToFifteen(0);
                setSixteenToTwentyOne(0);
                setTwentyTwo(0);
                setTwentyThree(0);
            })
            .catch(err => {
                console.error(err);
                toast.error('Error al crear la cancha');
            })
            .finally(() => setLoading(false));
    };

    return (
        <Card sx={{ mt: 4 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>{court ? 'Editar Cancha' : 'Nueva Cancha'}</Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        label="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        margin="normal"
                        autoComplete="off"
                    />
                    <TextField
                        label="Color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        fullWidth
                        margin="normal"
                        autoComplete="off"
                    />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Precios por horario (GTQ)</Typography>
                        <Grid container spacing={2}>
                            <Grid>
                                <TextField
                                    label="6:00"
                                    type="number"
                                    value={sixAM}
                                    onChange={(e) => setSixAM(parseNonNegativeNumber(e.target.value))}
                                    inputProps={{ min: 0, step: '1', inputMode: 'decimal' }}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Q</InputAdornment>
                                    }}
                                    helperText={formatCurrency(sixAM)}
                                />
                            </Grid>
                            <Grid >
                                <TextField
                                    label="7:00 - 15:00"
                                    type="number"
                                    value={sevenToFifteen}
                                    onChange={(e) => setSevenToFifteen(parseNonNegativeNumber(e.target.value))}
                                    inputProps={{ min: 0, step: '1', inputMode: 'decimal' }}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Q</InputAdornment>
                                    }}
                                    helperText={formatCurrency(sevenToFifteen)}
                                />
                            </Grid>
                            <Grid>
                                <TextField
                                    label="16:00 - 21:00"
                                    type="number"
                                    value={sixteenToTwentyOne}
                                    onChange={(e) => setSixteenToTwentyOne(parseNonNegativeNumber(e.target.value))}
                                    inputProps={{ min: 0, step: '1', inputMode: 'decimal' }}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Q</InputAdornment>
                                    }}
                                    helperText={formatCurrency(sixteenToTwentyOne)}
                                />
                            </Grid>
                            <Grid>
                                <TextField
                                    label="22:00"
                                    type="number"
                                    value={twentyTwo}
                                    onChange={(e) => setTwentyTwo(parseNonNegativeNumber(e.target.value))}
                                    inputProps={{ min: 0, step: '1', inputMode: 'decimal' }}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Q</InputAdornment>
                                    }}
                                    helperText={formatCurrency(twentyTwo)}
                                />
                            </Grid>
                            <Grid>
                                <TextField
                                    label="23:00"
                                    type="number"
                                    value={twentyThree}
                                    onChange={(e) => setTwentyThree(parseNonNegativeNumber(e.target.value))}
                                    inputProps={{ min: 0, step: '1', inputMode: 'decimal' }}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">Q</InputAdornment>
                                    }}
                                    helperText={formatCurrency(twentyThree)}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
                        Guardar
                    </Button>
                </Box>
            </CardContent>
            <Dialog
                open={open}
                onClose={() => handleClose(false)}
            >
                <DialogTitle>Crear Cancha Original</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Desea crear una copia original de esta cancha? Esta copia será accesible de forma restringida.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose(false)}>No</Button>
                    <Button onClick={() => handleClose(true)} autoFocus>
                        Sí
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default CourtForm;