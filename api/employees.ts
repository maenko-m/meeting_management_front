import { Employee } from "../types";

export interface UpdateEmployeeData {
  organizationId?: number | null;
  name: string | null;
  surname: string | null;
  patronymic: string | null;
  email: string | null;
  password: string | null;
}

export const fetchEmployees = async (): Promise<Employee[]> => {
  const response = await fetch("http://127.0.0.1:8000/api/employee", {
    method: "GET",
    headers: { 
        "Content-Type": "application/json",
        "jwt": `${localStorage.getItem("jwt")}`,
    },
  });

  if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
  return response.json();
};

export const updateEmployee = async (id: number, data: UpdateEmployeeData): Promise<void> => {
  const token = localStorage.getItem('jwt');
  const response = await fetch(`http://127.0.0.1:8000/api/employee/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'jwt': `${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Ошибка обновления данных');
  }
};