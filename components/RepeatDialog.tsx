import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface RepeatSettings {
  repeatType: 'day' | 'week' | 'month' | 'year';
  frequency: number;
  endDate: string; // "YYYY-MM-DD"
}

interface RepeatDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: RepeatSettings) => void;
  initialSettings: RepeatSettings | null; 
}

const RepeatDialog: React.FC<RepeatDialogProps> = ({
  open,
  onClose,
  onSave,
  initialSettings,
}) => {
  const [repeatType, setRepeatType] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [frequency, setFrequency] = useState<number>(1);
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const repeatTypeTranslations: Record<string, string> = {
    day: 'день',
    week: 'неделю',
    month: 'месяц',
    year: 'год',
  };

  useEffect(() => {
    if (initialSettings) {
      setRepeatType(initialSettings.repeatType);
      setFrequency(initialSettings.frequency);
      setEndDate(dayjs(initialSettings.endDate));
    } else if (open) {
      const defaultSettings: RepeatSettings = {
        repeatType: 'day',
        frequency: 1,
        endDate: dayjs().format('YYYY-MM-DD'),
      };
      setRepeatType(defaultSettings.repeatType);
      setFrequency(defaultSettings.frequency);
      setEndDate(dayjs(defaultSettings.endDate));
      onSave(defaultSettings); 
    }
  }, [initialSettings, open, onSave]);

  const handleRepeatTypeChange = (event: SelectChangeEvent) => {
    const newType = event.target.value as 'day' | 'week' | 'month' | 'year';
    setRepeatType(newType);
    if (endDate) {
      onSave({ repeatType: newType, frequency, endDate: endDate.format('YYYY-MM-DD') });
    }
  };

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setFrequency(value);
      if (endDate) {
        onSave({ repeatType, frequency: value, endDate: endDate.format('YYYY-MM-DD') });
      }
    }
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    setEndDate(newValue);
    if (newValue) {
      onSave({ repeatType, frequency, endDate: newValue.format('YYYY-MM-DD') });
    }
  };

  const currentSettings: RepeatSettings | null = endDate
    ? {
        repeatType,
        frequency,
        endDate: endDate.format('YYYY-MM-DD'),
      }
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Настройка повтора</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Тип повтора</InputLabel>
          <Select
            value={repeatType}
            onChange={handleRepeatTypeChange}
            label="Тип повтора"
          >
            <MenuItem value="day">День</MenuItem>
            <MenuItem value="week">Неделя</MenuItem>
            <MenuItem value="month">Месяц</MenuItem>
            <MenuItem value="year">Год</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Частота повтора"
          type="number"
          value={frequency}
          onChange={handleFrequencyChange}
          fullWidth
          sx={{ mt: 2, mb: 2 }}
          inputProps={{ min: 1 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
          <DatePicker
            label="Дата окончания"
            value={endDate}
            minDate={dayjs()}
            sx={{ mt: 2 }}
            onChange={handleEndDateChange}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                variant: 'outlined',
                fullWidth: true,
                InputLabelProps: { shrink: true }, 
                sx: {
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '0px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderRadius: '0px',
                  },
                },
              },
            }}
            />
          </LocalizationProvider>
          {currentSettings && (
          <Typography sx={{ mt: 2 }}>
            {`Повтор: каждый(ую) ${currentSettings.frequency} ${repeatTypeTranslations[currentSettings.repeatType]}, до ${currentSettings.endDate}`}
          </Typography>
          )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepeatDialog;