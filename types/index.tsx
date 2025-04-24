export interface Organization {
  id: number;
  name: string;
  status: "активный" | "неактивный";
}

export interface Office {
  id: number;
  name: string;
  city: string;
  time_zone: number;
  organization: Organization;
  timeZone: number;
}
  

export interface MeetingRoom {
  id: number;
  name: string;
  size: number;
  status: "активный" | "неактивный";
  office: Office;
  access: boolean;
  isPublic: boolean;
  employees: Employee[];
  occupied: boolean;
}
  
export interface FullMeetingRoom extends MeetingRoom {
  description: string;
  calendarCode: string;
  photoPath: string[];
}
  
export interface Employee {
  id: number;
  email: string;
  fullName: string;
  organization: Organization; 
}

export interface FullEmployee {
  id: number;
  email: string;
  name: string;
  surname: string;
  patronymic: string;
  roles: string[];
}

export interface Event {
  id: number;
  name: string;
  description: string;
  date: string; 
  author: Employee;
  employees: Employee[];
  timeStart: string; 
  timeEnd: string;
  meetingRoomName: string;
  meetingRoomId: number;
  recurrenceTypeValue?: string;
  recurrenceInterval?: number;
  recurrenceEnd?: string;
  recurrenceParent?: Event;
  originalDate?: string
}

export interface EventCreate {
  name: string;
  description: string;
  date: string; 
  authorId: number;
  employeeIds: number[];
  timeStart: string; 
  timeEnd: string; 
  meetingRoomId: number;
  recurrenceType?: string;
  recurrenceInterval?: number;
  recurrenceEnd?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  counts?: Counts;
}

interface PaginationMeta {
  total: number;
  page: number; 
  limit: number; 
  totalPages: number;
}

interface Counts {
  author: number; // Количество событий, где пользователь — автор
  member: number; // Количество событий, где пользователь — участник
}