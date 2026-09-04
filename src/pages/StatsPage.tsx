import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Tabs, Tab } from '@mui/material';
import statsService, { type PeriodFilter, type ClientStats } from '../services/stats.service';
import PeriodFilterComponent from '../components/stats/PeriodFilterComponent';
import ClientReports from '../components/stats/ClientReports';
import NoShowReports from '../components/stats/NoShowReports';

const StatsPage: React.FC = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({ type: 'month' });
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reportTab, setReportTab] = useState<number>(0);

  const handleFilterChange = (newFilter: PeriodFilter) => {
    setPeriodFilter(newFilter);
  };

  const handleReportTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setReportTab(newValue);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await statsService.getClientStats(periodFilter);
      setClientStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Error al cargar las estadísticas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [periodFilter]);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Estadísticas
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <PeriodFilterComponent 
          currentFilter={periodFilter} 
          onFilterChange={handleFilterChange} 
        />
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={reportTab}
          onChange={handleReportTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Reportes de Clientes" />
          <Tab label="Clientes que No Llegaron" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Box sx={{ mt: 3 }}>
          {reportTab === 0 && (
            <ClientReports 
              clientStats={clientStats} 
              periodFilter={periodFilter} 
            />
          )}
          {reportTab === 1 && (
            <NoShowReports 
              periodFilter={periodFilter} 
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default StatsPage;
