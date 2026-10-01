import axios from "axios";

export const fetchStatistics = async (hospitalId: string, token: string) => {
    console.warn("Token from statistic:" + token);
    try {
        const response = await axios.get(`/api/Statistics`, {
            params: { id: hospitalId },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки статистики:", error);
        throw error;
    }
};
