import { Event } from "../types"; 
import { addDays, addWeeks, addMonths, addYears, isAfter, parseISO, format } from "date-fns";


const MAX_GENERATION_YEARS = 2; //предел расчета повторов

const recurrenceMap = {
    day: addDays,
    week: addWeeks,
    month: addMonths,
    year: addYears,
  } as const;
  
  export function generateRecurringEvents(events: Event[]): Event[] {
    const today = new Date();
    const generationLimit = addMonths(today, MAX_GENERATION_YEARS * 12);
  
    const result: Event[] = [];
  
    for (const event of events) {
      if (event.recurrenceParent) continue; // пропуск мероприятия, созданного сервером для уведомлений

      result.push(event); // оригинал добавляем всегда
  
      const { recurrenceTypeValue, recurrenceInterval = 1, recurrenceEnd } = event;
  
      if (!recurrenceTypeValue || !(recurrenceTypeValue in recurrenceMap)) continue;
  
      const recurrenceFn = recurrenceMap[recurrenceTypeValue];
      const recurrenceEndDate = recurrenceEnd ? parseISO(recurrenceEnd) : generationLimit;
  
      let nextDate = recurrenceFn(parseISO(event.date), recurrenceInterval);
  
      while (!isAfter(nextDate, recurrenceEndDate) && !isAfter(nextDate, generationLimit)) {
        const instance: Event = {
          ...event,
          id: event.id,
          date: format(nextDate, 'yyyy-MM-dd'),
          recurrenceParent: event,
          originalDate: event.date
        };
  
        result.push(instance);
        nextDate = recurrenceFn(nextDate, recurrenceInterval);
      }
    }
  
    return result;
  }