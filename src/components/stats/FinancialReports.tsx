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
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import type { FinancialStats, PeriodFilter } from '../../services/stats.service';
import statsService from '../../services/stats.service';

interface FinancialReportsProps {
  financialStats: FinancialStats | null;
  periodFilter: PeriodFilter;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const FinancialReports: React.FC<FinancialReportsProps> = ({ financialStats, periodFilter }) => {
  const [reportType, setReportType] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChangeReportType = (_event: React.SyntheticEvent, newValue: number) => {
    setReportType(newValue);
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      const blob = await statsService.exportFinancialToExcel(periodFilter);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_financiero_${periodFilter.type}.xlsx`;
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

  if (!financialStats) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No hay datos financieros disponibles para el período seleccionado.</Typography>
      </Box>
    );
  }

  // Formatear datos para gráficos
  const incomeByPeriodData = financialStats.byPeriod.map(item => ({
    fecha: item.date,
    ingresos: item.income
  }));

  const incomeByCourtData = financialStats.byCourt.map(item => ({
    name: item.courtName,
    value: item.income
  }));

  const incomeByScheduleData = financialStats.bySchedule.map(item => ({
    hora: `${item.hour}:00`,
    ingresos: item.income
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Reportes Financieros</Typography>
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Ingresos Totales: {formatCurrency(financialStats.totalIncome)}
        </Typography>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={reportType}
          onChange={handleChangeReportType}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Ingresos por Período" />
          <Tab label="Ingresos por Cancha" />
          <Tab label="Ingresos por Horario" />
        </Tabs>
      </Paper>

      {reportType === 0 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ingresos por Período
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={incomeByPeriodData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Ingresos']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ingresos" 
                    name="Ingresos" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Ingresos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financialStats.byPeriod.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell align="right">{formatCurrency(item.income)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {reportType === 1 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ingresos por Cancha
            </Typography>
            <Box sx={{ height: 400, display: 'flex' }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByCourtData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  >
                    {incomeByCourtData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Ingresos']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="50%" height="100%">
                <BarChart
                  data={incomeByCourtData}
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
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Ingresos']} />
                  <Legend />
                  <Bar dataKey="value" name="Ingresos" fill="#8884d8">
                    {incomeByCourtData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cancha</TableCell>
                  <TableCell align="right">Ingresos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financialStats.byCourt.map((item) => (
                  <TableRow key={item.courtId}>
                    <TableCell>{item.courtName}</TableCell>
                    <TableCell align="right">{formatCurrency(item.income)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {reportType === 2 && (
        <Box>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ingresos por Horario
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeByScheduleData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Ingresos']} />
                  <Legend />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hora</TableCell>
                  <TableCell align="right">Ingresos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financialStats.bySchedule.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{`${item.hour}:00`}</TableCell>
                    <TableCell align="right">{formatCurrency(item.income)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default FinancialReports;