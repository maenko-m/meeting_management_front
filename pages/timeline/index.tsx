import React, { useState, useEffect, useRef  } from 'react';
import { Box, Typography, Button, ThemeProvider, Tooltip, Grid, TextField, useMediaQuery } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

import theme from '../../styles/theme';
import { Event, MeetingRoom, Office } from '../../types';
import { fetchOffices } from "../../api/offices";
import { fetchMeetingRooms } from "../../api/meetingRooms";
import { fetchEvents } from "../../api/events";
import { useNotification } from '../../context/NotificationContext';

const colors = [
    'rgba(50, 193, 255, 0.7)',
    'rgba(50, 67, 255, 0.7)',
    'rgba(50, 122, 255, 0.7)',
    'rgba(42, 200, 71, 0.7)',
];

let colorsCount = 0;

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const Timeline = () => {
    const isLaptop = useMediaQuery("(max-width:1440px)");
    const isTablet2 = useMediaQuery("(max-width:810px)");
    const isMobile = useMediaQuery("(max-width:600px)");

    const hourStep = isLaptop ? 2 : 1;
    const hourWidth = 120;
    const columnsCount = 24 / hourStep;
    const columnWidthPercent = 100 / columnsCount;
    const hours = Array.from({ length: Math.ceil(17 / hourStep) }, (_, i) => `${String(i * hourStep + 6).padStart(2, '0')}:00`);
     
    const [rooms, setRooms] = useState<MeetingRoom[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
    const [events, setEvents] = useState<Event[]>([]);

    const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [openPicker, setOpenPicker] = useState(false);

    const [officesLoading, setOfficesLoading] = useState(true);
    const [officesError, setOfficesError] = useState<string | null>(null);
    const [dataLoading, setDataLoading] = useState(false); 
    const [dataError, setDataError] = useState<string | null>(null);

    const { showNotification } = useNotification()

    const changeDate = (days: number) => {
        setCurrentDate(prev => prev.add(days, 'day'));
    };

    useEffect(() => {
        const loadOffices = async () => {
          try {
            setOfficesLoading(true);
            setOfficesError(null);
            const officesData = await fetchOffices(); 
            setOffices(officesData);
            if (officesData.length > 0) {
                const storedId = localStorage.getItem('default_office_id');
                if (storedId) {
                    setSelectedOfficeId(Number(storedId)); 
                }
                else {
                    setSelectedOfficeId(officesData[0].id); 
                }
            }
          } catch (err) {
            showNotification(
                "Не удалось загрузить офисы",
                'error'
            );
            setOfficesError("Не удалось загрузить офисы");
          } finally {
            setOfficesLoading(false);
          }
        };
        loadOffices();
    }, []);

    useEffect(() => {
        const loadData = async () => {
          if (!selectedOfficeId) return;
    
          try {
            setDataLoading(true);
            setDataError(null);
    
            const roomsData = await fetchMeetingRooms({ officeId: selectedOfficeId });
            setRooms(roomsData.data);
    
            const formattedDate = currentDate.toISOString().split("T")[0];
            const eventsData = await fetchEvents({
              officeId: selectedOfficeId,
              date: formattedDate,
            });
            setEvents(eventsData);
          } catch (err) {
            showNotification(
                "Не удалось загрузить комнаты или мероприятия",
                'error'
            );
            setDataError("Не удалось загрузить комнаты или мероприятия");
          } finally {
            setDataLoading(false);
          }
        };
        loadData();
    }, [selectedOfficeId, currentDate]);

    const handleOfficeChange = (officeId: number) => {
        setSelectedOfficeId(officeId);
    };

    return (
        <ThemeProvider theme={theme}>
            <div>
                {/* Заголовок */}
                <Box sx={{ position: "sticky", top: 0, zIndex: 10 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "1em", alignItems: isMobile ? "flex-end" : "start", flexDirection: isMobile ? "column" : "row", gap: 1}}>
                        <Typography variant='h5' sx={{ padding: "12px 0" }} >Таймлайн</Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {officesLoading ? (
                                <Typography>Загрузка офисов...</Typography>
                            ) : officesError ? (
                                <Typography color="error">{officesError}</Typography>
                            ) : (
                                offices.map((office) => (
                                <Button
                                    key={office.id}
                                    variant={office.id === selectedOfficeId ? "contained" : "outlined"}
                                    color={office.id === selectedOfficeId ? "primary" : "secondary"}
                                    onClick={() => handleOfficeChange(office.id)}
                                >
                                    {office.name}
                                </Button>
                                ))
                            )}
                        </Box>
                    </Box>

                    {/* Переключатель даты */}
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                        <Box sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: '1em',
                            border: '1px solid #A3A3A3',
                            boxSizing: 'border-box',
                        }}>
                            <Button color='secondary' onClick={() => changeDate(-1)}><ChevronLeft /></Button>
                            <DatePicker
                            value={currentDate}
                            onChange={(newValue) => {
                                if (newValue) setCurrentDate(newValue);
                            }}
                            slots={{ textField: TextField }}
                            slotProps={{
                                textField: {
                                  inputRef,
                                  variant: "outlined", 
                                  sx: {
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                    },
                                    "& .MuiInputBase-input": {
                                        textAlign: "center", // Центровка текста
                                    },
                                  }
                                }
                            }}
                            />
                            <Button color='secondary' onClick={() => changeDate(1)}><ChevronRight /></Button>
                        </Box>
                    </LocalizationProvider>
                </Box>

                {/* Таймлайн */}
                    <Box sx={{ overflowX: isTablet2 ? "auto" : "hidden",  width: '100%' }}>
                        <Box sx={{ width: isTablet2 ? `${hours.length * hourWidth + 200}px` : '100%' }}>
                            <Grid container spacing={0} sx={{ display: "flex", alignItems: "center", background: "#E3E3E3", width: '100%', height: 40, marginBottom: "0.5em" }}>
                                <Grid item xs={1.5}></Grid>
                                {hours.map(hour => (
                                <Grid item xs key={hour}>
                                    <Typography color= "#858585" >{hour}</Typography>
                                </Grid>
                                ))}
                            </Grid>
                            {dataLoading ? (
                                    <Typography>Загрузка данных...</Typography>
                                ) : dataError ? (
                                    <Typography color="error">{dataError}</Typography>
                                ) : (
                                    rooms.map((room, index) => (
                                <Grid container spacing={0} key={index} alignItems="center" sx={{ width: '100%', '&:nth-of-type(even)': { backgroundColor: '#F4F4F4'}, borderBottom: '1px solid #CCCCCC' }}>
                                    <Grid item xs={1.5}>
                                        <Typography fontSize="15px" padding="0 10px">{room.name}</Typography>
                                    </Grid>
                                    {hours.map(hour => (
                                    <Grid item xs key={hour} sx={{ display: "grid", alignItems: "center", borderLeft: '1px solid #CCCCCC', height: 50, position: 'relative' }}>
                                        {events.filter((event, index) => event.meetingRoomId === room.id).map((event, i) => {
                                            const colorIndex = index % colors.length;
                                            const eventStart = timeToMinutes(event.timeStart);
                                            const eventEnd = timeToMinutes(event.timeEnd);
                                            const currentHour = timeToMinutes(hour);
                                            const nextHour = currentHour + 60 * hourStep;

                                            if (eventEnd <= currentHour || eventStart >= nextHour) return null;

                                            const startOffset = Math.max(0, eventStart - currentHour) / (60 * hourStep) * 100;
                                            const endOffset = Math.min(60 * hourStep, eventEnd - currentHour) / (60 * hourStep) * 100;

                                            return (
                                                <Tooltip key={i} title={`${event.timeStart} - ${event.timeEnd} ${event.name}`} arrow enterTouchDelay={0} leaveTouchDelay={3000} >
                                                    <Box
                                                    key={i}
                                                    sx={{
                                                    position: 'absolute',
                                                    top: `5`,
                                                    left: `${startOffset}%`,
                                                    width: `${endOffset - startOffset}%`,
                                                    height: '50%',
                                                    backgroundColor: colors[colorIndex],
                                                    transition: 'height 0.3s ease-in-out',
                                                    }}/>
                                                </Tooltip>
                                            );
                                        })}
                                    </Grid>
                                    ))}
                                </Grid>
                            )))}
                        </Box>
                    </Box>
            </div>
        </ThemeProvider>
    );
};
  
export default Timeline;  