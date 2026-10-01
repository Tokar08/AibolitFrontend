import axios from "axios";

export const fetchHospitalDetails = async (hospitalId: string, token: string): Promise<any> => {
    try {
        const response = await axios.get(`/api/Hospital/${hospitalId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки данных больницы:", error.response?.data || error.message);
        throw error;
    }
};
