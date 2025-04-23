import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { fetchEvents } from '../api/events';
import { Event } from '../types'
import { useNotification } from '../context/NotificationContext';
import dayjs, { Dayjs } from 'dayjs';
import { hasOverlap } from '../utils/eventUtils';
import { calculateEventPosition } from '../utils/eventUtils';

interface CurrentEvent {
  id: number;
  date: Dayjs;
  timeStart: Dayjs;
  timeEnd: Dayjs;
  idRoom: number;
}

const colors = [
    'rgba(50, 193, 255, 0.7)',
    'rgba(50, 67, 255, 0.7)',
    'rgba(50, 122, 255, 0.7)',
    'rgba(42, 200, 71, 0.7)',
];

const timeMarks = ['6:00', '10:00', '14:00', '18:00', '22:00'];

interface MeetingRoomTimelineProps {
  date: string;
  roomId: number;
  currentEvent: CurrentEvent;
  onOverlapCheck: (overlap: boolean) => void; 
}

const MeetingRoomTimeline: React.FC<MeetingRoomTimelineProps> = ({
  date,
  roomId,
  currentEvent,
  onOverlapCheck,
}) => {

  const { showNotification } = useNotification()

  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [timelineWidth, setTimelineWidth] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isElementLoaded, setIsElementLoaded] = useState<boolean>(false);

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const filters = {
          roomId: roomId,
          date: date,
          descOrder: false,
          page: 1,
          limit: 999,
      };
      const data = await fetchEvents(filters);
      setEvents(data);
    } catch (err) {
        showNotification(
            "Не удалось загрузить мероприятия",
            'error'
        );
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [date, roomId]);


  useEffect(() => {
    const checkElementLoaded = () => {
      if (timelineRef.current) {
        const width = timelineRef.current.getBoundingClientRect().width;
        if (width > 0) {
          setTimelineWidth(width);
          setIsElementLoaded(true); 
        }
      } 
    };

    checkElementLoaded();

    if (!isElementLoaded) {
      const interval = setInterval(checkElementLoaded, 100); 
      return () => clearInterval(interval);
    }

    const handleResize = () => {
      checkElementLoaded();
    };
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [isElementLoaded]);

  useEffect(() => {
    const overlap = hasOverlap(currentEvent, events);
    onOverlapCheck(overlap); 
  }, [currentEvent, events, onOverlapCheck]);

  if (eventsLoading) {
    return <Typography align="center">Загрузка...</Typography>
  }

  return (
    
    <Box ref={timelineRef} sx={{ position: "relative", height: "100%", width: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box //ось
        sx={{
          position: "absolute",
          bottom: "40px",
          width: "100%",
          height: "4px",
          backgroundColor: "#333333",
          zIndex: 0, 
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          position: "absolute",
          bottom: 0,
          width: "100%",
        }}
      >
        {timeMarks.map((mark, index) => (
            <Typography key={index} variant="caption">{mark}</Typography> //метки времени
        ))}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          position: "absolute",
          bottom: 0,
          width: "calc(100% - 10px * 2)",
          top: '58.5px',
          zIndex: 10,
        }}
      >
        {timeMarks.map((mark, index) => (
            <Box //черточки
            key={index}
            sx={{
              width: "4px",
              height: "14px",
              backgroundColor: "#333333",
            }}
          />
        ))}
      </Box>

      <Box sx={{display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end', width: '100%'}}>
        <Box sx={{width: '10px', height: '10px', backgroundColor: 'rgba(149, 50, 255, 0.7)'}}/>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Ваше мероприятие</Typography>
      </Box>

      {isElementLoaded && events
      .filter((event) => {
        const startHour = parseInt(event.timeStart.slice(0, 2));
        const endHour = parseInt(event.timeEnd.slice(0, 2));
        return startHour >= 6 && endHour <= 22;
      })
      .map((event, index) => {
        const { left, width } = calculateEventPosition(event.timeStart, event.timeEnd, timelineWidth);
        const colorIndex = index % colors.length;

        return (
          <Tooltip
            key={`${event.id}-${event.date}`}
            title={
              <Box>
                <Typography variant="body2">{event.name}</Typography>
                <Typography variant="body2">{`${event.timeStart.slice(0, 5)} - ${event.timeEnd.slice(0, 5)}`}</Typography>
              </Box>
            }
            arrow
          >
            <Box
              key={`${event.id}-${event.date}`}
              sx={{
                position: "absolute",
                left,
                width,
                height: "20px",
                backgroundColor: `${colors[colorIndex]}`,
                bottom: "calc(50% - 10px)", 
                transition: "height 0.2s ease-in-out",
                zIndex: 1,
                "&:hover": {
                  height: "25px",
                },
              }}
            />
          </Tooltip>
        );
      })}
      
      {isElementLoaded && (<Tooltip
        title={
          <Box>
            <Typography variant="body2">Текущее мероприятие</Typography>
            <Typography variant="body2">{`${currentEvent.timeStart.format('HH:mm')} - ${currentEvent.timeEnd.format('HH:mm')}`}</Typography>
          </Box>
        }
        arrow
        >
            <Box
              sx={{
                position: "absolute",
                left: `${calculateEventPosition(currentEvent.timeStart.format('HH:mm:ss'), currentEvent.timeEnd.format('HH:mm:ss'), timelineWidth).left}px`,
                width: `${calculateEventPosition(currentEvent.timeStart.format('HH:mm:ss'), currentEvent.timeEnd.format('HH:mm:ss'), timelineWidth).width}px`,
                height: "20px",
                backgroundColor: 'rgba(149, 50, 255, 0.7)',
                bottom: "calc(50% - 10px)", 
                transition: "height 0.2s ease-in-out",
                zIndex: 1,
                "&:hover": {
                  height: "25px",
                },
              }}
            />
        </Tooltip>)}
    </Box>
  );
};

export default MeetingRoomTimeline;