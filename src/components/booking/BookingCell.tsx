import { TableCell, TextField, Checkbox, Button, IconButton, Autocomplete, createFilterOptions, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Chip, Typography } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import RepeatIcon from '@mui/icons-material/Repeat';
import AuthContext from '../../context/AuthContext';
import bookingService from '../../services/booking.service';
import clientService from '../../services/client.service';
import type { BookingData } from '../../types/booking';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Client {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

interface AddOption {
    inputValue: string;
    title: string;
}

type AutocompleteOption = Client | AddOption;

interface BookingCellProps {
    booking: BookingData | undefined;
    courtId: string | undefined;
    date: string;
    timeSlot: string;
    onBookingUpdate: () => void;
    isPast: boolean;
    courtColor?: string;
    hour: string;
    day: Date;
    courtName: string;
}

const BookingCell = ({ booking, courtId, date, timeSlot, onBookingUpdate, isPast, hour, courtColor, day, courtName }: BookingCellProps) => {
    const auth = useContext(AuthContext);
    const [clientName, setClientName] = useState(booking?.clientName || '');
    const [deposit, setDeposit] = useState(booking?.depositNote || booking?.deposit?.toString() || '');
    const [arrived, setArrived] = useState(booking?.status === 'Llegó');
    const [isDirty, setIsDirty] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    useEffect(() => {
        clientService.getAllClients().then(response => {
            setClients(response.data);
        });
    }, []);

    useEffect(() => {
        setClientName(booking?.clientName || '');
        setDeposit(booking?.depositNote || booking?.deposit?.toString() || '');
        setArrived(booking?.status === 'Llegó');
        setIsDirty(false);
    }, [booking]);

    useEffect(() => {
        if (!booking) {
            if (clientName || deposit) {
                setIsDirty(true);
            } else {
                setIsDirty(false);
            }
            return;
        }
        
        const originalDepositOrNote = booking.depositNote ?? booking.deposit?.toString() ?? '';
        const hasChanged = (
            clientName !== booking.clientName ||
            deposit !== originalDepositOrNote ||
            arrived !== (booking.status === 'Llegó')
        );
        setIsDirty(hasChanged);
    }, [clientName, deposit, arrived, booking]);

    const handleSave = () => {
        const match = deposit.match(/-?\d+(?:[.,]\d+)?/);
        const parsed = match ? parseFloat(match[0].replace(',', '.')) : 0;
        if (parsed < 0) {
            toast.error('El anticipo no puede ser un número negativo');
            return;
        }

        if (!courtId) return;

        const bookingData: Omit<BookingData, '_id'> = {
            clientName,
            client: selectedClient?._id,
            deposit: parsed,
            depositNote: deposit,
            status: auth?.user?.role === 'admin' ? (arrived ? 'Llegó' : 'No llegó') : 'No llegó',
            court: courtId,
            date,
            timeSlot
        };

        if (booking && booking._id) {
            // Update existing booking
            bookingService.updateBooking(booking._id, bookingData)
                .then(() => {
                    setIsDirty(false);
                    toast.success('Reserva actualizada con éxito');
                    onBookingUpdate();
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Error al actualizar la reserva');
                });
        } else {
            // Create new booking
            bookingService.createBooking(bookingData)
                .then(() => {
                    setIsDirty(false);
                    toast.success('Reserva creada con éxito');
                    onBookingUpdate();
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Error al crear la reserva');
                });
        }
    };

    const handleDelete = () => {
        if (booking && booking._id) {
            bookingService.deleteBooking(booking._id)
                .then(() => {
                    toast.success('Reserva eliminada con éxito');
                    onBookingUpdate();
                })
                .catch((err: unknown) => {
                    console.error(err);
                    toast.error('Error al eliminar la reserva');
                });
        }
    };

    const handleCreateClient = () => {
        clientService.createClient({ name: newClientName, email: '', phone: '' })
            .then((response) => {
                toast.success('Cliente agregado con éxito');
                const newClient = response.data;
                setClients([...clients, newClient]);
                setClientName(newClient.name);
                setSelectedClient(newClient);
                handleCloseDialog();
            })
            .catch(err => {
                console.error(err);
                toast.error('Error al agregar el cliente');
            });
    };

    const handleOpenDialog = (name: string) => {
        setNewClientName(name);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewClientName('');
    };

    const handlePermanentToggle = () => {
        if (booking && booking._id) {
            const newPermanentStatus = !booking.isPermanent;
            bookingService.makePermanentBooking(booking._id, newPermanentStatus)
                .then(() => {
                    toast.success(newPermanentStatus ? 'Reserva hecha permanente por 12 meses' : 'Permanencia removida');
                    onBookingUpdate();
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Error al cambiar permanencia de la reserva');
                });
        }
    };

    const filter = createFilterOptions<AutocompleteOption>();

    const getBackgroundColor = () => {
        // Solo aplicar colores para estados específicos de reserva
        if (booking) {
            if (booking.status === 'Llegó') return 'rgba(107, 255, 107, 0.99)';
            if (booking.status === 'No llegó') return 'rgb(250, 78, 78)';
            // Si hay reserva pero sin estado específico, usar color amarillo
        }

        // Si no hay reserva, dejar transparente para que se vea el color de la tabla
        return 'rgb(255, 255, 255)';
    };

    return (
        <TableCell
            sx={{
                backgroundColor: getBackgroundColor(),
                position: 'relative',
                padding: { xs: '8px 4px', sm: '16px 8px' },
                height: { xs: '180px', sm: 'auto' },
                overflow: 'visible',
                minWidth: { xs: '150px', sm: '170px' },
                whiteSpace: 'normal',
                border: `1px solid ${courtColor}`
            }}
        >
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                {hour}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', marginBottom: '4px', textTransform: 'capitalize' }}>
                {format(day, 'EEEE d', { locale: es })}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', marginBottom: '4px' }}>
                {courtName}
            </Typography>
            {booking?.isPermanent && (
                <Chip
                    label="Permanente"
                    size="small"
                    color="primary"
                    sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        fontSize: '0.6rem',
                        height: '16px',
                        '& .MuiChip-label': {
                            padding: '0 4px'
                        }
                    }}
                />
            )}
            <Autocomplete<AutocompleteOption, false, false, true>
                value={clients.find(c => c.name === clientName) || clientName}
                onChange={(_event, newValue) => {
                    if (typeof newValue === 'string') {
                        setClientName(newValue);
                        setSelectedClient(null);
                    } else if (newValue && 'inputValue' in newValue && auth?.user?.role === 'admin') {
                        handleOpenDialog(newValue.inputValue);
                    } else if (newValue && 'name' in newValue) {
                        setClientName(newValue.name);
                        setSelectedClient(newValue as Client);
                    } else {
                        setClientName('');
                        setSelectedClient(null);
                    }
                }}
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    if (auth?.user?.role === 'admin' && params.inputValue !== '' && !clients.some(option => option.name === params.inputValue)) {
                        filtered.push({
                            inputValue: params.inputValue,
                            title: `Agregar "${params.inputValue}"`,
                        });
                    }
                    return filtered;
                }}
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                options={clients}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') {
                        return option;
                    }
                    if ('title' in option) {
                        return option.title;
                    }
                    return option.name;
                }}
                renderOption={(props, option) => {
                  // Usar el ID como key para clientes, o el título para opciones de "Agregar"
                  const key = 'title' in option ? option.title : option._id;
                  return <li {...props} key={key}>{'title' in option ? option.title : option.name}</li>;
                }}
                sx={{
                    width: { xs: '100%', sm: 150 },
                    mb: 1,
                    '& .MuiInputBase-root': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    },
                    '& .MuiAutocomplete-input': {
                        padding: '4px 6px !important'
                    },
                    '& .MuiAutocomplete-endAdornment': {
                        top: 'calc(50% - 12px)'
                    }
                }}
                freeSolo
                disabled={isPast && !booking}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="standard"
                        placeholder="Nombre Cliente"
                        sx={{
                            // apuntamos al input real usado por MUI
                            '& .MuiInputBase-input::placeholder': {
                                color: 'rgba(0,0,0,1)', // negro puro
                                opacity: 1,             // quitar la opacidad por defecto
                                fontSize: '0.75rem'
                            },
                            // por si está disabled (MUI añade la clase .Mui-disabled)
                            '& .MuiInputBase-input.Mui-disabled::placeholder': {
                                color: 'rgba(0,0,0,1)',
                                opacity: 1
                            }
                        }}
                        onChange={(e) => setClientName(e.target.value)}
                        disabled={isPast && !booking}
                        InputProps={{
                            ...params.InputProps,
                            style: {
                                fontSize: '0.75rem',
                                fontWeight: !isPast || booking ? 'bold' : 'normal',
                                color: !isPast || booking ? 'black' : 'rgba(0, 0, 0, 0.38)'
                            }
                        }}
                    />
                )}
            />
            <TextField
                variant="standard"
                placeholder="Anticipo/Nota"
                type="text"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                fullWidth
                sx={{
                    '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(0,0,0,1)', // negro puro
                        opacity: 1,             // quitar la opacidad por defecto
                        fontSize: '0.75rem'
                    },
                    // por si está disabled (MUI añade la clase .Mui-disabled)
                    '& .MuiInputBase-input.Mui-disabled::placeholder': {
                        color: 'rgba(0,0,0,1)',
                        opacity: 1
                    },
                    mb: 1,
                    '& .MuiInputBase-root': {
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    },
                    '& input': {
                        padding: '4px 6px'
                    }
                }}
                inputProps={{
                    style: {
                        fontSize: '0.75rem',
                        fontWeight: !isPast || booking ? 'bold' : 'normal',
                        color: !isPast || booking ? 'black' : 'rgba(0, 0, 0, 0.38)'
                    }
                }}
                disabled={isPast && !booking}
            />
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {auth?.user?.role === 'admin' && (
                    <Checkbox
                        checked={arrived}
                        onChange={(e) => setArrived(e.target.checked)}
                        disabled={!booking}
                        size="small"
                        sx={{
                            padding: '2px',
                            '& .MuiSvgIcon-root': {
                                fontSize: { xs: '0.9rem', sm: '1.1rem' }
                            }
                        }}
                    />
                )}
                	
                <Button
                    onClick={handleSave}
                    size="small"
                    disabled={!isDirty || !clientName  || (booking && auth?.user?.role !== 'admin')}
                    sx={{
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        padding: { xs: '2px 4px', sm: '3px 8px' },
                        minWidth: { xs: '50px', sm: 'auto' }
                    }}
                >
                    {booking ? 'Actualizar' : 'Guardar'}
                </Button>
                {auth?.user?.role === 'admin' && booking && (
                    <>
                        <IconButton
                            onClick={handleDelete}
                            size="small"
                            //disabled={isPast}
                            sx={{
                                padding: '2px',
                                '& .MuiSvgIcon-root': {
                                    fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                }
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                        <Button
                            onClick={handlePermanentToggle}
                            size="small"
                            variant={booking.isPermanent ? "contained" : "outlined"}
                            color={booking.isPermanent ? "secondary" : "primary"}
                            startIcon={<RepeatIcon sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }} />}
                            sx={{
                                ml: { xs: 0, sm: 1 },
                                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                minWidth: 'auto',
                                padding: { xs: '1px 2px', sm: '3px 6px' }
                            }}
                            //disabled={isPast}
                        >
                            {booking.isPermanent ? 'No Perm.' : 'Perm.'}
                        </Button>
                    </>
                )}
            </div>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirmar</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        El cliente "{newClientName}" no existe. ¿Desea agregarlo?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleCreateClient}>Agregar</Button>
                </DialogActions>
            </Dialog>
        </TableCell>
    );
};

export default BookingCell;
