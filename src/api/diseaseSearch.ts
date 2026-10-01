import axios from "axios";

export const searchDisease = async (term: string, provider: "openai" | "external",  token: string) => {
    console.warn("Token from diseaseSearch: " + token);
    const response = await axios.get(
        `https://localhost:44321/api/DiseaseSearch/search`,
        {
            params: { term, provider },
            headers: {
                Authorization: `Bearer ${token}`
            },
        }
    );
    return response.data;
};
