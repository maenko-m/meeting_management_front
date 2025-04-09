import React, { useState, useEffect } from 'react';
import { Box, ThemeProvider, TextField, Button, Checkbox, FormControlLabel, Select, MenuItem, Typography, TableContainer, Table, TableHead, TableRow, TableCell, Paper, IconButton, Menu, Collapse, TableBody, useMediaQuery, Stack } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import '../../styles/global.css';
import theme from '../../styles/theme';
import { fetchOffices } from "../../api/offices";
import { MeetingRoom, Office, Event } from "../../types";
import { useRouter } from 'next/router';
import { deleteEvent, fetchEvents } from '../../api/events';
import { fetchMeetingRooms } from '../../api/meetingRooms';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useNotification } from '../../context/NotificationContext';

const ProfilePage = () => {
    const isLaptop = useMediaQuery("(max-width:1440px)");
    const isLaptop2 = useMediaQuery("(max-width:1560px)");
    const isMobile = useMediaQuery("(max-width:600px)");

    const router = useRouter();
    const { confirm, ConfirmComponent } = useConfirmDialog();
    const { showNotification } = useNotification()

    const [typeValue, setTypeValue] = useState<number>(0);
    const [activeButton, setActiveButton] = useState("Я организатор");

    const [rooms, setRooms] = useState<MeetingRoom[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState<string | null>(null);

    const [nameFilter, setNameFilter] = useState("");
    const [roomId, setRoomId] = useState<number | "">("");
    const [descOrder, setDescOrder] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);


    const [openRows, setOpenRows] = useState<{ [key: number]: boolean }>({});
    const [anchorEls, setAnchorEls] = useState<{ [key: number]: HTMLElement | null }>({});
    
    const toggleRow = (index: number) => {
        setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
    };
    
    const handleClick = (index: number) => (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEls((prev) => ({ ...prev, [index]: event.currentTarget }));
    };
      
    const handleClose = (index: number) => () => {
        setAnchorEls((prev) => ({ ...prev, [index]: null }));
    };

    const setTypeFilter = (value: number, button: string) => {
        setTypeValue(value);
        setActiveButton(button);
    }

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
            console.error("Ошибка при удалении:", err);
            showNotification(
                "Не удалось удалить мероприятие",
                'error'
            );
          }
        }
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
      }, []);
    
    const loadEvents = async () => {
        try {
          setEventsLoading(true);
          setEventsError(null);
          const filters = {
            roomId: roomId === "" ? undefined : roomId,
            name: nameFilter || undefined,
            type: typeValue === 0 ? "организатор" : "участник",
            isArchived: 'true',
            descOrder,
            page,
            limit,
          };
          const data = await fetchEvents(filters);
          setEvents(data.data);
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
    }, [typeValue, nameFilter, roomId, descOrder, page, limit]);

    return (
        <ThemeProvider theme={theme}>
            <div style={{ width: "100%"}}>

            <Box sx={{ marginBottom: "1em" }}>
                    { isLaptop2 ? (
                        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: isMobile ? "flex-end" : "center", flexDirection: isMobile ? "column" : "row", gap: 1 }}>
                                <Typography variant="h5" sx={{ whiteSpace: "nowrap" }}>Архив мероприятий</Typography>
                                <Button onClick={() => router.push('/profile')} sx={{ color: "secondary.main", background: "#EEEEEE", whiteSpace: "nowrap" }}>
                                    В профиль
                                </Button>
                            </Box>
                            <Box sx={{ display:"flex", gap: 2, width: "100%", flexDirection: isMobile ? "column" : "row" }}>
                                <TextField
                                    variant="outlined"
                                    placeholder="Название мероприятия"
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                    sx={{ width: isLaptop2 ? "100%" : "230px"}}
                                />
                                <Select
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value as number | "")}
                                    displayEmpty
                                    sx={{ width: isLaptop2 ? "100%" : "230px"}}
                                    >
                                    <MenuItem value="">Все комнаты</MenuItem>
                                    {rooms.map((room) => (
                                        <MenuItem key={room.id} value={room.id}>
                                        {room.name}
                                        </MenuItem>
                                    ))}
                                </Select>

                                <Stack direction="row">
                                    <Button 
                                        variant={activeButton === "Я организатор" ? "contained" : "outlined"} 
                                        color={activeButton === "Я организатор" ? "success" : "secondary"}
                                        onClick={() => setTypeFilter(0, 'Я организатор')}
                                        sx={{
                                            flex: isLaptop ? 1 : "auto",
                                            width: isLaptop ? "100%" : "auto",
                                            border: "1px solid",
                                            borderColor: activeButton === "Я организатор" ? "success.main" : "secondary.main",
                                            boxShadow: activeButton === "Я организатор" ? "none" : undefined,
                                            "&:hover": {
                                                boxShadow: "none",
                                            },
                                            whiteSpace: "nowrap"
                                        }}>Я организатор
                                    </Button>
                                    <Button 
                                        variant={activeButton === "Я участник" ? "contained" : "outlined"} 
                                        color={activeButton === "Я участник" ? "success" : "secondary"}
                                        onClick={() => setTypeFilter(1, 'Я участник')} onClick={() => setTypeFilter(0, 'Я организатор')} 
                                        sx={{
                                            flex: isLaptop ? 1 : "auto",
                                            width: isLaptop ? "100%" : "auto",
                                            border: "1px solid",
                                            borderColor: activeButton === "Я участник" ? "success.main" : "secondary.main",
                                            boxShadow: activeButton === "Я участник" ? "none" : undefined,
                                            "&:hover": {
                                                boxShadow: "none",
                                            }, 
                                            whiteSpace: "nowrap"
                                        }}>Я участник
                                    </Button>
                                </Stack>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="h5" sx={{ whiteSpace: "nowrap" }}>Архив мероприятий</Typography>
                            <Box sx={{ display:"flex", gap: 2 }}>
                                <Box sx={{ display:"flex", alignItems: "center", gap: 2 }}>
                                    <Stack direction="row">
                                        <Button 
                                            variant={activeButton === "Я организатор" ? "contained" : "outlined"} 
                                            color={activeButton === "Я организатор" ? "success" : "secondary"}
                                            onClick={() => setTypeFilter(0, 'Я организатор')}
                                            sx={{
                                                flex: isLaptop ? 1 : "auto",
                                                width: isLaptop ? "100%" : "auto",
                                                border: "1px solid",
                                                borderColor: activeButton === "Я организатор" ? "success.main" : "secondary.main",
                                                boxShadow: activeButton === "Я организатор" ? "none" : undefined,
                                                "&:hover": {
                                                    boxShadow: "none",
                                                },
                                                whiteSpace: "nowrap"
                                            }}>Я организатор
                                        </Button>
                                        <Button 
                                            variant={activeButton === "Я участник" ? "contained" : "outlined"} 
                                            color={activeButton === "Я участник" ? "success" : "secondary"}
                                            onClick={() => setTypeFilter(1, 'Я участник')} onClick={() => setTypeFilter(0, 'Я организатор')} 
                                            sx={{
                                                flex: isLaptop ? 1 : "auto",
                                                width: isLaptop ? "100%" : "auto",
                                                border: "1px solid",
                                                borderColor: activeButton === "Я участник" ? "success.main" : "secondary.main",
                                                boxShadow: activeButton === "Я участник" ? "none" : undefined,
                                                "&:hover": {
                                                    boxShadow: "none",
                                                }, 
                                                whiteSpace: "nowrap"
                                            }}>Я участник
                                        </Button>
                                    </Stack>
                                    <TextField
                                        variant="outlined"
                                        placeholder="Название мероприятия"
                                        value={nameFilter}
                                        onChange={(e) => setNameFilter(e.target.value)}
                                        sx={{ width: "270px" }}
                                    />
                                    <Select
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value as number | "")}
                                        displayEmpty
                                        sx={{ width: "270px" }}
                                        >
                                        <MenuItem value="">Все комнаты</MenuItem>
                                        {rooms.map((room) => (
                                            <MenuItem key={room.id} value={room.id}>
                                            {room.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Box>
                                <Button onClick={() => router.push('/profile')} sx={{ color: "secondary.main", background: "#EEEEEE", whiteSpace: "nowrap" }}>
                                    В профиль
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>

                <Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead color="secondary">
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Наименование</TableCell>
                                    <TableCell>{isLaptop ? "Перег. комната" : "Переговорная комната"}</TableCell>
                                    <TableCell>Дата</TableCell>
                                    <TableCell>{isLaptop ? "Начало" : "Время начала"}</TableCell>
                                    <TableCell>{isLaptop ? "Конец" : "Время оканчания"}</TableCell>
                                    <TableCell align="center" sx={{ padding: "0" }}>
                                        <svg width="16" height="24" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 4C1.45 4 0.979167 3.80417 0.5875 3.4125C0.195833 3.02083 0 2.55 0 2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0C2.55 0 3.02083 0.195833 3.4125 0.5875C3.80417 0.979167 4 1.45 4 2C4 2.55 3.80417 3.02083 3.4125 3.4125C3.02083 3.80417 2.55 4 2 4ZM8 4C7.45 4 6.97917 3.80417 6.5875 3.4125C6.19583 3.02083 6 2.55 6 2C6 1.45 6.19583 0.979167 6.5875 0.5875C6.97917 0.195833 7.45 0 8 0C8.55 0 9.02083 0.195833 9.4125 0.5875C9.80417 0.979167 10 1.45 10 2C10 2.55 9.80417 3.02083 9.4125 3.4125C9.02083 3.80417 8.55 4 8 4ZM14 4C13.45 4 12.9792 3.80417 12.5875 3.4125C12.1958 3.02083 12 2.55 12 2C12 1.45 12.1958 0.979167 12.5875 0.5875C12.9792 0.195833 13.45 0 14 0C14.55 0 15.0208 0.195833 15.4125 0.5875C15.8042 0.979167 16 1.45 16 2C16 2.55 15.8042 3.02083 15.4125 3.4125C15.0208 3.80417 14.55 4 14 4Z" fill="#858585"/>
                                        </svg>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {events.map((event, index) => (
                                    <React.Fragment key={index}>
                                    {/* Основная строка */}
                                    <TableRow sx={{
                                        '&:nth-of-type(odd)': {
                                            backgroundColor: '#FFFFFF',
                                        },
                                        '&:nth-of-type(4n-3)': {
                                            backgroundColor: '#F4F4F4',
                                        },
                                    }}>
                                        <TableCell>
                                            <IconButton onClick={() => toggleRow(index)} size="small" sx={{ padding: "0" }}>
                                                {openRows[index] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{event.name}</TableCell>
                                        <TableCell>{event.meetingRoomName}</TableCell>
                                        <TableCell>{event.date}</TableCell>
                                        <TableCell>{event.timeStart}</TableCell>
                                        <TableCell>{event.timeEnd}</TableCell>
                                        <TableCell align="center">
                                            <IconButton onClick={handleClick(index)} sx={{ padding: "0" }} >
                                                <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#858585"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg>
                                            </IconButton>
                                            <Menu anchorEl={anchorEls[index]}
                                                open={Boolean(anchorEls[index])}
                                                onClose={handleClose(index)} 
                                                sx={{ border: "1px solid #858585" }}>
                                                <MenuItem onClick={() => handleDeleteEvent(event)} sx={{ gap: 1 }}>
                                                    <svg height="20px" viewBox="0 -960 960 960" width="20px">
                                                        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                                                    </svg> Удалить мероприятие
                                                </MenuItem>
                                            </Menu>
                                        </TableCell>
                                    </TableRow>
                        
                                    {/* Расширяемая строка */}
                                    <TableRow>
                                        <TableCell sx={{ padding: 0 }} />
                                        <TableCell colSpan={7} sx={{ padding: 0 }}>
                                            <Collapse in={openRows[index]} timeout="auto" unmountOnExit>
                                                <Box sx={{ margin: 2 }}>
                                                    <Box sx={{ paddingBottom: 1 }}>
                                                        <Typography color='#858585' sx={{ backgroundColor: '#E3E3E3', padding: 1 }}>Повторы</Typography>
                                                        <Typography sx={{ backgroundColor: '#F4F4F4', padding: 1 }}></Typography>
                                                    </Box>
                                                    <Box sx={{ paddingBottom: 1 }}>
                                                        <Typography color='#858585' sx={{ backgroundColor: '#E3E3E3', padding: 1 }}>Описание</Typography>
                                                        <Typography sx={{ backgroundColor: '#F4F4F4', padding: 1 }}>{event.description}</Typography>
                                                    </Box>
                                                    <Box sx={{ paddingBottom: 1 }}>
                                                        <Typography color='#858585' sx={{ backgroundColor: '#E3E3E3', padding: 1 }}>Участники</Typography>
                                                        <Typography sx={{ backgroundColor: '#F4F4F4', padding: 1 }}>{event.employees?.join(', ')}</Typography>
                                                    </Box>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </div>
            <ConfirmComponent />
        </ThemeProvider>
    );
};

export default ProfilePage;  