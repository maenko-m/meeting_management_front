import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Select, MenuItem, Button, ThemeProvider } from "@mui/material";
import '../../styles/global.css';
import theme from '../../styles/theme';
import { MeetingRoom, Office } from "../../types";
import { fetchMeetingRooms } from "../../api/meetingRooms";
import { fetchOffices } from "../../api/offices";
import { useNavigate } from "react-router-dom";


  
const MeetingRooms = () => {
   
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

    const handleRowClick = (id: number) => {
        router.push(`/roomcard/${id}`);
    };

    useEffect(() => {
        const loadOffices = async () => {
          try {
            const data = await fetchOffices();
            setOffices(data);
          } catch (err) {
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
            setError("Не удалось загрузить список комнат");
          } finally {
            setLoading(false);
          }
        };
    
        loadRooms();
    }, [nameFilter, officeId, activeButton, accessibleButton, page, limit]);

    return (
        <ThemeProvider theme={theme}>
            <div style={{ width: "96%", padding: "4vh 2%", paddingLeft: "0" }}>

                {/* Фильтрация */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1em" }}>
                    <Box sx={{ display: "flex", gap: 1 }} >
                        <Typography variant='h5'>Переговорные комнаты</Typography>
                        <Typography sx={{ color: "#A3A3A3" }}>
                            {loading ? (0) : error ? (0) : (roomsAmount)}
                        </Typography>
                    </Box>
                    <Box sx={{ display:"flex", alignItems: "center", gap: 2 }}>
                        <TextField
                            variant="outlined"
                            placeholder="Название комнаты"
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            sx={{ width: "270px" }}
                        />
                        <Select
                            value={officeId}
                            onChange={(e) => setOfficeId(e.target.value as number | "")}
                            displayEmpty
                            sx={{ width: "270px" }}
                            >
                            <MenuItem value="">Все офисы</MenuItem>
                            {offices.map((office) => (
                                <MenuItem key={office.id} value={office.id}>
                                {office.name}
                                </MenuItem>
                            ))}
                        </Select>
                        <Box>
                            <Button 
                                variant={activeButton === "Все" ? "contained" : "outlined"} 
                                color={activeButton === "Все" ? "success" : "secondary"}
                                onClick={() => setActiveButton("Все")} >Все
                            </Button>
                            <Button 
                                variant={activeButton === "Активные" ? "contained" : "outlined"} 
                                color={activeButton === "Активные" ? "success" : "secondary"}
                                onClick={() => setActiveButton("Активные")} >Активные
                            </Button>
                        </Box>
                        <Box>
                            <Button 
                                variant={accessibleButton === "Все" ? "contained" : "outlined"} 
                                color={accessibleButton === "Все" ? "success" : "secondary"}
                                onClick={() => setAccessibleButton("Все")} >Все
                            </Button>
                            <Button 
                                variant={accessibleButton === "Доступные мне" ? "contained" : "outlined"} 
                                color={accessibleButton === "Доступные мне" ? "success" : "secondary"}
                                onClick={() => setAccessibleButton("Доступные мне")} >Доступные мне
                            </Button>
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
                            <TableCell>Емкость, чел.</TableCell>
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
                                        backgroundColor: "grey.200" 
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
            </div>
        </ThemeProvider>
    );
};
  
export default MeetingRooms;  