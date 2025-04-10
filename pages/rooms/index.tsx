import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, Button, ThemeProvider, useMediaQuery, Stack, Pagination } from "@mui/material";

import theme from '../../styles/theme';
import { MeetingRoom, Office } from "../../types";
import { fetchMeetingRooms } from "../../api/meetingRooms";
import { fetchOffices } from "../../api/offices";
import { useNavigate } from "react-router-dom";
import { useNotification } from '../../context/NotificationContext';


  
const MeetingRooms = () => {

    const isLaptop = useMediaQuery("(max-width:1440px)");
    const isLaptop2 = useMediaQuery("(max-width:1560px)");
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
    const [officeId, setOfficeId] = useState<number | "">("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

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
              isActive: activeButton === "Активные" ? true : undefined,
              canAccess: accessibleButton === "Доступные мне" ? true : undefined,
              page,
              limit,
            };
            const data = await fetchMeetingRooms(filters);
            setRooms(data.data); 
            setRoomsAmount(data.total[0]);
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
            <div>

                {/* Фильтрация */}
                <Box sx={{ display: "flex", alignItems: isLaptop2 ? "stetch" : "center", justifyContent: "space-between", marginBottom: "1em", flexDirection: isLaptop2 ? "column" : "row", gap: 1 }}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: isMobile ? "flex-end" : "flex-start" }} >
                        <Typography variant='h5' sx={{ whiteSpace: "nowrap" }}>Переговорные комнаты</Typography>
                        <Typography sx={{ color: "#A3A3A3" }}>
                            {loading ? (0) : error ? (0) : (roomsAmount)}
                        </Typography>
                    </Box>
                    <Box sx={{ display:"flex", gap: 2, flexDirection: isTablet ? "column" : "row" }}>
                        <Box sx={{ display:"flex", gap: 2, width: "100%", flexDirection: isMobile ? "column" : "row" }}>
                            <TextField
                                variant="outlined"
                                placeholder="Название комнаты"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                sx={{ width: isLaptop2 ? "100%" : "230px"}}
                            />
                            <Select
                                value={officeId}
                                onChange={(e) => setOfficeId(e.target.value as number | "" )}
                                displayEmpty
                                sx={{ width: isLaptop2 ? "100%" : "230px"}}
                                >
                                    <MenuItem value="">Все офисы</MenuItem>
                                    {offices.map((office) => (
                                        <MenuItem key={office.id} value={office.id}>
                                        {office.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </Box>
                        <Box sx={{ display:"flex", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
                            <Stack direction="row" sx={{ width: "100%" }}>
                                <Button 
                                    variant={activeButton === "Все" ? "contained" : "outlined"} 
                                    color={activeButton === "Все" ? "success" : "secondary"}
                                    onClick={() => setActiveButton("Все")} 
                                    sx={{
                                        flex: isTablet ? 1 : "auto",
                                        width: isTablet ? "100%" : "auto",
                                        border: "1px solid",
                                        borderColor: activeButton === "Все" ? "success.main" : "secondary.main",
                                        boxShadow: activeButton === "Все" ? "none" : undefined,
                                        "&:hover": {
                                            boxShadow: "none",
                                        }
                                    }}>Все
                                </Button>
                                <Button 
                                    variant={activeButton === "Активные" ? "contained" : "outlined"} 
                                    color={activeButton === "Активные" ? "success" : "secondary"}
                                    onClick={() => setActiveButton("Активные")} 
                                    sx={{
                                        flex: isTablet ? 1 : "auto",
                                        width: isTablet ? "100%" : "auto",
                                        border: "1px solid",
                                        borderColor: activeButton === "Активные" ? "success.main" : "secondary.main",
                                        boxShadow: activeButton === "Активные" ? "none" : undefined,
                                        "&:hover": {
                                            boxShadow: "none",
                                        }
                                    }}>Активные
                                </Button>
                            </Stack>
                            <Box sx={{ display: "flex", width: "100%" }}>
                                <Button 
                                    variant={accessibleButton === "Все" ? "contained" : "outlined"} 
                                    color={accessibleButton === "Все" ? "success" : "secondary"}
                                    onClick={() => setAccessibleButton("Все")} 
                                    sx={{
                                        flex: isTablet ? 1 : "auto",
                                        border: "1px solid",
                                        borderColor: accessibleButton === "Все" ? "success.main" : "secondary.main",
                                        boxShadow: accessibleButton === "Все" ? "none" : undefined,
                                        "&:hover": {
                                            boxShadow: "none",
                                        }
                                    }}>Все
                                </Button>
                                <Button 
                                    variant={accessibleButton === "Доступные мне" ? "contained" : "outlined"} 
                                    color={accessibleButton === "Доступные мне" ? "success" : "secondary"}
                                    onClick={() => setAccessibleButton("Доступные мне")} 
                                    sx={{
                                        flex: isTablet ? 1 : "auto",
                                        border: "1px solid",
                                        borderColor: accessibleButton === "Доступные мне" ? "success.main" : "secondary.main",
                                        boxShadow: accessibleButton === "Доступные мне" ? "none" : undefined,
                                        "&:hover": {
                                            boxShadow: "none",
                                        },
                                        whiteSpace: "nowrap"
                                    }}>Доступные мне
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                
                {/* Таблица */}
                <TableContainer component={Paper}>
                    <Table>
                    <TableHead color="secondary">
                        <TableRow>
                            <TableCell>Наименование</TableCell>
                            <TableCell>Офис</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Доступность</TableCell>
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
                                        backgroundColor: "#f5f5f5" 
                                    } 
                                }}
                                >
                                <TableCell>{room.name}</TableCell>
                                <TableCell>{room.office.name}</TableCell>
                                <TableCell>{room.status}</TableCell>
                                <TableCell>{room.isPublic ? "Публичная" : "Приватная"}</TableCell>
                                <TableCell>{room.size}</TableCell>
                            </TableRow>
                            ))
                        )}
                    </TableBody>
                    </Table>
                </TableContainer>
                {5 > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={5}
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