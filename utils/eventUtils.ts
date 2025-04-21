import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Event } from '../types'

interface CurrentEvent {
  id: number;
  date: Dayjs;
  timeStart: Dayjs;
  timeEnd: Dayjs;
  idRoom: number;
}

export function hasOverlap(currentEvent: CurrentEvent, apiEvents: Event[]): boolean {
  const currentStart = currentEvent.timeStart;
  const currentEnd = currentEvent.timeEnd;
  const currentRoomId = currentEvent.idRoom;

  return apiEvents.some((apiEvent) => {
    const apiStart = dayjs(`${apiEvent.date} ${apiEvent.timeStart}`, 'YYYY-MM-DD HH:mm:ss');
    const apiEnd = dayjs(`${apiEvent.date} ${apiEvent.timeEnd}`, 'YYYY-MM-DD HH:mm:ss');
    const apiRoomId = apiEvent.meetingRoomId;

    const overlap =
      currentRoomId === apiRoomId &&
      currentStart.isBefore(apiEnd) &&
      currentEnd.isAfter(apiStart);

    return overlap;
  });
}

interface EventPosition {
    left: number;
    width: number; 
}

export function calculateEventPosition (
    timeStart: string,
    timeEnd: string,
    timelineWidth: number
  ): EventPosition {
    const start = dayjs(`2024-01-01 ${timeStart}`, 'YYYY-MM-DD HH:mm:ss');
    const end = dayjs(`2024-01-01 ${timeEnd}`, 'YYYY-MM-DD HH:mm:ss');
  
    // Учитываем отступы (10px слева и справа)
    const effectiveWidth = timelineWidth - 20;
  
    // Общая длительность шкалы в минутах (16 часов = 960 минут)
    const totalMinutes = 960;
  
    // Ширина одной минуты в пикселях
    const minuteWidth = effectiveWidth / totalMinutes;
  
    // Начало шкалы — 6:00, вычитаем 360 минут (6 часов) для "нулевой" точки
    const startOfDay = start.startOf('day').add(6, 'hour'); // 6:00
  
    // Разница в минутах от начала шкалы (6:00)
    const startMinutes = start.diff(startOfDay, 'minute');
    const endMinutes = end.diff(startOfDay, 'minute');
  
    // Позиция и ширина в пикселях
    const left = startMinutes * minuteWidth + 10; // +10 для отступа слева
    const width = (endMinutes - startMinutes) * minuteWidth;
  
    return {
      left: Math.max(left, 10), // Не меньше отступа слева
      width: Math.max(width, 0), // Ширина не отрицательная
    };
  }