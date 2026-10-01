import axios from "axios";

export const fetchAllWorkSchedules = async (token: string): Promise<any[]> => {
    const response = await axios.get("/api/WorkSchedule", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, size: 1000 },
    });
    return response.data;
};


export const createWorkSchedule = async (
    schedule: { dayOfWeek: number; startTime: string; endTime: string },
    token: string
): Promise<any> => {
    const response = await axios.post("/api/WorkSchedule", schedule, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const updateWorkSchedule = async (
    id: string,
    updatedData: any,
    token: string
): Promise<any> => {
    try {
        const response = await axios.put(`/api/WorkSchedule/${id}`, updatedData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error : any) {
        console.error("Ошибка обновления:", error.response?.data);
        console.error("Update error:", error.response);
        throw error;
    }
};

export const fetchWorkScheduleById = async (
    id: string,
    token: string
): Promise<any> => {
    const response = await axios.get(`/api/WorkSchedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};





export const deleteWorkSchedule = async (
    id: string,
    token: string
): Promise<void> => {
    await axios.delete(`/api/WorkSchedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};