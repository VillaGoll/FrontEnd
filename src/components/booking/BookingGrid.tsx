import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Box, Button, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import BookingCell from './BookingCell';
import { useEffect, useState, useCallback } from 'react';
import bookingService from '../../services/booking.service';
import courtService from '../../services/court.service';
import type { BookingData } from '../../types/booking';
import { format, startOfWeek, addDays, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';

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
    const [loading, setLoading] = useState(false);

    const weekStartsOn = 1; // Monday
    const week = eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn }),
        end: addDays(startOfWeek(currentDate, { weekStartsOn }), 6)
    });

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
    const currentHour = now.getHours(); // Current hour in local time

    const handlePreviousWeek = () => {
        setCurrentDate(subDays(currentDate, 7));
    };

    const handleNextWeek = () => {
        setCurrentDate(addDays(currentDate, 7));
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
                const dayKey = day.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
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
        <TableContainer component={Paper}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <IconButton onClick={handlePreviousWeek}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6">
                        Semana del {format(week[0], 'd MMM', { locale: es })} al {format(week[6], 'd MMM yyyy', { locale: es })}
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
                    minWidth: 650,
                    width: '100%',
                    tableLayout: 'fixed',
                    '& th, & td': {
                        padding: isMobile ? '8px 4px' : '16px 8px',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                    }
                }} 
                aria-label="booking table"
            >
                <TableHead>
                    <TableRow>
                        <TableCell>Hora</TableCell>
                        {week.map(day => <TableCell key={day.toString()}>{format(day, 'eeee d', { locale: es })}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hours.map((hour) => (
                        <TableRow key={hour}>
                            <TableCell component="th" scope="row">
                                {hour}
                            </TableCell>
                            {week.map(day => {
                                // Determine if this day/hour combination is in the past (in Guatemala time)
                                const dayKey = day.toLocaleDateString('en-CA', { timeZone: 'America/Guatemala' });
                                const cellHour = parseInt(hour.split(':')[0], 10);
                                
                                // A slot is in the past if:
                                // 1. The day is before today, OR
                                // 2. It's today but the hour is in the past
                                const isPastDay = dayKey < todayKey; // Day is before today
                                const isPastHour = dayKey === todayKey && cellHour < currentHour; // Today but hour is in the past
                                const isPast = isPastDay || isPastHour;

                                // Ensure we send the correct local date string for saving (YYYY-MM-DD in America/Guatemala)
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