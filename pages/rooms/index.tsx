import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, Button, ThemeProvider, useMediaQuery, Stack, Pagination, Chip } from "@mui/material";

import theme from '../../styles/theme';
import { MeetingRoom, Office } from "../../types";
import { fetchMeetingRooms } from "../../api/meetingRooms";
import { fetchOffices } from "../../api/offices";
import { useNavigate } from "react-router-dom";
import { useNotification } from '../../context/NotificationContext';


  
const MeetingRooms = () => {

    const isLaptop = useMediaQuery("(max-width:1440px)");
    const isTablet = useMediaQuery("(max-width:1024px)");
    const isMobile = useMediaQuery("(max-width:600px)");
   
    const [rooms, setRooms] = useState<MeetingRoom[]>([]);

    const [roomsAmount, setRoomsAmount] = useState<number>(0);

    const [offices, setOffices] = useState<Office[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [nameFilter, setNameFilter] = useState("");
    const [activeButton, setActiveButton] = useState("Все");
    const [accessibleButton, setAccessibleButton] = useState("Все");
    const [officeId, setOfficeId] = useState<number | "">(() => {
        const storedId = localStorage.getItem('default_office_id');
        return storedId ? Number(storedId) : "";
    });
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [roomsTotalPages, setRoomsTotalPages] = useState<number>(1);

    const router = useRouter();
    const { showNotification } = useNotification()

    const handleRowClick = (id: number) => {
        router.push(`/roomcard/${id}`);
    };

    useEffect(() => {
        const loadOffices = async () => {
          try {
            const data = await fetchOffices();
            setOffices(data);
          } catch (err) {
            showNotification(
                "Не удалось загрузить офисы",
                'error'
            );
            setError("Не удалось загрузить офисы");
          }
        };
        loadOffices();
    }, []);

    useEffect(() => {
        const loadRooms = async () => {
          try {
            setLoading(true);
            const filters = {
              officeId: officeId === "" ? undefined : officeId,
              name: nameFilter || undefined,
              page,
              limit,
            };
            const data = await fetchMeetingRooms(filters);
            setRooms(data.data); 
            setRoomsAmount(data.meta.total);
            setRoomsTotalPages(data.meta.totalPages);
          } catch (err) {
            showNotification(
                "Не удалось загрузить список комнат",
                'error'
            );
            setError("Не удалось загрузить список комнат");
          } finally {
            setLoading(false);
          }
        };
    
        loadRooms();
    }, [nameFilter, officeId, activeButton, accessibleButton, page, limit]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
        setPage(newPage);
    };

    return (
        <ThemeProvider theme={theme}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: isTablet ? "94vh" : "92vh" }}>
                <Box>
                    {/* Фильтрация */}
                    <Box sx={{ display: "flex", alignItems: isLaptop ? "stetch" : "center", justifyContent: "space-between", marginBottom: "1em", flexDirection: isLaptop ? "column" : "row", gap: 1 }}>
                        <Box sx={{ display: "flex", gap: 1, justifyContent: isMobile ? "flex-end" : "flex-start" }} >
                            <Typography variant='h5' sx={{ padding: "12px 0", marginLeft: isMobile? "50px" : "0px", textAlign: "end" }}>Переговорные комнаты</Typography>
                            <Typography sx={{ color: "#A3A3A3" }}>
                                {loading ? (0) : error ? (0) : (roomsAmount)}
                            </Typography>
                        </Box>
                        <Box sx={{ display:"flex", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
                            <TextField
                                variant="outlined"
                                placeholder="Название комнаты"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                sx={{ width: isLaptop ? "100%" : "230px"}}
                            />
                            <Select
                                value={officeId}
                                onChange={(e) => setOfficeId(e.target.value as number | "" )}
                                displayEmpty
                                sx={{ width: isLaptop ? "100%" : "230px"}}
                                >
                                    <MenuItem value="">Все офисы</MenuItem>
                                    {offices.map((office) => (
                                        <MenuItem key={office.id} value={office.id}>
                                            {office.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </Box>
                    </Box>
                    
                    {/* Таблица */}
                    <TableContainer component={Paper}>
                        <Table>
                        <TableHead color="secondary">
                            <TableRow>
                                <TableCell>Наименование</TableCell>
                                <TableCell>Офис</TableCell>
                                <TableCell>Занятость</TableCell>
                                <TableCell>{isLaptop ? "Чел." : "Емкость, чел."}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography align="center">Загрузка...</Typography>
                                </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                <TableCell colSpan={5}>
                                    <Typography align="center" color="error">
                                        {error}
                                    </Typography>
                                </TableCell>
                                </TableRow>
                            ) : (
                                rooms.map((room) => (
                                <TableRow key={room.id} 
                                    onClick={() => handleRowClick(room.id)}
                                    sx={{ 
                                        cursor: "pointer", 

                                        "&:hover": { 
                                            opacity: "0.4" 
                                        } 
                                    }}
                                    >
                                    <TableCell>{room.name}</TableCell>
                                    <TableCell>{room.office.name}</TableCell>
                                    <TableCell>
                                    {room.occupied ? (
                                        <Chip
                                            label="Занята"
                                            sx={{
                                                backgroundColor: '#fff3e0', 
                                                color: '#f57c00', 
                                            }}
                                        />
                                    ) : (
                                        <Chip
                                            label="Свободна"
                                            
                                            sx={{
                                                backgroundColor: '#e8f5e9', 
                                                color: '#388e3c',
                                            }}
                                        />
                                    )}
                                    </TableCell>
                                    <TableCell>{room.size}</TableCell>
                                </TableRow>
                                ))
                            )}
                        </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                {roomsTotalPages > 1 && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'start' }}>
                        <Pagination
                            count={roomsTotalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            size="medium"
                        />
                    </Box>
                )}
            </div>
        </ThemeProvider>
    );
};
  
export default MeetingRooms;  