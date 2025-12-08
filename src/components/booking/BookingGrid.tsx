import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Box, Button, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import BookingCell from './BookingCell';
import { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import bookingService from '../../services/booking.service';
import courtService from '../../services/court.service';
import type { BookingData } from '../../types/booking';
import { format, startOfWeek, addDays, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import AuthContext from '../../context/AuthContext';

const hours = Array.from({ length: 18 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);

interface BookingGridProps {
    courtId: string | undefined;
}

interface Court {
    _id: string;
    name: string;
    color: string;
}

const BookingGrid = ({ courtId }: BookingGridProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [bookings, setBookings] = useState<BookingData[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [court, setCourt] = useState<Court | null>(null);
    //const [courtColor, setCourtColor] = useState('');
    const [loading, setLoading] = useState(false);

    const courtColor = useMemo(() => {
        if (!court?.name) return '';
        switch (court.name) {
            case 'Cancha 1':
                return 'rgba(30, 126, 11, 0.8)';
            case 'Cancha 2':
                return 'rgba(196, 199, 52, 0.8)';
            case 'Cancha grande':
                return 'rgba(38, 204, 233, 0.8)';
            default:
                return '';
        }
    }, [court?.name]);

    const weekStartsOn = 1; // Monday
    // Memoize week boundaries to avoid any stale calculations in rare re-render sequences
    const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn }), [currentDate]);
    const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
    const week = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);
    // Pre-format header texts to ensure consistent updates
    const weekHeaderStart = useMemo(() => format(weekStart, 'd MMM', { locale: es }), [weekStart]);
    const weekHeaderEnd = useMemo(() => format(weekEnd, 'd MMM yyyy', { locale: es }), [weekEnd]);

    const fetchBookings = useCallback(() => {
        if (courtId) {
            setLoading(true);
            // Obtener solo las reservas de la semana actual para mejorar rendimiento
            const startDate = week[0].toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
            const endDate = week[6].toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });

            bookingService.getBookingsByCourtAndDateRange(courtId, startDate, endDate)
                .then(response => {
                    setBookings(response.data);
                })
                .catch(error => {
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [courtId, week]);

    useEffect(() => {
        fetchBookings();

        // Fetch court details
        if (courtId) {
            courtService.getAllCourts()
                .then(response => {
                    const courtData = response.data.find((c: Court) => c._id === courtId);
                    if (courtData) {
                        setCourt(courtData);
                    }
                })
                .catch(error => {
                    console.error('Error fetching court details:', error);
                });
        }
    }, [courtId, currentDate]);

    // Match booking by local (America/Guatemala) calendar day and timeSlot
    const getBookingForSlot = (date: Date, timeSlot: string) => {
        const dayLocalStr = date.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' }); // YYYY-MM-DD
        const cellHour = parseInt(timeSlot.split(':')[0], 10);
        return bookings.find(b => {
            const raw = b.date as unknown as string;
            // Legacy records could be stored as 'YYYY-MM-DD' (no time component)
            let sameDay = false;
            if (typeof raw === 'string' && !raw.includes('T')) {
                sameDay = raw === dayLocalStr;
            } else {
                // New records are ISO strings (UTC) representing local -06:00 times
                const bookingLocalDate = new Date(raw).toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
                sameDay = bookingLocalDate === dayLocalStr;
            }
            if (!sameDay) return false;

            // Normalize hour comparison to support values like '6:00' vs '06:00'
            const bookingHour = parseInt((b.timeSlot || '').split(':')[0], 10);
            return bookingHour === cellHour;
        });
    }

    // Helper for time-level past determination using America/Guatemala
    const now = new Date();
    const todayKey = now.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' }); // YYYY-MM-DD
    //const currentHour = now.getHours(); // Current hour in local time

    const handlePreviousWeek = () => {
        // Functional update avoids any potential stale state when clicking quickly
        setCurrentDate(prev => subDays(prev, 7));
    };

    const handleNextWeek = () => {
        // Functional update avoids any potential stale state when clicking quickly
        setCurrentDate(prev => addDays(prev, 7));
    };

    const exportToExcel = useCallback(() => {
        if (!courtId || !court) return;

        // Prepare data for Excel
        const excelData = [];

        // Add header row with days
        const headerRow = ['Hora'];
        week.forEach(day => {
            headerRow.push(format(day, 'eeee d', { locale: es }));
        });
        excelData.push(headerRow);

        // Add data rows
        hours.forEach(hour => {
            const row = [hour];
            week.forEach(day => {
                const booking = getBookingForSlot(day, hour);
                let cellValue = '';
                if (booking) {
                    cellValue = `${booking.clientName}\nAnticipo: ${booking.deposit}\nEstado: ${booking.status}`;
                }
                row.push(cellValue);
            });
            excelData.push(row);
        });

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Set column widths
        const colWidths = [{ wch: 10 }]; // Hora column
        for (let i = 0; i < 7; i++) {
            colWidths.push({ wch: 25 }); // Day columns
        }
        ws['!cols'] = colWidths;

        // Apply cell styling based on booking status
        for (let r = 1; r < excelData.length; r++) { // Skip header row
            for (let c = 1; c < excelData[r].length; c++) { // Skip hour column
                const cellRef = XLSX.utils.encode_cell({ r, c });
                const day = week[c - 1];
                const hour = hours[r - 1];
                const booking = getBookingForSlot(day, hour);

                if (!ws[cellRef]) continue;

                if (!ws[cellRef].s) ws[cellRef].s = {};

                // Apply court color to all cells
                if (court && court.color) {
                    try {
                        // Convert hex to RGB and use as background with transparency
                        const hex = court.color.replace('#', '');
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);
                        ws[cellRef].s.fill = {
                            fgColor: { rgb: hex },
                            patternType: 'solid'
                        };
                        // Use white or black text depending on background brightness
                        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        ws[cellRef].s.font = {
                            color: { rgb: brightness > 128 ? '000000' : 'FFFFFF' }
                        };
                    } catch (e) {
                        console.error('Error applying color:', e);
                    }
                }

                // Additional styling for bookings
                if (booking) {
                    if (booking.status === 'Llegó') {
                        ws[cellRef].s.fill = {
                            fgColor: { rgb: '00FF00' }, // Green for arrived
                            patternType: 'solid'
                        };
                    } else if (booking.status === 'No llegó') {
                        ws[cellRef].s.fill = {
                            fgColor: { rgb: 'FF0000' }, // Red for no-show
                            patternType: 'solid'
                        };
                    }
                }
            }
        }

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reservas');

        // Generate filename with court name and date range
        const startDate = format(week[0], 'yyyy-MM-dd');
        const endDate = format(week[6], 'yyyy-MM-dd');
        const filename = `Reservas_${court.name}_${startDate}_${endDate}.xlsx`;

        // Export
        XLSX.writeFile(wb, filename);
    }, [bookings, courtId, court, week, hours]);
    return (
        <TableContainer component={Paper} >
            <Typography variant="h4" component="h1" gutterBottom>
                {court?.name}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <IconButton onClick={handlePreviousWeek}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" key={`${weekHeaderStart}-${weekHeaderEnd}`}>
                        Semana del {weekHeaderStart} al {weekHeaderEnd}
                    </Typography>
                    {loading && <CircularProgress size={20} />}
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FileDownloadIcon />}
                        onClick={exportToExcel}
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Excel
                    </Button>
                    <IconButton onClick={handleNextWeek}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Box>
            </Box>
            <Table
                sx={{
                    minWidth: { xs: 800, sm: 900 },
                    width: '100%',
                    tableLayout: 'fixed',
                    backgroundColor: `${courtColor}`, // Aplicar color de la cancha con 25% de opacidad
                    '& th, & td': {
                        padding: isMobile ? '6px 2px' : '16px 8px',
                        fontSize: isMobile ? '0.7rem' : '0.875rem',
                        borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                        overflow: 'visible'
                    },
                    '& th': {
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                }}
                aria-label="booking table"
            >
                <TableHead>
                    <TableRow>
                        {week.map(day => (
                            <TableCell
                                key={day.toString()}
                                sx={{
                                    wordBreak: 'break-word',
                                    whiteSpace: { xs: 'normal', sm: 'nowrap' },
                                    border: `1px solid ${courtColor}`
                                }}
                            >
                                {isMobile
                                    ? format(day, 'EEE d', { locale: es })
                                    : format(day, 'eeee d', { locale: es })
                                }
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hours.map((hour) => (
                        <TableRow key={hour}>
                            {week.map(day => {
                                // Determine if this day/hour combination is in the past (in Guatemala time)
                                const dayKey = day.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
                                //const cellHour = parseInt(hour.split(':')[0], 10);

                                // Determinar si una celda está en el pasado
                                // Para usuarios normales: días pasados y horas pasadas del día actual
                                // Para administradores: ninguna celda está en el pasado (pueden reservar cualquier fecha/hora)
                                const auth = useContext(AuthContext);
                                const isAdmin = auth?.user?.role === 'admin';
                                
                                // Extraer la hora de la celda actual
                                const cellHour = parseInt(hour.split(':')[0], 10);
                                const currentHour = now.getHours();
                                
                                // Si es administrador, ninguna celda está en el pasado
                                const isPast = isAdmin ? false : (dayKey < todayKey || (dayKey === todayKey && cellHour < currentHour));

                                const dayLocalStr = dayKey;

                                return (
                                    <BookingCell
                                        key={day.toString()}
                                        booking={getBookingForSlot(day, hour)}
                                        courtId={courtId}
                                        date={dayLocalStr}
                                        timeSlot={hour}
                                        onBookingUpdate={fetchBookings}
                                        isPast={isPast}
                                        courtColor={courtColor}
                                        hour={hour}
                                        day={day}
                                        courtName={court?.name || ''}
                                    />
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default BookingGrid;
