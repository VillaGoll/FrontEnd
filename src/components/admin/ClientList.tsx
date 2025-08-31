import { useEffect, useState } from 'react';
import clientService from '../../services/client.service';
import {
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Box,
    CircularProgress,
    Tabs,
    Tab,
    Chip,
    Stack,
    Autocomplete,
    TextField,
} from '@mui/material';
import { Edit, Delete, BarChart } from '@mui/icons-material';

interface Client {
    _id: string;
    name: string;
    phone: string;
}

interface ClientStatsResponse {
    client: Client;
    totalBookings: number;
    arrivedBookings: number;
    arrivalRate: number; // 0..1
    totalDeposit: number;
    avgDeposit: number;
    lastBooking: string | null;
}

interface ClientBookingItem {
    _id: string;
    date: string;
    timeSlot: string;
    court: { _id: string; name: string } | string;
    clientName: string;
    deposit: number;
    status: 'Llegó' | 'No llegó';
}

// Filters state types
type StatusFilter = 'Todos' | 'Llegó' | 'No llegó';

interface Props {
    onEdit: (client: Client) => void;
    refresh: boolean;
}

const ClientList = ({ onEdit, refresh }: Props) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    // Stats state
    const [statsOpen, setStatsOpen] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsData, setStatsData] = useState<ClientStatsResponse | null>(null);
    const [statsError, setStatsError] = useState<string | null>(null);

    // Bookings tab state
    const [tabIndex, setTabIndex] = useState(0);
    const [bookings, setBookings] = useState<ClientBookingItem[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    // Filters state
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
    const [courtFilter, setCourtFilter] = useState<string>('Todas');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    // Compute filtered bookings
    const filteredBookings = bookings.filter(b => {
        // Status
        if (statusFilter !== 'Todos' && b.status !== statusFilter) return false;
        // Court
        if (courtFilter !== 'Todas') {
            const courtName = typeof b.court === 'string' ? b.court : (b.court?.name || '');
            if (courtName !== courtFilter) return false;
        }
        // Date range
        const d = new Date(b.date);
        if (dateFrom) {
            const from = new Date(dateFrom + 'T00:00:00');
            if (d < from) return false;
        }
        if (dateTo) {
            const to = new Date(dateTo + 'T23:59:59.999'); // include whole day
            if (d > to) return false;
        }
        return true;
    });

    useEffect(() => {
        clientService.getAllClients().then(response => {
            setClients(response.data);
        });
    }, [refresh]);

    const handleClickOpen = (id: string) => {
        setSelectedClientId(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedClientId(null);
    };

    const handleDelete = () => {
        if (selectedClientId) {
            clientService.deleteClient(selectedClientId).then(() => {
                setClients(clients.filter(client => client._id !== selectedClientId));
                handleClose();
            });
        }
    };

    const openStats = (client: Client) => {
        setStatsOpen(true);
        setStatsLoading(true);
        setStatsError(null);
        setStatsData(null);
        setTabIndex(0);
        setBookings([]);
        clientService.getClientStats(client._id)
            .then(res => setStatsData(res.data))
            .catch(err => {
                console.error(err);
                setStatsError('No se pudieron cargar las estadísticas');
            })
            .finally(() => setStatsLoading(false));

        setBookingsLoading(true);
        clientService.getClientBookings(client._id)
            .then(res => setBookings(res.data))
            .catch(err => console.error(err))
            .finally(() => setBookingsLoading(false));
    };

    const closeStats = () => {
        setStatsOpen(false);
        setStatsData(null);
        setStatsError(null);
        setBookings([]);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Clientes</Typography>
                <List>
                    {clients.map((client) => (
                        <ListItem key={client._id}
                            secondaryAction={
                                <Box>
                                    <IconButton edge="end" aria-label="stats" onClick={() => openStats(client)}>
                                        <BarChart />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="edit" onClick={() => onEdit(client)}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="delete" onClick={() => handleClickOpen(client._id)}>
                                        <Delete />
                                    </IconButton>
                                </Box>
                            }
                        >
                            <ListItemText
                                primary={client.name}
                                secondary={`Tel: ${client.phone || 'Sin teléfono'}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>

            {/* Dialogo de confirmación para eliminar */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro de que desea eliminar este cliente?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de estadísticas */}
            <Dialog open={statsOpen} onClose={closeStats} fullWidth maxWidth="md">
                <DialogTitle>Estadísticas del cliente</DialogTitle>
                <DialogContent>
                    {statsLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {statsError && (
                        <Typography color="error">{statsError}</Typography>
                    )}
                    {statsData && (
                        <>
                            <Tabs value={tabIndex} onChange={(_e, v) => setTabIndex(v)} sx={{ mb: 2 }}>
                                <Tab label="Resumen" />
                                <Tab label={`Reservas (${bookings.length})`} />
                            </Tabs>

                            {tabIndex === 0 && (
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                                    <Box>
                                        <Typography variant="subtitle2">Cliente</Typography>
                                        <Typography>{statsData.client.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">Tel:{statsData.client.phone || 'Sin teléfono'}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Última reserva</Typography>
                                        <Typography>
                                            {statsData.lastBooking ? 
                                                new Date(statsData.lastBooking).toLocaleString('es-MX', {
                                                    timeZone: 'America/Guatemala',
                                                    year: 'numeric',
                                                    month: '2-digit', 
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : '—'
                                            }
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Reservas totales</Typography>
                                        <Typography>{statsData.totalBookings}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Llegadas</Typography>
                                        <Typography>{statsData.arrivedBookings}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Tasa de asistencia</Typography>
                                        <Typography>{Math.round(statsData.arrivalRate * 100)}%</Typography>
                                    </Box>
                                </Box>
                            )}

                            {tabIndex === 1 && (
                                <Box>
                                    {/* Filters */}
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block' }}>Estado</Typography>
                                            <Tabs value={statusFilter} onChange={(_e, v) => setStatusFilter(v)} variant="scrollable">
                                                <Tab value="Todos" label="Todos" />
                                                <Tab value="Llegó" label="Llegó" />
                                                <Tab value="No llegó" label="No llegó" />
                                            </Tabs>
                                        </Box>
                                        <Box sx={{ minWidth: 180 }}>
                                            <Typography variant="caption" sx={{ display: 'block' }}>Cancha</Typography>
                                            <Autocomplete
                                                options={[...new Set(bookings.map(b => typeof b.court === 'string' ? b.court : (b.court?.name || '')))] as string[]}
                                                value={courtFilter === 'Todas' ? null : courtFilter}
                                                onChange={(_e, val) => setCourtFilter(val || 'Todas')}
                                                renderInput={(params) => <TextField {...params} size="small" placeholder="Todas" />}
                                                clearOnEscape
                                                sx={{ minWidth: 200 }}
                                            />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block' }}>Desde</Typography>
                                            <TextField type="date" size="small" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" sx={{ display: 'block' }}>Hasta</Typography>
                                            <TextField type="date" size="small" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                                        </Box>
                                        <Box sx={{ alignSelf: 'end' }}>
                                            <Button onClick={() => { setStatusFilter('Todos'); setCourtFilter('Todas'); setDateFrom(''); setDateTo(''); }}>
                                                Limpiar filtros
                                            </Button>
                                        </Box>
                                    </Stack>

                                    {bookingsLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <List>
                                            {filteredBookings.map(b => (
                                                <ListItem key={b._id} sx={{ alignItems: 'flex-start' }}>
                                                    <ListItemText
                                                        primary={
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Typography sx={{ minWidth: 160 }}>{new Date(b.date).toLocaleString('es-MX', {
                                                                    timeZone: 'America/Guatemala',
                                                                    year: 'numeric',
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}</Typography>
                                                                <Typography sx={{ fontWeight: 500 }}>{typeof b.court === 'string' ? b.court : b.court?.name}</Typography>
                                                                <Chip size="small" label={b.timeSlot} />
                                                                <Chip size="small" color={b.status === 'Llegó' ? 'success' : 'error'} label={b.status} />
                                                            </Stack>
                                                        }
                                                        secondary={
                                                            <Typography variant="body2" color="text.secondary">
                                                                Cliente: {b.clientName}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                            {filteredBookings.length === 0 && (
                                                <Typography color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
                                                    No hay reservas que coincidan con los filtros.
                                                </Typography>
                                            )}
                                        </List>
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeStats}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default ClientList;