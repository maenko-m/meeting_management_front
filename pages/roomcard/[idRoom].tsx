import {
    Typography, 
    Button, 
    ThemeProvider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    IconButton,
    Box, 
    useMediaQuery
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { KeyboardArrowUp, KeyboardArrowDown  } from "@mui/icons-material";
import React, { useRef, useState, useEffect } from "react";

import theme from '../../styles/theme';
import { motion } from "framer-motion";
import { useRouter } from 'next/router';
import { FullMeetingRoom } from "../../types";
import { fetchMeetingRoomById } from "../../api/meetingRooms";
import Events from "../events";
import { useAuth } from "../../context/AuthContext";
import EventsAdmin from "../eventsadmin";
import { useNotification } from '../../context/NotificationContext';

const MeetingRoomCard = () => {
    const isMobile = useMediaQuery("(max-width:600px)");    

    const [meetingRoom, setMeetingRoom] = useState<FullMeetingRoom>();
    const [loadingRoom, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { idRoom  } = router.query;

    const { loading, hasRole } = useAuth();
    const { showNotification } = useNotification()
    
    const [selectedImage, setSelectedImage] = useState<string>();

    const handleImageClick = (photoPath: string) => {
        setSelectedImage(photoPath);
    };

    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchMove, setTouchMove] = useState<number | null>(null);
    const [offset, setOffset] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);

    const getSliderWidth = () => {
        return sliderRef.current?.offsetWidth || 0;
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : meetingRoom!.photoPath.length - 1));
        setOffset(0);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < meetingRoom!.photoPath.length - 1 ? prev + 1 : 0));
        setOffset(0); 
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart !== null) {
            const currentX = e.touches[0].clientX;
            const delta = touchStart - currentX;
            setTouchMove(currentX);
            setOffset(-delta);
        }
    };

    const handleTouchEnd = () => {
        if (touchStart !== null && touchMove !== null) {
            const deltaX = touchStart - touchMove;
            const sliderWidth = getSliderWidth();
            if (deltaX > sliderWidth * 0.3) {
                handleNext();
            } else if (deltaX < -sliderWidth * 0.3) {
                handlePrev();
            }
        }
        setTouchStart(null);
        setTouchMove(null);
        setOffset(0);
    };

    const images = meetingRoom?.photoPath ?? [];
const [visibleStartIndex, setVisibleStartIndex] = useState(0);
const visibleCount = 3;

const handleScrollUp = () => {
    setVisibleStartIndex(prev => Math.max(prev - 1, 0));
};

const handleScrollDown = () => {
    setVisibleStartIndex(prev =>
        Math.min(prev + 1, images.length - visibleCount)
    );
};

const visibleImages = images.slice(visibleStartIndex, visibleStartIndex + visibleCount);

    const translateX = -currentIndex * getSliderWidth() + offset;

    useEffect(() => {
        const loadRoom = async () => {
          if (!idRoom || typeof idRoom !== 'string') return; 
    
          try {
            setLoading(true);
            setError(null);
            const roomId = Number(idRoom);
            if (isNaN(roomId)) {
                router.push('/rooms');
            }
    
            const roomData = await fetchMeetingRoomById(roomId); 
            setMeetingRoom(roomData);
            setSelectedImage(roomData.photoPath[0])
            console.log(roomData);
          } catch (err) {
            showNotification(
                "Не удалось загрузить данные комнат",
                'error'
            );
            setError('Не удалось загрузить данные комнаты');
          } finally {
            setLoading(false);
          }
        };
    
        loadRoom();
        
    }, [idRoom]);

    if (!router.isReady) {
        return (
          <ThemeProvider theme={theme}>
            <Box sx={{ padding: '4vh 2%' }}>
              <Typography>Подготовка...</Typography>
            </Box>
          </ThemeProvider>
        );
      }
    
      if (loadingRoom) {
        return (
          <ThemeProvider theme={theme}>
            <Box sx={{ padding: '4vh 2%' }}>
              <Typography textAlign="center" >Загрузка...</Typography>
            </Box>
          </ThemeProvider>
        );
      }
    
      if (error || !meetingRoom) {
        return (
          <ThemeProvider theme={theme}>
            <Box sx={{ padding: '4vh 2%' }}>
              <Typography color="error">{error || 'Комната не найдена'}</Typography>
            </Box>
          </ThemeProvider>
        );
      }

    return(
        <div style={{width: '100%'}}> 
            <ThemeProvider theme={theme}>
                <div className="content">
                    <div className="title-container">
                        <Typography variant='h5' sx={{ padding: "12px 0", marginLeft: isMobile? "50px" : "0px" }} >Переговорная комната - {meetingRoom?.name}</Typography>
                        <Button color="secondary" sx={{backgroundColor: '#eee'}} onClick={() => {router.push('/rooms')}}>
                            К списку комнат
                        </Button>
                    </div>
                    <div className="meeting-room__info-box">
                        <div className="image-slider-box">
                            <div className="image-slider" ref={sliderRef}>
                                <div className="image-slider-items"
                                    style={{ transform: `translateX(${translateX}px)` }}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    >
                                    {meetingRoom?.photoPath.map((imageSrc, index) => (
                                        <img key={index} src={imageSrc} alt={`Thumbnail ${index + 1}`} />
                                    ))}
                                </div>
                            </div>
                            <div className="image-slider-actions">
                                    <div className="image-slider-counter">
                                        <Typography>{currentIndex + 1}</Typography>
                                        <Typography>из</Typography>
                                        <Typography>{meetingRoom?.photoPath.length}</Typography>
                                    </div>
                                    <div className="image-slider-buttons">
                                        <IconButton
                                            color="secondary"
                                            sx={{ backgroundColor: "#eee" }}
                                            onClick={handlePrev}>
                                            <ArrowBackIosNewIcon />
                                        </IconButton>
                                        <IconButton
                                            color="secondary"
                                            sx={{ backgroundColor: "#eee" }}
                                            onClick={handleNext}>
                                            <ArrowForwardIosIcon />
                                        </IconButton>
                                    </div>
                                </div>
                        </div>
                        <div className="image-selector">
                            <div className="image-selector__image-wrapper">
                                <div className="image-selector__image-list">
                                    {visibleImages.map((imageSrc, index) => (
                                        <div key={index}
                                            className={`image-selector__image-item ${
                                            selectedImage === imageSrc ? "image-selector__image-item--active" : ""}`} onClick={() => handleImageClick(imageSrc)}>
                                            <img src={imageSrc} alt={`Thumbnail ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                                {images.length > visibleCount && visibleStartIndex > 0 && (
                                    <button onClick={handleScrollUp} className="image-selector__arrow image-selector__arrow--up"><KeyboardArrowUp /></button>
                                )}
                                {images.length > visibleCount &&
                                    visibleStartIndex + visibleCount < images.length && (
                                    <button onClick={handleScrollDown} className="image-selector__arrow image-selector__arrow--down"><KeyboardArrowDown /></button>
                                )}
                            </div>
                            
                            <div className="image-selector__selected-image">
                                <motion.img
                                    key={selectedImage}
                                    src={selectedImage}
                                    alt="Selected image"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                        <div className="info-table">
                            <TableContainer component={Paper} sx={{ width: '100%'}}>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: "bold", width: "128px", backgroundColor: '#E3E3E3', padding: "0 10px"}}>
                                                <div className="table-head">
                                                    <Typography className="table-head-text">Название</Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ width: "calc(100% - 128px)", padding: "10px"}}>
                                                {meetingRoom.name}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: "bold", width: "128px", backgroundColor: '#E3E3E3', padding: "0 10px"}}>
                                                <div className="table-head">
                                                    <Typography className="table-head-text">Офис</Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ width: "calc(100% - 128px)", padding: "10px"}}>
                                                {meetingRoom.office.name}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: "bold", width: "128px", backgroundColor: '#E3E3E3', padding: "0 10px"}}>
                                                <div className="table-head">
                                                    <Typography className="table-head-text">Статус</Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ width: "calc(100% - 128px)", padding: "10px"}}>
                                                {meetingRoom.status}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: "bold", width: "128px", backgroundColor: '#E3E3E3', padding: "0 10px"}}>
                                                <div className="table-head">
                                                    <Typography className="table-head-text">Описание</Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ width: "calc(100% - 128px)", padding: "10px"}}>
                                                {meetingRoom.description}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: "bold", width: "128px", backgroundColor: '#E3E3E3', padding: "0 10px"}}>
                                                <div className="table-head">
                                                    <Typography className="table-head-text">Доступность</Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ width: "calc(100% - 128px)", padding: "10px"}}>
                                                {meetingRoom.isPublic ? 'Публичная' : 'Приватная'}
                                            </TableCell>
                                        </TableRow>
                                        {meetingRoom.isPublic === false && (
                                            <TableRow>
                                                <TableCell component="th" scope="row" sx={{ fontWeight: "bold", width: "128px", backgroundColor: '#E3E3E3', padding: "0 10px"}}>
                                                    <div className="table-head">
                                                        <Typography className="table-head-text">Сотрудники</Typography>
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ width: "calc(100% - 128px)", padding: "10px"}}>
                                                    {meetingRoom.employees.map((employee, index) => (
                                                        <span key={employee.id || index}>
                                                            {employee.fullName}
                                                            {index < meetingRoom.employees.length - 1 && <br />}
                                                        </span>
                                                    ))}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow>
                                            <TableCell component="th" scope="row" sx={{ fontWeight: "bold", width: "128px", backgroundColor: '#E3E3E3', padding: "0 10px"}}>
                                                <div className="table-head">
                                                    <Typography className="table-head-text">Емкость</Typography>
                                                </div>
                                            </TableCell>
                                            <TableCell sx={{ width: "calc(100% - 128px)", padding: "10px"}}>
                                                {meetingRoom.size}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button color={"primary"} variant={"contained"} className="book-button">
                                <img src="/images/lock.svg"/>
                                Забронировать
                            </Button>
                        </div>
                    </div>
                    {loading ? <Typography>Загрузка</Typography> : 
                        hasRole('ROLE_MODERATOR') ? (
                            <EventsAdmin disableRoomElements={true} idRoom={Number(idRoom)} />
                        ) : (
                            <Events disableRoomElements={true} idRoom={Number(idRoom)} />
                        )
                    }
                    <div className="title-container" style={{marginTop: '48px'}}>
                        <Typography variant='h5'>Календарь занятости</Typography>
                    </div>
                    <iframe className="calandar-frame" src={`https://calendar.yandex.ru/embed/week?&layer_ids=${meetingRoom?.calendarCode.replace('events-','')}&tz_id=Asia/Yekaterinburg&layer_names=Комната 213`}/>
                </div>
            </ThemeProvider>
        </div>
    );
}

const renderValue = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
      return (
        <div className="table-text-list">
            {value.map((item) => (
                <div className="table-text-list-item">
                    <Typography className="table-text-value">{item}</Typography>
                </div>
            ))}
        </div>
      );
    }
    return <Typography className="table-text-value">{value}</Typography>;
};

export default MeetingRoomCard;
