import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import statsService, { type PeriodFilter, type ClientStats } from '../services/stats.service';
import PeriodFilterComponent from '../components/stats/PeriodFilterComponent';
import ClientReports from '../components/stats/ClientReports';

const StatsPage: React.FC = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({ type: 'month' });
  const [clientStats, setClientStats] = useState<ClientStats[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (newFilter: PeriodFilter) => {
    setPeriodFilter(newFilter);
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : (
        <Box sx={{ mt: 3 }}>
          <ClientReports 
            clientStats={clientStats} 
            periodFilter={periodFilter} 
          />
        </Box>
      )}
    </Box>
  );
};

export default StatsPage;