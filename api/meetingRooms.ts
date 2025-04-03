import { MeetingRoom, PaginatedResponse, FullMeetingRoom } from "../types";

interface Filters {
    officeId?: number;
    name?: string;
    isActive?: boolean;
    canAccess?: boolean;
    page?: number;
    limit?: number;
}


export const fetchMeetingRooms = async (filters: Filters = {}): Promise<PaginatedResponse<MeetingRoom>> => {
    try {
      const queryParams = new URLSearchParams();
  
      if (filters.officeId) queryParams.append("office_id", filters.officeId.toString());
      if (filters.name) queryParams.append("name", filters.name);
      if (filters.isActive !== undefined) queryParams.append("is_active", filters.isActive.toString());
      if (filters.canAccess !== undefined) queryParams.append("can_access", filters.canAccess.toString());
      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
  
      const url = `http://127.0.0.1:8000/api/meeting-room?${queryParams.toString()}`;
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
  
      const data: PaginatedResponse<MeetingRoom> = await response.json();
      return data;
    } catch (error) {
      console.error("Ошибка при запросе комнат:", error);
      throw error;
    }
};

export const fetchMeetingRoomById = async (id: number): Promise<FullMeetingRoom> => {
  try {
    const url = `http://127.0.0.1:8000/api/meeting-room/${id}`;
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

    const data: FullMeetingRoom = await response.json();
    return data;
  } catch (error) {
    console.error("Ошибка при запросе комнат:", error);
    throw error;
  }
}