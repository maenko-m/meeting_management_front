import React, { useState, useEffect } from 'react';
import { Box, Typography, Menu, MenuItem, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, Button, ThemeProvider, IconButton, Collapse, useMediaQuery, Pagination } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

import theme from '../../styles/theme';
import { fetchEvents, deleteEvent } from "../../api/events";
import { fetchMeetingRooms } from "../../api/meetingRooms";
import { Event, MeetingRoom, } from "../../types";
import EventForm from "../../components/EventForm";
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

interface EventsProps {
    disableRoomElements?: boolean;
    idRoom?: number; 
}
  
const MyEvents: React.FC<EventsProps> = ({ disableRoomElements = false, idRoom }) => {

    const repeatTypeTranslations: Record<string, string> = {
        day: 'день',
        week: 'неделю',
        month: 'месяц',
        year: 'год',
    };

    const isLaptop = useMediaQuery("(max-width:1440px)");
    const isTablet = useMediaQuery("(max-width:1024px)");
    const isMobile = useMediaQuery("(max-width:600px)");

    const [value, setValue] = useState(0); 
    const [events, setEvents] = useState<Event[]>([]);
    const [rooms, setRooms] = useState<MeetingRoom[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);

    const [nameFilter, setNameFilter] = useState("");
    const [roomId, setRoomId] = useState<number | "">(idRoom ? idRoom : "");
    const [descOrder, setDescOrder] = useState<boolean>(false);
    const [page, setPage] = useState(1);


    const [openRows, setOpenRows] = useState<{ [key: number]: boolean }>({});
    const [anchorEls, setAnchorEls] = useState<{ [key: number]: HTMLElement | null }>({});

    const [eventsAmount, setEventsAmount] = useState<number>(0);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit">("create");
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const { user, loading, hasRole } = useAuth();
    const router = useRouter();
    const { showNotification } = useNotification()
    const { confirm, ConfirmComponent } = useConfirmDialog();

    const [eventsTotalPages, setEventsTotalPages] = useState<number>(1);
    const [currentPageEvents, setCurrentPageEvents] = useState<Event[]>([]);

    useEffect(() => {
            if (!loading && (hasRole('ROLE_MODERATOR')) && !disableRoomElements) {
                router.push('/eventsadmin');
            }
    }, [user, loading, hasRole, router]);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setEventsAmount(0);
        setValue(newValue);
    };

    const toggleRow = (index: number) => {
        setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const handleClick = (index: number) => (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEls((prev) => ({ ...prev, [index]: event.currentTarget }));
    };
    
    const handleClose = (index: number) => () => {
        setAnchorEls((prev) => ({ ...prev, [index]: null }));
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedEvent(null);
    };

    const handleAddEvent = () => {
        setFormMode("create");
        setSelectedEvent(null);
        setFormOpen(true);
    };

    const handleEditEvent = (event: Event) => {
        setFormMode("edit");
        setSelectedEvent(event);
        setFormOpen(true);
    };

    const handleDeleteEvent = async (event: Event) => {
        const confirmed = await confirm({
            message: 'Вы уверены, что хотите удалить это мероприятие?',
            confirmText: 'Удалить',
            cancelText: 'Отмена',
        });
        if (confirmed) {
        try {
            await deleteEvent(event.id); 
            setAnchorEls({});
            loadEvents(); 
            showNotification(
                "Мероприятие успешно удалено",
                'success'
            );
        } catch (err) {
            showNotification(
                "Не удалось удалить мероприятие",
                'error'
            );
        }
        }
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setAnchorEls({});
        setSelectedEvent(null);
        setFormMode("create");
        loadEvents();
    };



    useEffect(() => {
        const loadRooms = async () => {
            try {
                const data = await fetchMeetingRooms();
                setRooms(data.data);
            } catch (err) {
                showNotification(
                    "Не удалось загрузить комнаты",
                    'error'
                );
            }
        };
        loadRooms();
    }, [showNotification]);

    const loadEvents = async () => {
        try {
        setEventsLoading(true);
        setEventsError(null);
        const filters = {
            roomId: roomId === "" ? undefined : roomId,
            name: nameFilter || undefined,
            type: value === 0 ? "организатор" : "участник",
            isArchived: 'false',
            descOrder,
        };
        const data = await fetchEvents(filters);
        setEvents(data);
        setEventsAmount(data.length);
        setEventsTotalPages(Math.ceil(data.length / 10));
        setPage(1); 
        setCurrentPageEvents(data.slice(0, 10));
        } catch (err) {
            showNotification(
                "Не удалось загрузить мероприятия",
                'error'
            );
        setEventsError("Не удалось загрузить мероприятия");
        } finally {
        setEventsLoading(false);
        }
    };

    useEffect(() => {

        loadEvents();
    }, [value, nameFilter, roomId, descOrder]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
        const startIndex = (newPage - 1) * 10;
        const endIndex = startIndex + 10;
        setCurrentPageEvents(events.slice(startIndex, endIndex));
    };


    if (loading || hasRole('ROLE_MODERATOR')) {
        return (
            null
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: isTablet ? "94vh" : "92vh" }} >
                <Box>
                    {/* Фильтрация */}
                    <Box sx={{ display: "flex", alignItems: isLaptop ? "stetch" : "center", justifyContent: "space-between", marginBottom: "1em", flexDirection: isLaptop ? "column" : "row", gap: 1 }}>
                        <Tabs value={value} onChange={handleChange} aria-label="event tabs" sx={{ '& .MuiTabs-indicator': { display: 'none' }, width: "100%", display: "flex", alignItems: isMobile ? "flex-end" : "center", flexDirection: isMobile ? "column" : "row" }}>
                            <Tab label={
                                <Box sx={{ display: "flex", gap: 1  }}>
                                    <Typography variant='h5' sx={{ color: value === 0 ? '#000' : '#A3A3A3' }}>Мои мероприятия</Typography>
                                    {(value === 0) && (
                                        <Typography sx={{ fontSize: '14px', color: '#A3A3A3',  }}>{eventsAmount}</Typography>
                                    )}  
                                </Box>
                            } sx={{ opacity: value === 0 ? 1 : 0.5 }} />
                            <Tab label={
                                <Box sx={{ display: "flex", gap: 1  }}>
                                    <Typography variant='h5' sx={{ color: value === 1 ? '#000' : '#A3A3A3' }}>Участвую</Typography>
                                    {(value === 1) && (
                                        <Typography sx={{ fontSize: '14px', color: '#A3A3A3',  }}>{eventsAmount}</Typography>
                                    )}
                                </Box>
                            } sx={{ opacity: value === 1 ? 1 : 0.5 }} />
                        </Tabs>
                        <Box sx={{ display:"flex", alignItems: "center", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
                            {value === 0 && (
                                <Button variant="outlined" color="secondary" onClick={() => handleAddEvent()} sx={{ width: isMobile ? "100%" : "auto"}}>
                                    <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#858585">
                                        <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
                                    </svg>
                                </Button>
                            )}
                            <Box sx={{ display: "flex", gap: 2, width: "100%", flexDirection: isMobile ? "column" : "row" }}>
                                <TextField
                                    variant="outlined"
                                    placeholder="Название мероприятия"
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                    sx={{ width: isLaptop ? "100%" : "230px"}}
                                />
                                {!disableRoomElements && (
                                    <Select
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value as number | "")}
                                        displayEmpty
                                        sx={{ width: isLaptop ? "100%" : "230px", }}
                                        >
                                        <MenuItem value="">Все комнаты</MenuItem>
                                        {rooms.map((room) => (
                                            <MenuItem key={room.id} value={room.id}>
                                            {room.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                )}
                            </Box>
                        </Box>
                    </Box>
                    
                    {/* Таблица "Мои мероприятия" */}
                    {value === 0 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead color="secondary">
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Наименование</TableCell>
                                    <TableCell sx={{ whiteSpace: "nowrap" }} >{isLaptop ? "Перег. комната" : "Переговорная комната"}</TableCell>
                                    <TableCell>Дата</TableCell>
                                    <TableCell>{isLaptop ? "Начало" : "Время начала"}</TableCell>
                                    <TableCell>{isLaptop ? "Конец" : "Время оканчания"}</TableCell>
                                    <TableCell>Повторы</TableCell>
                                    <TableCell align="center" >
                                        <svg width="16" height="10" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4ZM8 4C7.45 4 6.97917 3.80417 6.5875 3.4125C6.19583 3.02083 6 2.55 6 2C6 1.45 6.19583 0.979167 6.5875 0.5875C6.97917 0.195833 7.45 0 8 0C8.55 0 9.02083 0.195833 9.4125 0.5875C9.80417 0.979167 10 1.45 10 2C10 2.55 9.80417 3.02083 9.4125 3.4125C9.02083 3.80417 8.55 4 8 4ZM14 4C13.45 4 12.9792 3.80417 12.5875 3.4125C12.1958 3.02083 12 2.55 12 2C12 1.45 12.1958 0.979167 12.5875 0.5875C12.9792 0.195833 13.45 0 14 0C14.55 0 15.0208 0.195833 15.4125 0.5875C15.8042 0.979167 16 1.45 16 2C16 2.55 15.8042 3.02083 15.4125 3.4125C15.0208 3.80417 14.55 4 14 4Z" fill="#858585"/>
                                        </svg>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {eventsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                    <Typography align="center">Загрузка...</Typography>
                                    </TableCell>
                                </TableRow>
                                ) : eventsError ? (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                    <Typography align="center" color="error">
                                        {eventsError}
                                    </Typography>
                                    </TableCell>
                                </TableRow>
                                ) : (
                                currentPageEvents.map((event, index) => (
                                    <React.Fragment key={`${event.id}-${event.date}`}>
                                    <TableRow
                                        sx={{
                                        "&:nth-of-type(odd)": { backgroundColor: "#FFFFFF" },
                                        "&:nth-of-type(4n-3)": { backgroundColor: "#F4F4F4" },
                                        }}
                                    >
                                        <TableCell>
                                        <IconButton onClick={() => toggleRow(index)} size="small" sx={{ padding: "0" }}>
                                            {openRows[index] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: isTablet ? "165px" : "300px", overflow: openRows[index] ? "visible" : "hidden", textOverflow: openRows[index] ? "unset" : 'ellipsis', whiteSpace: openRows[index] ? "normal" : 'nowrap', }} >{event.name}</TableCell>
                                        <TableCell sx={{ maxWidth: "165px", overflow: openRows[index] ? "visible" : "hidden", textOverflow: openRows[index] ? "unset" : 'ellipsis', whiteSpace: openRows[index] ? "normal" : 'nowrap', }} >{event.meetingRoomName}</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }} >{event.date}</TableCell>
                                        <TableCell>{event.timeStart}</TableCell>
                                        <TableCell>{event.timeEnd}</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>{event.recurrenceInterval ? `Каждый(ую) ${event.recurrenceInterval} ${repeatTypeTranslations[event.recurrenceTypeValue!]}, до ${event.recurrenceEnd}` : "Нет повторов"}</TableCell>
                                        <TableCell align="center">
                                        <IconButton onClick={handleClick(index)} sx={{ padding: "0" }}>
                                            <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#858585"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
                                        </IconButton>
                                        <Menu anchorEl={anchorEls[index]}
                                            open={Boolean(anchorEls[index])}
                                            onClose={handleClose(index)} 
                                            sx={{ border: "1px solid #858585" }}>
                                            <MenuItem sx={{ gap: 1 }} onClick={() => handleEditEvent(event)}>
                                                <svg height="20px" viewBox="0 -960 960 960" width="20px">
                                                    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                                                </svg>
                                                {event.recurrenceInterval ? 'Изменить серию' : 'Изменить мероприятие'} 
                                            </MenuItem>
                                            <MenuItem sx={{ gap: 1 }} onClick={() => handleDeleteEvent(event)}>
                                                <svg height="20px" viewBox="0 -960 960 960" width="20px">
                                                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                                                </svg>
                                                {event.recurrenceInterval ? 'Удалить серию' : 'Удалить мероприятие'} 
                                            </MenuItem>
                                        </Menu>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ padding: 0 }} />
                                        <TableCell colSpan={7} sx={{ padding: 0 }}>
                                        <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 2 }}>
                                            <Box sx={{ paddingBottom: 1 }}>
                                                <Typography color="#858585" sx={{ backgroundColor: "#E3E3E3", padding: 1 }}>
                                                Описание
                                                </Typography>
                                                <Typography sx={{ backgroundColor: "#F4F4F4", padding: 1 }}>{event.description}</Typography>
                                            </Box>
                                            <Box sx={{ paddingBottom: 1 }}>
                                                <Typography color="#858585" sx={{ backgroundColor: "#E3E3E3", padding: 1 }}>
                                                    Участники
                                                </Typography>
                                                {event.employees.length > 0 ? (
                                                        event.employees.map(employee => {
                                                            return <Typography key={employee.id} sx={{ backgroundColor: '#F4F4F4', padding: 1 }}>{employee.fullName}</Typography>
                                                        })
                                                    ) : (
                                                        <Typography sx={{ backgroundColor: '#F4F4F4', padding: 1 }}>Не указано</Typography>
                                                )}
                                            </Box>
                                            </Box>
                                        </Collapse>
                                        </TableCell>
                                    </TableRow>
                                    </React.Fragment>
                                ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    )}
                    
                    {/* Таблица "Участвую" */}
                    {value === 1 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead color="secondary">
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Наименование</TableCell>
                                    <TableCell>Автор</TableCell>
                                    <TableCell sx={{ whiteSpace: "nowrap" }} >{isLaptop ? "Перег. комната" : "Переговорная комната"}</TableCell>
                                    <TableCell>Дата</TableCell>
                                    <TableCell>{isLaptop ? "Начало" : "Время начала"}</TableCell>
                                    <TableCell>{isLaptop ? "Конец" : "Время оканчания"}</TableCell>
                                    <TableCell>Повторы</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {eventsLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                        <Typography align="center">Загрузка...</Typography>
                                        </TableCell>
                                    </TableRow>
                                    ) : eventsError ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                        <Typography align="center" color="error">
                                            {eventsError}
                                        </Typography>
                                        </TableCell>
                                    </TableRow>
                                    ) : (
                                    currentPageEvents.map((event, index) => (
                                        <React.Fragment key={`${event.id}-${event.date}`} >
                                        <TableRow
                                            sx={{
                                            "&:nth-of-type(odd)": { backgroundColor: "#FFFFFF" },
                                            "&:nth-of-type(4n-3)": { backgroundColor: "#F4F4F4" },
                                            }}
                                        >
                                            <TableCell>
                                            <IconButton onClick={() => toggleRow(index)} size="small" sx={{ padding: "0" }}>
                                                {openRows[index] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                            </IconButton>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: isTablet ? "165px" : "300px", overflow: openRows[index] ? "visible" : "hidden", textOverflow: openRows[index] ? "unset" : 'ellipsis', whiteSpace: openRows[index] ? "normal" : 'nowrap', }}>{event.name}</TableCell>
                                            <TableCell>{event.author.fullName}</TableCell>
                                            <TableCell sx={{ maxWidth: "165px", overflow: openRows[index] ? "visible" : "hidden", textOverflow: openRows[index] ? "unset" : 'ellipsis', whiteSpace: openRows[index] ? "normal" : 'nowrap', }} >{event.meetingRoomName}</TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }} >{event.date}</TableCell>
                                            <TableCell>{event.timeStart}</TableCell>
                                            <TableCell>{event.timeEnd}</TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>{event.recurrenceInterval ? `Каждый(ую) ${event.recurrenceInterval} ${repeatTypeTranslations[event.recurrenceTypeValue!]}, до ${event.recurrenceEnd}` : "Нет повторов"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell sx={{ padding: 0 }} />
                                            <TableCell colSpan={7} sx={{ padding: 0 }}>
                                            <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 2 }}>
                                                <Box sx={{ paddingBottom: 1 }}>
                                                    <Typography color="#858585" sx={{ backgroundColor: "#E3E3E3", padding: 1 }}>
                                                    Описание
                                                    </Typography>
                                                    <Typography sx={{ backgroundColor: "#F4F4F4", padding: 1 }}>{event.description}</Typography>
                                                </Box>
                                                <Box sx={{ paddingBottom: 1 }}>
                                                    <Typography color="#858585" sx={{ backgroundColor: "#E3E3E3", padding: 1 }}>
                                                    Участники
                                                    </Typography>
                                                    {event.employees.length > 0 ? (
                                                        event.employees.map(employee => {
                                                            return <Typography key={employee.id} sx={{ backgroundColor: '#F4F4F4', padding: 1 }}>{employee.fullName}</Typography>
                                                        })
                                                    ) : (
                                                        <Typography sx={{ backgroundColor: '#F4F4F4', padding: 1 }}>Не указано</Typography>
                                                    )}
                                                </Box>
                                                </Box>
                                            </Collapse>
                                            </TableCell>
                                        </TableRow>
                                        </React.Fragment>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    )}
                </Box>
                {eventsTotalPages > 1 && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'start' }}>
                        <Pagination
                            count={eventsTotalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="medium"
                        />
                    </Box>
                )}
                <EventForm 
                    open={formOpen} 
                    onClose={handleFormClose} 
                    mode={formMode} 
                    event={ formMode === 'create' ? null :
                    {
                        name: selectedEvent!.name,
                        description: selectedEvent!.description,
                        authorId: selectedEvent!.author.id,
                        meetingRoomId: selectedEvent!.meetingRoomId,
                        employeeIds: selectedEvent!.employees.map((employee) => employee.id),
                        date: selectedEvent!.originalDate ?? selectedEvent!.date,
                        timeStart: selectedEvent!.timeStart,
                        timeEnd: selectedEvent!.timeEnd,
                    }} 
                    idEvent={formMode === 'create' ? null : selectedEvent!.id}/>
                <ConfirmComponent />
            </div>
        </ThemeProvider>
    );
};
  
export default MyEvents;  