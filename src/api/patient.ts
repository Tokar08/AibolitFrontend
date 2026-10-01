import axios from "axios";

export const fetchPatientDetails = async (patientId: string, token: string): Promise<any> => {
    try {
        console.log("Виконання запиту до API (дані пацієнта):", {
            endpoint: `/api/Patient/${patientId}`,
            headers: { Authorization: `Bearer ${token}` },
        });

        const response = await axios.get(`/api/Patient/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Результат запиту (дані пацієнта):", response.data);

        return response.data;
    } catch (error: any) {
        console.error("Помилка завантаження даних пацієнта:", error.response?.data || error.message);
        throw error;
    }
};


export const fetchPatientPrescriptions = async (
    patientId: string,
    token: string,
    params?: any
): Promise<any[]> => {
    try {
        const response = await axios.get(`/api/Patient/${patientId}/prescriptions`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });
        return response.data;
    } catch (error: any) {
        console.error("Ошибка получения рецептов пациента:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchPatientRecommendations = async (
    patientId: string,
    token: string,
    params?: any
): Promise<any[]> => {
    try {
        const response = await axios.get(`/api/Patient/${patientId}/recommendations`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });
        return response.data;
    } catch (error: any) {
        console.error("Ошибка получения рекомендаций пациента:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchRecommendationDetailsByPatient = async (
    patientId: string,
    recommendationId: string,
    token: string
): Promise<any> => {
    try {
        const response = await axios.get(`/api/Patient/${patientId}/recommendations/${recommendationId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error("Ошибка получения деталей рекомендации:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchPrescriptionDetailsByPatient = async (
    patientId: string,
    prescriptionId: string,
    token: string
): Promise<any> => {
    try {
        const response = await axios.get(`/api/Patient/${patientId}/prescriptions/${prescriptionId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error("Ошибка получения деталей рецепта:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchAllDoctors = async (
    token: string,
    params: {
        SearchTerm?: string;
        SpecializationTitle?: string;
        HospitalTitle?: string;
        Gender?: string;
        MinYearsOfExperience?: number;
        MaxYearsOfExperience?: number;
        page?: number;
        size?: number;
    } = {}
): Promise<{ items: any[]; total: number }> => {
    try {
        const response = await axios.get(`/api/Patient/doctors`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });
        return { items: response.data.items || response.data, total: response.data.total || response.data.length };
    } catch (error: any) {
        console.error("Ошибка загрузки списка докторов:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchFavorites = async (patientId: string, token: string): Promise<any[]> => {
    try {
        const response = await axios.get(`/api/Patient/${patientId}/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки избранных врачей:", error.response?.data || error.message);
        throw error;
    }
};

export const toggleFavoriteDoctor = async (patientId: string, doctorId: string, token: string): Promise<void> => {
    try {
        await axios.post(`/api/Patient/${patientId}/favorite/${doctorId}`, null, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error: any) {
        console.error("Ошибка добавления врача в избранное:", error.response?.data || error.message);
        throw error;
    }
};

export const removeFavoriteDoctor = async (patientId: string, doctorId: string, token: string): Promise<void> => {
    try {
        await axios.delete(`/api/Patient/${patientId}/favorites/${doctorId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error: any) {
        console.error("Помилка видалення лікаря з обраного:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchPatientAppointments = async (
    doctorId: string,
    token: string,
    params: { MinDate?: string; MaxDate?: string; SortByDescending?: boolean; page?: number; size?: number; onlyActive?: boolean }
) => {
    try {
        const response = await axios.get(`/api/Patient/${doctorId}/appointments`, {
            params,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error : any) {
        console.error("Ошибка получения записей:", error.response?.data || error.message);
        throw error;
    }
};

export const cancelPatientAppointment = async (
    patientId: string,
    appointmentId: string,
    token: string
) => {
    try {
        await axios.delete(`/api/Patient/${patientId}/appointments/${appointmentId}/cancel`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error("Ошибка при отмене записи пациентом:", error);
        throw error;
    }
};

export const bookAppointment = async (
    doctorId: string,
    patientId: string,
    token: string,
    appointmentDate: string
): Promise<void> => {
    try {
        const url = `/api/Patient/${doctorId}/appointments`;
        const params = {
            patientId,
            appointmentDate,
        };
        await axios.post(url, null, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            params,
        });
        console.log("Запись успешно создана");
    } catch (error: any) {
        console.error("Ошибка создания записи:", error.response?.data || error.message);
        throw new Error("Failed to book appointment");
    }
};