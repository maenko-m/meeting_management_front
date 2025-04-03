import { Office } from "../types";

export const fetchOffices = async (): Promise<Office[]> => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/office", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "jwt": `${localStorage.getItem("jwt")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const data: Office[] = await response.json();
    return data;
  } catch (error) {
    console.error("Ошибка при запросе офисов:", error);
    throw error;
  }
}