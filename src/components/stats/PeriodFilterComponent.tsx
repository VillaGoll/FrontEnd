import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Typography, TextField } from '@mui/material';
import type { PeriodFilter } from '../../services/stats.service';

interface PeriodFilterComponentProps {
  currentFilter: PeriodFilter;
  onFilterChange: (filter: PeriodFilter) => void;
}

const PeriodFilterComponent: React.FC<PeriodFilterComponentProps> = ({ 
  currentFilter, 
  onFilterChange 
}) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'custom'>(currentFilter.startDate && currentFilter.endDate ? 'custom' : currentFilter.type);
  const [startDate, setStartDate] = useState<string>(currentFilter.startDate ? currentFilter.startDate.toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState<string>(currentFilter.endDate ? currentFilter.endDate.toISOString().split('T')[0] : '');

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: 'week' | 'month' | 'year' | 'custom' | null,
  ) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
      if (newPeriod === 'custom') {
        // No aplicar filtro hasta que el usuario seleccione fechas
        return;
      }
      onFilterChange({ type: newPeriod });
    }
  };

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const applyCustomDateRange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start <= end) {
        onFilterChange({ 
          type: 'week', 
          startDate: start, 
          endDate: end 
        });
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexWrap: 'wrap' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
        Filtrar por:
      </Typography>
      <ToggleButtonGroup
        value={period}
        exclusive
        onChange={handlePeriodChange}
        aria-label="filtro de período"
        size="small"
        color="primary"
      >
        <ToggleButton value="week" aria-label="semana">
          Semana
        </ToggleButton>
        <ToggleButton value="month" aria-label="mes">
          Mes
        </ToggleButton>
        <ToggleButton value="year" aria-label="año">
          Año
        </ToggleButton>
        <ToggleButton value="custom" aria-label="rango personalizado">
          Rango Personalizado
        </ToggleButton>
      </ToggleButtonGroup>

      {period === 'custom' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            type="date"
            label="Desde"
            value={startDate}
            onChange={handleStartDateChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            type="date"
            label="Hasta"
            value={endDate}
            onChange={handleEndDateChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <ToggleButton
            value="apply"
            selected={false}
            onClick={applyCustomDateRange}
            disabled={!startDate || !endDate}
            sx={{ height: 40 }}
          >
            Aplicar
          </ToggleButton>
        </Box>
      )}
    </Box>
  );
};

export default PeriodFilterComponent;
