import { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Dialog, 
  OutlinedInput,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip, 
  Checkbox,
  Autocomplete,
  IconButton,
  Popper,
  ToggleButtonGroup,
  ToggleButton, 
  useMediaQuery
} from '@mui/material';
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru"; 
import { Box, ThemeProvider } from '@mui/system';
import theme from '../styles/theme';
import MeetingRoomTimeline from './MeetingRoomTimeLine';
import { Employee, MeetingRoom, Office, Event, EventCreate } from '../types';
import { fetchOffices } from "../api/offices";
import { fetchMeetingRooms } from "../api/meetingRooms";
import { fetchEmployees } from "../api/employees";
import { createEvent, updateEvent } from "../api/events";
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import RepeatDialog from './RepeatDialog';


const events = [
  { id: 1, name: 'Совещание', date: '2023-10-10', timeStart: '08:00', timeEnd: '10:00', idRoom: 1 },
  { id: 2, name: 'Презентация', date: '2023-10-10', timeStart: '14:00', timeEnd: '16:00', idRoom: 1 },
];

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  event?: EventCreate | null;
  idEvent?: number | null;
}

interface RepeatSettings {
  repeatType: 'day' | 'week' | 'month' | 'year';
  frequency: number;
  endDate: string; 
}

const EventForm: React.FC<EventFormProps> = ({ open, onClose, mode, event, idEvent }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [eventId, seteventId] = useState<number | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventOfficeId, setEventOfficeId] = useState<number | null>();
  const [eventRoomId, setEventRoomId] = useState<number | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [timeLineDate, setTimeLineDate]  = useState<Dayjs | null>(selectedDate);
  const [selectedTimeStart, setSelectedTimeStart] = useState<Dayjs | null>(dayjs().set('hour', 6).set('minute', 0).set('second', 0));
  const [selectedTimeEnd, setSelectedTimeEnd] = useState<Dayjs | null>(dayjs().set('hour', 6).set('minute', 30).set('second', 0));
  const [selectedTimeZone, setSelectedTimeZone] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<number>(0);
  const [openRoomCalendar, setOpenRoomCalendar] = useState(false);
  const [autocompleteDisabled, setAutocompleteDisabled] = useState(false);
  const [access, setAccess] = useState<"public" | "private">("public");

  const [timeError, setTimeError] = useState<boolean>(false);

  const [offices, setOffices] = useState<Office[]>([]);
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState<boolean>(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { showNotification } = useNotification()

  const [isOverlapping, setIsOverlapping] = useState(false);
  
  const handleOverlapCheck = (overlap: boolean) => {
    setIsOverlapping(overlap);
  };

  const { user } = useAuth();

  const isOverSize = selectedUsers.length > selectedSize;

  const currentEvent = { id: eventId!, date: selectedDate!, timeStart: selectedTimeStart!, timeEnd: selectedTimeEnd!, idRoom: eventRoomId!};

  const [isRepeatChecked, setIsRepeatChecked] = useState(false);
  const [repeatSettings, setRepeatSettings] = useState<RepeatSettings | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCheckboxClick = () => {
    if (isRepeatChecked) {
      setIsRepeatChecked(false);
      return;
    }
    setIsRepeatChecked(true);
    setDialogOpen(true);
  };

  const handleSaveRepeat = (settings: RepeatSettings) => {
    setRepeatSettings(settings);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };


  useEffect(() => {
    const loadData = async () => {
      try {
        setRoomsLoading(true);
        const [officesData, employeesData] = await Promise.all([
          fetchOffices(),
          fetchEmployees(),
        ]);
        setOffices(officesData);
        setEmployees(employeesData);

        const defaultOfficeId = () => {
          const storedId = localStorage.getItem('default_office_id');
          return storedId ? Number(storedId) : officesData[0].id;
        };

        if (officesData.length > 0) {
          setEventOfficeId(defaultOfficeId());
          setSelectedTimeZone(officesData.find(f => f.id == defaultOfficeId())!.timeZone);
        }

        const roomsData = await fetchMeetingRooms({ officeId: defaultOfficeId() });
        setRooms(roomsData.data);
        

        if (roomsData.data.length > 0) {
          setEventRoomId(roomsData.data[0].id);
          setSelectedSize(roomsData.data[0].size);
        }
      } catch (err) {
        showNotification(
          "Ошибка загрузки данных",
          'error'
        );
      }
      finally {
        setRoomsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (mode === "edit" && event) {
      setEventName(event.name);
      setEventDesc(event.description);
      setEventRoomId(event.meetingRoomId);
      setSelectedDate(dayjs(event.date));
      setSelectedTimeStart(dayjs(`${event.date} ${event.timeStart}`));
      setSelectedTimeEnd(dayjs(`${event.date} ${event.timeEnd}`));
      if (event.recurrenceType) {
        setIsRepeatChecked(true);
        setRepeatSettings({
          repeatType: event.recurrenceType as ('day' | 'week' | 'month' | 'year'),
          frequency: event.recurrenceInterval!,
          endDate: event.recurrenceEnd!
        })
      }
      setSelectedUsers(
        employees.filter((emp) => event.employeeIds.includes(emp.id))
      );
      const room = rooms.find((r) => r.id === event.meetingRoomId);
      if (room) {
        setSelectedSize(room.size);
        setAccess(room.isPublic ? "public" : "private");
        setEventOfficeId(room.office.id);
        setSelectedTimeZone(room.office.timeZone);
      }
    }
  }, [mode, event, employees, rooms]);

  useEffect(() => {
    if (selectedTimeStart && selectedTimeEnd) {
      setTimeError(selectedTimeStart.isAfter(selectedTimeEnd));
    } else {
      setTimeError(false);
    }

    const isOutOfBounds = (time: Dayjs | null): boolean => time ? time.hour() < 6 || time.hour() >= 22 : false;
    
    if (selectedTimeStart && selectedTimeEnd) {
      const hasError = selectedTimeStart.isAfter(selectedTimeEnd) || isOutOfBounds(selectedTimeStart) || isOutOfBounds(selectedTimeEnd);
      setTimeError(hasError);
    } else {
      setTimeError(false);
    }
  }, [selectedTimeStart, selectedTimeEnd]);

  const handleChangeOffice = async (event: SelectChangeEvent<number>) => {
    const selectedId = Number(event.target.value);
    setEventOfficeId(selectedId);
  
    const selectedOffice = offices.find((office) => office.id === selectedId);
    if (selectedOffice) {
      setSelectedTimeZone(selectedOffice.timeZone);
    }
  
    try {
      setRoomsLoading(true);
      const roomsData = await fetchMeetingRooms({ officeId: selectedId });
      setRooms(roomsData.data);
      
      if (roomsData.data.length > 0) {
        setEventRoomId(roomsData.data[0].id);
        setSelectedSize(roomsData.data[0].size);
      } else {
        setEventRoomId(null);
        setSelectedSize(0);
      }
    } catch (err) {
      showNotification("Ошибка загрузки комнат", 'error');
    }
    finally {
      setRoomsLoading(false);
    }
  };

  const handleChangeRoom = (event: SelectChangeEvent<number>) => {
    const selectedId = Number(event.target.value);
    setEventRoomId(selectedId);
    const selectedRoom = rooms.find((room) => room.id === selectedId);
    if (selectedRoom) {
      setSelectedSize(selectedRoom.size);
      setSelectedUsers(selectedRoom.employees);
      setAutocompleteDisabled(selectedRoom.employees.length > 0);
    }
  };

  const handleChangeTimeLineDate = (value: dayjs.Dayjs | null) => {
    if (value) {
      setTimeLineDate(value);
    }
  };

  const handleChangeEmployees = (event: React.SyntheticEvent, value: Employee[]) => {
    setSelectedUsers(value);
  };

  const handleDeleteEmployee = (userToDelete: Employee) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
  };

  

  const resetForm = () => {
    seteventId(null);
    setEventName("");
    setEventDesc("");
    setSelectedUsers([]);
    setSelectedDate(dayjs());
    setTimeLineDate(dayjs()); 
    setSelectedTimeStart(dayjs().set('hour', 6).set('minute', 0).set('second', 0));
    setSelectedTimeEnd(dayjs().set('hour', 6).set('minute', 30).set('second', 0));
    setSelectedTimeZone(0);
    setSelectedSize(0);
    setOpenRoomCalendar(false);
    setAutocompleteDisabled(false);
    setRepeatSettings(null);
    setIsRepeatChecked(false);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!eventName || !eventRoomId || !selectedDate || !selectedTimeStart || !selectedTimeEnd) {
      showNotification(
        "Заполните все поля",
        'error'
      );
      return;
    }
    if (selectedDate && selectedDate.isBefore(dayjs(), 'day')) {
      showNotification(
        "Дата не может быть раньше сегодняшнего дня",
        'error'
      );
      return;
    }
    if (isOverSize) {
      showNotification(
        "Комната переполнена",
        'error'
      );
      return;
    }
    if (timeError) {
      showNotification(
        "Время начала не может быть позже времени окончания",
        'error'
      );
      return;
    }

    const newEvent: EventCreate = {
      name: eventName,
      description: eventDesc,
      date: selectedDate.format("YYYY-MM-DD"),
      timeStart: selectedTimeStart.format("HH:mm:ss"),
      timeEnd: selectedTimeEnd.format("HH:mm:ss"),
      authorId: user!.id, 
      meetingRoomId: eventRoomId,
      employeeIds: selectedUsers.map((user) => user.id),
      recurrenceType: repeatSettings?.repeatType,
      recurrenceInterval: repeatSettings?.frequency,
      recurrenceEnd: repeatSettings?.endDate,
    };

    try {
      if (mode === "create") {
        await createEvent(newEvent);
        showNotification(
          "Мероприятие успешно создано",
          'success'
        );
      } else if (mode === "edit" && idEvent) {
        await updateEvent(idEvent!, newEvent);
        showNotification(
          "Мероприятие успешно обновлено",
          'success'
        );
      }
      resetForm(); 
      onClose();
    } catch (err) {
      showNotification(
        "Произошла ошибка при сохранении мероприятия",
        'error'
      );
    }finally {
      resetForm();
      onClose();
    }
  };

  return (
    <ThemeProvider theme={theme}>
        <Dialog open={open} scroll="paper" slotProps={{ paper: { className: "dialog-container", sx: { margin: isMobile ? "0" : "32px", height: isMobile ? "100%" : "calc(100% - 60px * 2)" } } }}>
            <div className='event-form-content'>
              <div className="event-form-title-container">
                <div className='event-form-title-container-main'>
                  <div className='event-form-title' style={{ display: mode === "create" ? "flex" : "none" }} >
                    <img src='/images/add-event.svg' alt=''/>
                    <Typography variant='h5'>Новое мероприятие</Typography>
                  </div>
                  <div className='event-form-title' style={{ display: mode === "edit" ? "flex" : "none" }}>
                    <img src='/images/edit-event.svg' alt=''/>
                    <Typography variant='h5'>Редактировать мероприятие</Typography>
                  </div>
                  <img src='/images/cross.svg' alt='' style={{cursor: 'pointer'}} onClick={handleClose}/>
                </div>
                <div className='event-form-info'>
                  <div className='event-form-info-item'>
                    <img src='/images/time.svg' alt=''/>
                    <Typography>UTC {selectedTimeZone >= 0 ? '+'+selectedTimeZone : selectedTimeZone}:00</Typography>
                  </div>
                  <div className='event-form-info-item'>
                    <img src='/images/people.svg' alt=''/>
                    <Typography>{selectedSize} человек</Typography>
                  </div>
                </div>
              </div>
              <div className='event-form-scroll-box'>
                <div className='event-form-fields'>
                  <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Название
                    </Typography>
                    <OutlinedInput
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      fullWidth
                      placeholder="Название мероприятия"
                      sx={{borderRadius: '0px', height: '50px'}}
                    />
                  </Box>
                  <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Описание
                    </Typography>
                    <OutlinedInput
                      multiline
                      rows={3.5}
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      fullWidth
                      placeholder="Описание мероприятия"
                      sx={{borderRadius: '0px', height: '100px'}}
                    />
                  </Box>
                  <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Офис
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={eventOfficeId}
                        onChange={handleChangeOffice}
                        displayEmpty
                        variant="outlined"
                        sx={{borderRadius: '0px', height: '50px'}}
                      >
                        {offices.map((office) => {
                          return <MenuItem key={office.id} value={office.id}>{office.name}</MenuItem>
                        })}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{display: "flex", gap: 3,}}>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5, flex: 6}}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Комната
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={roomsLoading ? 0 : eventRoomId}
                          onChange={handleChangeRoom}
                          displayEmpty
                          variant="outlined"
                          sx={{borderRadius: '0px', height: '50px'}}
                        >
                          {roomsLoading ? (
                            <MenuItem value={0}>Загрузка...</MenuItem>
                          ) : (
                            rooms.map((room) => (
                              <MenuItem key={room.id} value={room.id}>
                                {room.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                  <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                    <Box sx={{display: "flex", justifyContent: 'space-between'}}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Участники
                      </Typography>
                      {isOverSize && (<Typography color="error">Комната переполнена</Typography>)}
                    </Box>
                    <FormControl fullWidth>
                      <Autocomplete
                        multiple
                        options={employees}
                        getOptionLabel={(option) => option.fullName}
                        value={selectedUsers}
                        disabled={autocompleteDisabled}
                        onChange={handleChangeEmployees}
                        noOptionsText="Не найдено"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Фио сотрудника"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0px",
                                minHeight: "50px", 
                                padding: "4px 8px", 
                                ...(isOverSize && {
                                  borderColor: "error.main", 
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "error.main",
                                  },
                                }),
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderRadius: "0px",
                              },
                            }}
                          />
                        )}
                        renderTags={(value: Employee[]) =>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                            {value.map((user) => (
                              <Chip
                                key={user.id}
                                label={user.fullName}
                                disabled={autocompleteDisabled}
                                onDelete={() => handleDeleteEmployee(user)}
                                onMouseDown={(e) => e.stopPropagation()}
                                sx={{ borderRadius: "0px", height: "30px" }} 
                              />
                            ))}
                          </Box>
                        }
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        PopperComponent={(props) => (
                          <Popper {...props} sx={{ maxHeight: "200px", overflowY: "auto" }} />
                        )}
                      />
                    </FormControl>
                  </Box>
                  <Box sx={{display: "flex", gap: 3, justifyContent: 'space-between', alignItems: 'end'}}>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Дата начала
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                        <DatePicker
                          value={selectedDate}
                          onChange={(newValue) => setSelectedDate(newValue)}
                          minDate={dayjs()}
                          slots={{ textField: TextField }}
                          slotProps={{
                            textField: {
                              variant: "outlined",
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "0px",
                                  height: '50px'
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderRadius: "0px",
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Время начала
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                        <TimePicker
                          value={selectedTimeStart}
                          onChange={(newValue) => setSelectedTimeStart(newValue)}
                          minTime={dayjs().set('hour', 6).set('minute', 0)} 
                          maxTime={dayjs().set('hour', 22).set('minute', 0)} 
                          skipDisabled 
                          shouldDisableTime={(value, view) => {
                            const hour = value.hour();
                            return hour < 6 || hour > 22; 
                          }}
                          slots={{ textField: TextField }}
                          slotProps={{
                            textField: {
                              variant: 'outlined',
                              error: timeError,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "0px", 
                                  height: '50px'
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderRadius: "0px",
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        Время окончания
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                        <TimePicker
                          value={selectedTimeEnd}
                          onChange={(newValue) => setSelectedTimeEnd(newValue)}
                          minTime={dayjs().set('hour', 6).set('minute', 0)} 
                          maxTime={dayjs().set('hour', 22).set('minute', 0)} 
                          skipDisabled 
                          shouldDisableTime={(value, view) => {
                            const hour = value.hour();
                            return hour < 6 || hour > 22; 
                          }}
                          slots={{ textField: TextField }}
                          slotProps={{
                            textField: {
                              variant: "outlined",
                              error: timeError,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "0px", 
                                  height: '50px'
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderRadius: "0px",
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <Checkbox checked={isRepeatChecked} onClick={handleCheckboxClick}/>
                          <Box sx={{display: 'flex', flexDirection: 'column',}}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              Повторять
                            </Typography>
                            <Typography variant="body1" color='primary' onClick={() => setDialogOpen(true)} sx={{display: (!isRepeatChecked) ? 'none' : 'block', cursor: 'pointer' }}>
                              Изменить
                            </Typography>
                          </Box>
                          
                        </Box>
                        <RepeatDialog
                          open={dialogOpen}
                          onClose={handleCloseDialog}
                          onSave={handleSaveRepeat}
                          initialSettings={repeatSettings} 
                        />
                    </Box>
                  </Box>
                  <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                          Занятость комнаты
                        </Typography>
                        {isOverlapping && (<Typography color="error">Событие пересекается с существующими</Typography>)}
                      </Box>
                      <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
                          <Box sx={{display: "flex",  gap: 1.5, height: '40px', border: '#A3A3A3 1px solid', alignItems: 'center', justifyContent: 'center'}}>
                            <IconButton
                              color="secondary"
                              sx={{ backgroundColor: "#eee", padding: '4px' }}
                              onClick={() => setTimeLineDate(timeLineDate!.add(-1, 'day'))}>
                              <ArrowBackIosNewIcon fontSize='small'/>
                            </IconButton>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                              <DatePicker
                                value={timeLineDate}
                                slots={{ textField: TextField }}
                                format='dddd, D MMMM'
                                open={openRoomCalendar} 
                                onOpen={() => setOpenRoomCalendar(true)} 
                                onClose={() => setOpenRoomCalendar(false)} 
                                onChange={handleChangeTimeLineDate}
                                slotProps={{
                                  textField: {
                                    onClick: () => setOpenRoomCalendar(true),
                                    InputProps: {
                                      endAdornment: null, 
                                      readOnly: true, 
                                    },
                                    sx: {
                                      "& .MuiOutlinedInput-root": {
                                        borderRadius: "0px",
                                        border: 'none',
                                      },
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderRadius: "0px",
                                        border: 'none',
                                      },
                                      "& .MuiInputBase-input": {
                                        cursor: "pointer", 
                                        userSelect: "none",
                                      },
                                    },
                                  },
                                }}
                              />
                            </LocalizationProvider>
                            <IconButton
                              color="secondary"
                              sx={{ backgroundColor: "#eee", padding: '4px'}}
                              onClick={() => setTimeLineDate(timeLineDate!.add(1, 'day'))}>
                              <ArrowForwardIosIcon fontSize='small'/>
                            </IconButton>
                          </Box>
                          <Box sx={{display: "flex", height: '150px', border: '#A3A3A3 1px solid', padding: '20px', background: '#F4F4F4'}}>
                              <MeetingRoomTimeline 
                                date={timeLineDate!.format('YYYY-MM-DD')} 
                                roomId={eventRoomId!} 
                                currentEvent={currentEvent} 
                                onOverlapCheck={handleOverlapCheck}/>
                          </Box>
                      </Box>
                  </Box>
                  <Box sx={{display: "flex", gap: 2.5}}>
                    <Button variant="outlined" color="secondary" fullWidth sx={{ height: "50px" }} onClick={handleClose}>
                      <img src="/images/cancel-icon.svg" alt="icon" style={{ marginRight: 10 }} />
                      Отменить
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ height: "50px", display: mode === "edit" ? "flex" : "none" }}
                      onClick={handleSubmit}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" style={{ marginRight: 10 }}>
                        <path d="M18 4.5V16.5C18 17.05 17.8042 17.5208 17.4125 17.9125C17.0208 18.3042 16.55 18.5 16 18.5H2C1.45 18.5 0.979167 18.3042 0.5875 17.9125C0.195833 17.5208 0 17.05 0 16.5V2.5C0 1.95 0.195833 1.47917 0.5875 1.0875C0.979167 0.695833 1.45 0.5 2 0.5H14L18 4.5ZM16 5.35L13.15 2.5H2V16.5H16V5.35ZM9 15.5C9.83333 15.5 10.5417 15.2083 11.125 14.625C11.7083 14.0417 12 13.3333 12 12.5C12 11.6667 11.7083 10.9583 11.125 10.375C10.5417 9.79167 9.83333 9.5 9 9.5C8.16667 9.5 7.45833 9.79167 6.875 10.375C6.29167 10.9583 6 11.6667 6 12.5C6 13.3333 6.29167 14.0417 6.875 14.625C7.45833 15.2083 8.16667 15.5 9 15.5ZM3 7.5H12V4.5H3V7.5ZM2 5.35V16.5V2.5V5.35Z" />
                      </svg>
                      Сохранить
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ height: "50px", display: mode === "create" ? "flex" : "none" }}
                      onClick={handleSubmit}
                    >
                      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 10 }}>
                        <path
                          d="M9.6 14.5H11.4V10.9H15V9.1H11.4V5.5H9.6V9.1H6V10.9H9.6V14.5ZM10.5 19C9.255 19 8.085 18.7638 6.99 18.2913C5.895 17.8188 4.9425 17.1775 4.1325 16.3675C3.3225 15.5575 2.68125 14.605 2.20875 13.51C1.73625 12.415 1.5 11.245 1.5 10C1.5 8.755 1.73625 7.585 2.20875 6.49C2.68125 5.395 3.3225 4.4425 4.1325 3.6325C4.9425 2.8225 5.895 2.18125 6.99 1.70875C8.085 1.23625 9.255 1 10.5 1C11.745 1 12.915 1.23625 14.01 1.70875C15.105 2.18125 16.0575 2.8225 16.8675 3.6325C17.6775 4.4425 18.3188 5.395 18.7913 6.49C19.2638 7.585 19.5 8.755 19.5 10C19.5 11.245 19.2638 12.415 18.7913 13.51C18.3188 14.605 17.6775 15.5575 16.8675 16.3675C16.0575 17.1775 15.105 17.8188 14.01 18.2913C12.915 18.7638 11.745 19 10.5 19ZM10.5 17.2C12.51 17.2 14.2125 16.5025 15.6075 15.1075C17.0025 13.7125 17.7 12.01 17.7 10C17.7 7.99 17.0025 6.2875 15.6075 4.8925C14.2125 3.4975 12.51 2.8 10.5 2.8C8.49 2.8 6.7875 3.4975 5.3925 4.8925C3.9975 6.2875 3.3 7.99 3.3 10C3.3 12.01 3.9975 13.7125 5.3925 15.1075C6.7875 16.5025 8.49 17.2 10.5 17.2Z"
                          fill="white"
                        />
                      </svg>
                      Добавить
                    </Button>
                  </Box>
                </div>
              </div>
            </div>
        </Dialog>
    </ThemeProvider>
  );
};

export default EventForm;
