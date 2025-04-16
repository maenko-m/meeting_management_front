import { Event, EventCreate, PaginatedResponse } from "../types";

interface EventFilters {
  roomId?: number;
  name?: string;
  type?: string;
  descOrder?: boolean;
  date?: string;
  officeId?: number;
  isArchived?: string;
  page?: number;
  limit?: number;
}

export const fetchEvents = async (filters: EventFilters = {}): Promise<PaginatedResponse<Event>> => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.roomId) queryParams.append("room_id", filters.roomId.toString());
    if (filters.name) queryParams.append("name", filters.name);
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.date) queryParams.append("date", filters.date);
    if (filters.officeId) queryParams.append("office_id", filters.officeId.toString());
    if (filters.isArchived) queryParams.append("archived", filters.isArchived);
    if (filters.descOrder !== undefined) queryParams.append("desc_order", filters.descOrder.toString());
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const url = `http://127.0.0.1:8000/api/event?${queryParams.toString()}`;
    console.log("Запрос:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "jwt": `${localStorage.getItem("jwt")}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка: ${response.status} - ${errorText}`);
    }

    const data: PaginatedResponse<Event> = await response.json();

    const convertedData: PaginatedResponse<Event> = {
      ...data,
      data: data.data.map((event) => {
        const dateTimeStart = new Date(`${event.date}T${event.timeStart}Z`);
        const dateTimeEnd = new Date(`${event.date}T${event.timeEnd}Z`);

        const formatTime = (date: Date): string => {
          return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).replace(/,/g, '');
        };

        return {
          ...event,
          timeStart: formatTime(dateTimeStart),
          timeEnd: formatTime(dateTimeEnd),
        };
      }),
    };

    return convertedData;
  } catch (error) {
    console.error("Ошибка при запросе мероприятий:", error);
    throw error;
  }
};

export const createEvent = async (event: EventCreate): Promise<{success: boolean, id: number }> => {
  const response = await fetch("http://127.0.0.1:8000/api/event", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "jwt": `${localStorage.getItem("jwt")}`,
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) throw new Error(`Ошибка создания: ${response.status}`);
  return await response.json();
};

export const updateEvent = async (id: number, event: EventCreate): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:8000/api/event/${id}`, {
    method: "PATCH",
    headers: { 
      "Content-Type": "application/json",
      "jwt": `${localStorage.getItem("jwt")}`,
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) throw new Error(`Ошибка обновления: ${response.status}`);
};

export const deleteEvent = async (id: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:8000/api/event/${id}`, {
    method: "DELETE",
    headers: { 
      "Content-Type": "application/json",
      "jwt": `${localStorage.getItem("jwt")}`,
    },
  });

  if (!response.ok) throw new Error(`Ошибка удаления: ${response.status}`);
};