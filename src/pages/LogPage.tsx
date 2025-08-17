import { useEffect, useState } from 'react';
import { getLogs } from '../services/logService';
import type { Log } from '../types/index';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Grid, Typography } from '@mui/material';

const LogPage = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    const [filters, setFilters] = useState({ date: '', user: '', time: '' });

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await getLogs();
                setLogs(response.data);
                setFilteredLogs(response.data);
            } catch (error) {
                console.error('Error fetching logs:', error);
            }
        };
        fetchLogs();
    }, []);

    useEffect(() => {
        let filtered = logs;
        if (filters.date) {
            const localDate = new Date(filters.date + 'T00:00:00');
            const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), 23, 59, 59, 999);

            filtered = filtered.filter(log => {
                const logDate = new Date(log.createdAt);
                return logDate >= startOfDay && logDate <= endOfDay;
            });
        }
        if (filters.user) {
            filtered = filtered.filter(log => log.user.toLowerCase().includes(filters.user.toLowerCase()));
        }
        if (filters.time) {
            filtered = filtered.filter(log => new Date(log.createdAt).toTimeString().startsWith(filters.time));
        }
        setFilteredLogs(filtered);
    }, [filters, logs]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <Paper sx={{ p: 2, margin: 'auto', maxWidth: 1200, flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>System Logs</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid>
                    <TextField
                        type="date"
                        name="date"
                        value={filters.date}
                        onChange={handleFilterChange}
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid>
                    <TextField
                        type="text"
                        name="user"
                        placeholder="Filter by user"
                        value={filters.user}
                        onChange={handleFilterChange}
                        fullWidth
                    />
                </Grid>
                <Grid>
                    <TextField
                        type="time"
                        name="time"
                        value={filters.time}
                        onChange={handleFilterChange}
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
            </Grid>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredLogs.map(log => (
                            <TableRow key={log._id}>
                                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                                <TableCell>{log.user}</TableCell>
                                <TableCell>{log.action}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default LogPage;