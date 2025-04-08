import { Employee, FullEmployee } from "../types";


interface LoginCredentials {
    email: string;
    password: string;
}
  
interface LoginResponse {
    token: string;
}
  
export const login = async (credentials: LoginCredentials): Promise<string> => {
    const response = await fetch('http://127.0.0.1:8000/api/login_check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error('Неверные данные');
    }
  
    const data: LoginResponse = await response.json();
    const token = data.token;
  
    if (!token) {
      throw new Error('Токен не получен');
    }
  
    return token;
};

export const getCurrentUser = async (): Promise<FullEmployee | null> => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      return null;
    }
  
    const response = await fetch('http://127.0.0.1:8000/api/employee/self', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'jwt': `${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Ошибка получения данных пользователя');
    }
  
    return response.json();
  };