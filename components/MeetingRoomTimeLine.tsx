import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

// Интерфейс для мероприятий
interface Event {
  id: number;
  name: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  idRoom: number;
}


const colors = [
    'rgba(50, 193, 255, 0.7)',
    'rgba(50, 67, 255, 0.7)',
    'rgba(50, 122, 255, 0.7)',
    'rgba(42, 200, 71, 0.7)',
];

let colorsCount = 0;

const timeMarks = ['6:00', '10:00', '14:00', '18:00', '22:00'];

const MeetingRoomTimeline: React.FC<{ events: Event[], currentEvent: Event }> = ({ events, currentEvent }) => {

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const totalMinutes = timeToMinutes('22:00') - timeToMinutes('6:00');

  return (
    <Box sx={{ position: "relative", height: "100%", width: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
          <Box
            key={index}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Box //черточки
              sx={{
                width: "4px",
                height: "14px",
                backgroundColor: "#333333",
                position: "absolute",
                zIndex: 10,
                top: "-29px", // смещение вверх от оси
              }}
            />
            <Typography variant="caption">{mark}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end'}}>
        <Box sx={{width: '10px', height: '10px', backgroundColor: 'rgba(149, 50, 255, 0.7)'}}/>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Ваше мероприятие</Typography>
      </Box>

      {events.map((event) => {
        if (colorsCount > colors.length) colorsCount = 0;
        const startMinutes = timeToMinutes(event.timeStart) - timeToMinutes("6:00");
        const endMinutes = timeToMinutes(event.timeEnd) - timeToMinutes("6:00");
        const left = (startMinutes / totalMinutes) * 100 + "%"; 
        const width = ((endMinutes - startMinutes) / totalMinutes) * 100 + "%"; 

        return (
          <Tooltip
            key={event.id}
            title={
              <Box>
                <Typography variant="body2">{event.name}</Typography>
                <Typography variant="body2">{`${event.timeStart} - ${event.timeEnd}`}</Typography>
              </Box>
            }
            arrow
          >
            <Box
              sx={{
                position: "absolute",
                left,
                width,
                height: "20px",
                backgroundColor: `${colors[colorsCount++]}`,
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
      <Tooltip
        title={
          <Box>
            <Typography variant="body2">Текущее мероприятие</Typography>
            <Typography variant="body2">{`${currentEvent.timeStart} - ${currentEvent.timeEnd}`}</Typography>
          </Box>
        }
        arrow
        >
            <Box
              sx={{
                position: "absolute",
                left: `${((timeToMinutes(currentEvent.timeStart) - timeToMinutes("6:00")) / totalMinutes) * 100}%`,
                width: `${(((timeToMinutes(currentEvent.timeEnd) - timeToMinutes("6:00")) - (timeToMinutes(currentEvent.timeStart) - timeToMinutes("6:00"))) / totalMinutes) * 100}%`,
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
        </Tooltip>
    </Box>
  );
};

export default MeetingRoomTimeline;