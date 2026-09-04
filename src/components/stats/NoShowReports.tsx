import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  CircularProgress,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type { NoShowClient, PeriodFilter } from '../../services/stats.service';
import statsService from '../../services/stats.service';
import courtService from '../../services/court.service';

interface NoShowReportsProps {
  periodFilter: PeriodFilter;
}

interface Court {
  _id: string;
  name: string;
  color: string;
}

const NoShowReports: React.FC<NoShowReportsProps> = ({ periodFilter }) => {
  const [noShowStats, setNoShowStats] = useState<NoShowClient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await courtService.getAllCourts();
        setCourts(response.data);
      } catch {
        // Silently fail if courts can't be loaded
      }
    };
    fetchCourts();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await statsService.getNoShowStats(periodFilter, selectedCourt || undefined);
      setNoShowStats(data);
    } catch (err) {
      console.error('Error fetching no-show stats:', err);
      setError('Error al cargar las estadísticas de inasistencias. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [periodFilter, selectedCourt]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExpandRow = (clientId: string) => {
    setExpandedRow(expandedRow === clientId ? null : clientId);
  };

  const handleCourtChange = (event: SelectChangeEvent) => {
    setSelectedCourt(event.target.value);
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const blob = await statsService.exportNoShowsToExcel(periodFilter, selectedCourt || undefined);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_inasistencias_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  // Preparar datos para gráficos
  const topNoShowData = [...noShowStats]
    .slice(0, 10)
    .map(client => ({
      name: client.name,
      inasistencias: client.noShowCount
    }));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6">Reporte de Clientes que No Llegaron</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
          onClick={exportToExcel}
          disabled={exporting || loading}
        >
          {exporting ? 'Exportando...' : 'Exportar a Excel'}
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Filtrar por cancha:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Todas las canchas</InputLabel>
            <Select
              value={selectedCourt}
              label="Todas las canchas"
              onChange={handleCourtChange}
            >
              <MenuItem value="">
                <em>Todas las canchas</em>
              </MenuItem>
              {courts.map((court) => (
                <MenuItem key={court._id} value={court._id}>
                  {court.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : noShowStats.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No hay inasistencias registradas para el período seleccionado.</Typography>
        </Box>
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Top 10 Clientes con Más Inasistencias
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topNoShowData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="inasistencias" name="No Llegó" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Cliente</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell align="right">Total Reservas</TableCell>
                  <TableCell align="right">No Llegó</TableCell>
                  <TableCell align="right">Tasa Inasistencia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {noShowStats
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <React.Fragment key={client._id}>
                      <TableRow 
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleExpandRow(client._id)}
                      >
                        <TableCell>
                          <IconButton size="small">
                            {expandedRow === client._id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell align="right">{client.totalBookings}</TableCell>
                        <TableCell align="right" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                          {client.noShowCount}
                        </TableCell>
                        <TableCell align="right">{`${(client.noShowRate * 100).toFixed(1)}%`}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={expandedRow === client._id} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                                Detalle de No Llegó
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Hora</TableCell>
                                    <TableCell>Cancha</TableCell>
                                    <TableCell align="right">Anticipo</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {client.noShowDetails.map((detail, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{formatDate(detail.date)}</TableCell>
                                      <TableCell>{detail.timeSlot}</TableCell>
                                      <TableCell>{detail.courtName}</TableCell>
                                      <TableCell align="right">{`Q ${detail.deposit.toFixed(2)}`}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={noShowStats.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              SelectProps={{
                MenuProps: {
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left"
                  },
                  transformOrigin: {
                    vertical: "bottom",
                    horizontal: "left"
                  },
                }
              }}
            />
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default NoShowReports;
