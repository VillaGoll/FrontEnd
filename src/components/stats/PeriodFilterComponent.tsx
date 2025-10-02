import React, { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import type { PeriodFilter } from '../../services/stats.service';

interface PeriodFilterComponentProps {
  currentFilter: PeriodFilter;
  onFilterChange: (filter: PeriodFilter) => void;
}

const PeriodFilterComponent: React.FC<PeriodFilterComponentProps> = ({ 
  currentFilter, 
  onFilterChange 
}) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>(currentFilter.type);

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: 'week' | 'month' | 'year' | null,
  ) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
      onFilterChange({ type: newPeriod });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', minWidth: '120px' }}>
        Filtrar por período:
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
      </ToggleButtonGroup>
    </Box>
  );
};

export default PeriodFilterComponent;