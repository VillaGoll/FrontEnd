import React, { useState } from 'react';
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
  Tabs,
  Tab,
  CircularProgress
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
import type { ClientStats, PeriodFilter } from '../../services/stats.service';
import statsService from '../../services/stats.service';

interface ClientReportsProps {
  clientStats: ClientStats[];
  periodFilter: PeriodFilter;
}

const ClientReports: React.FC<ClientReportsProps> = ({ clientStats, periodFilter }) => {
  const [reportType, setReportType] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeReportType = (_event: React.SyntheticEvent, newValue: number) => {
    setReportType(newValue);
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      const blob = await statsService.exportClientsToExcel(periodFilter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_clientes_${periodFilter.type}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para gráficos
  const topBookingsData = [...clientStats]
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 10)
    .map(client => ({
      name: client.name,
      reservas: client.bookingsCount
    }));

  const topAttendanceData = [...clientStats]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 10)
    .map(client => ({
      name: client.name,
      asistencia: Math.round(client.attendanceRate * 100)
    }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Reportes de Clientes</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<FileDownloadIcon />}
          onClick={exportToExcel}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Exportar a Excel'}
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={reportType}
          onChange={handleChangeReportType}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Top Clientes por Reservas" />
          <Tab label="Top Clientes por Asistencia" />
          <Tab label="Todos los Clientes" />
        </Tabs>
      </Paper>

      {reportType === 0 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Top 10 Clientes con Más Reservas
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topBookingsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reservas" name="Cantidad de Reservas" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell align="right">Cantidad de Reservas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...clientStats]
                  .sort((a, b) => b.bookingsCount - a.bookingsCount)
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <TableRow key={client._id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell align="right">{client.bookingsCount}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={clientStats.length}
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
        </Box>
      )}

      {reportType === 1 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Top 10 Clientes con Mayor Asistencia
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topAttendanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis unit="%" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Tasa de Asistencia']} />
                  <Legend />
                  <Bar dataKey="asistencia" name="Tasa de Asistencia (%)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell align="right">Reservas</TableCell>
                  <TableCell align="right">Asistencias</TableCell>
                  <TableCell align="right">Tasa de Asistencia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...clientStats]
                  .sort((a, b) => b.attendanceRate - a.attendanceRate)
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <TableRow key={client._id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell align="right">{client.bookingsCount}</TableCell>
                      <TableCell align="right">{client.attendanceCount}</TableCell>
                      <TableCell align="right">{`${(client.attendanceRate * 100).toFixed(1)}%`}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={clientStats.length}
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
        </Box>
      )}

      {reportType === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell align="right">Reservas</TableCell>
                <TableCell align="right">Asistencias</TableCell>
                <TableCell align="right">Tasa de Asistencia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientStats
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell align="right">{client.bookingsCount}</TableCell>
                    <TableCell align="right">{client.attendanceCount}</TableCell>
                    <TableCell align="right">{`${(client.attendanceRate * 100).toFixed(1)}%`}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={clientStats.length}
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
      )}
    </Box>
  );
};

export default ClientReports;