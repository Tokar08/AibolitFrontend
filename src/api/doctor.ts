import axios from "axios";

export const createDoctor = async (doctorData: any, keycloakId: string, token: string): Promise<void> => {
    try {
        await axios.post(`/api/Doctor?keycloakId=${keycloakId}`, doctorData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("Ошибка создания врача:", error.response?.data || error.message);
        throw error;
    }
};

export const createDoctorPhoto = async (formData: FormData, token: string): Promise<{ fileUrl: string }> => {
    try {
        const response = await axios.post("/api/Doctor/upload", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки фото врача:", error.response?.data || error.message);
        throw error;
    }
};



export const updateDoctorWithPhotoPath = async (
    doctorId: string,
    updatedData: any,
    token: string
): Promise<void> => {
    console.log("Исходные данные для обновления врача (до обработки):", updatedData);

    const filteredPayload = JSON.parse(
        JSON.stringify(updatedData, (key, value) => {
            if (["Patients", "LikedByPatients", "WorkSchedules"].includes(key)) return undefined;
            return value;
        })
    );

    console.log("Финальные данные для отправки врача:", filteredPayload);

    try {
        await axios.put(`/api/Doctor/${doctorId}`, filteredPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Основные данные врача успешно обновлены.");
    } catch (error: any) {
        console.error("Ошибка обновления врача:", error.response?.data || error.message);
        throw new Error("Не удалось обновить данные врача.");
    }
};



export const uploadDoctorPhoto = async (formData: FormData, token: string): Promise<string> => {
    try {
        const response = await axios.post("/api/Doctor/upload", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data.fileUrl;
    } catch (error: any) {
        console.error("Ошибка загрузки фото:", error.response?.data || error.message);
        throw new Error("Не удалось загрузить фото.");
    }
};

export const fetchDoctorsByHospital = async (
    hospitalId: string,
    page: number,
    pageSize: number,
    token: string,
    searchTerm: string = "",
    specialization: string = "",
    genders: string[] = [],
    minYearsOfExperience: number = 0,
    maxYearsOfExperience: number = 50
): Promise<{ items: any[]; total: number }> => {
    try {
        const params: any = {
            page,
            size: pageSize,
        };


        if (searchTerm) params.SearchTerm = searchTerm;
        if (specialization) params.SpecializationTitle = specialization;
        if (genders.length > 0) params.Gender = genders.join(",");
        if (minYearsOfExperience) params.MinYearsOfExperience = minYearsOfExperience;
        if (maxYearsOfExperience) params.MaxYearsOfExperience = maxYearsOfExperience;


        console.log("Формируемый запрос:", {
            url: `/api/Hospital/${hospitalId}/doctors`,
            params,
        });

        const response = await axios.get(
            `/api/Hospital/${hospitalId}/doctors`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params,
            }
        );

        console.log("Ответ API:", response.data);

        return {
            items: response.data.items || response.data,
            total: response.data.total || response.data.length,
        };
    } catch (error) {
        console.error("Ошибка загрузки докторов:", error);
        throw error;
    }
};


export const fetchDoctorDetails = async (
    doctorId: string,
    token: string
): Promise<any> => {
    try {
        const response = await axios.get(`/api/Doctor/${doctorId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(response.data);
        return response.data;
    } catch (error: any) {
        console.error("Ошибка получения деталей доктора:", error.response?.data || error.message);
        throw error;
    }
};

export const deleteDoctorById = async (doctorId: string, token: string): Promise<void> => {
    try {
        await axios.delete(`/api/Doctor/${doctorId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(`Доктор з ID ${doctorId} успішно видалений.`);
    } catch (error: any) {
        console.error(`Помилка видалення лікаря з ID ${doctorId}:`, error.response?.data || error.message);
        throw error;
    }
};

export const fetchPatientsByDoctor = async (
    doctorId: string,
    hospitalId: string,
    token: string,
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = "",
    gender: string = "",
    city: string = "",
    phoneNumber: string = "",
    minBirthDate?: string,
    maxBirthDate?: string
): Promise<{ items: any[]; total: number }> => {
    try {
        const params: any = {
            page,
            size: pageSize,
        };


        if (searchTerm) params.SearchTerm = searchTerm;
        if (gender) params.Gender = gender;
        if (city) params.City = city;
        if (phoneNumber) params.PhoneNumber = phoneNumber;
        if (minBirthDate) params.MinBirthDate = minBirthDate;
        if (maxBirthDate) params.MaxBirthDate = maxBirthDate;

        const url = `/api/Hospital/${hospitalId}/doctors/${doctorId}/patients`;

        console.log("Формируемый запрос:", { url, params });

        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params,
        });

        console.log("Ответ API (пациенты):", response.data);

        return {
            items: response.data.items || response.data,
            total: response.data.total || response.data.length,
        };
    } catch (error) {
        console.error("Ошибка загрузки пациентов:", error);
        throw error;
    }
};

export const fetchPatientDetails = async (
    doctorId: string,
    hospitalId: string,
    patientId: string,
    token: string
): Promise<any> => {
    try {
        const url = `/api/Hospital/${hospitalId}/doctors/${doctorId}/patients/${patientId}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Ответ API (пациент):", response.data);

        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки данных пациента:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchRecommendations = async (
    doctorId: string,
    patientId: string,
    token: string,
    minDate?: string,
    maxDate?: string,
    contentSearch?: string,
    sortByDescending: boolean = true
): Promise<any[]> => {
    try {
        const params: any = {
            MinDate: minDate,
            MaxDate: maxDate,
            ContentSearch: contentSearch,
            SortByDescending: sortByDescending,
        };

        const url = `/api/Doctor/${doctorId}/patients/${patientId}/recommendations`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });
        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки рекомендаций:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchPrescriptions = async (
    doctorId: string,
    patientId: string,
    token: string,
    minDate?: string,
    maxDate?: string,
    medicationName?: string,
    sortByDescending: boolean = true
): Promise<any[]> => {
    try {
        const params: any = {
            MinDate: minDate,
            MaxDate: maxDate,
            MedicationName: medicationName,
            SortByDescending: sortByDescending,
        };

        const url = `/api/Doctor/${doctorId}/patients/${patientId}/prescriptions`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });

        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки рецептов:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchRecommendationDetails = async (
    doctorId: string,
    patientId: string,
    recommendationId: string,
    token: string
): Promise<any> => {
    try {
        const url = `/api/Doctor/${doctorId}/patients/${patientId}/recommendations/${recommendationId}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Recommendation Details Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки деталей рекомендации:", error.response?.data || error.message);
        throw error;
    }
};


export const fetchPrescriptionDetails = async (
    doctorId: string,
    patientId: string,
    prescriptionId: string,
    token: string
): Promise<any> => {
    try {
        const url = `/api/Doctor/${doctorId}/patients/${patientId}/prescriptions/${prescriptionId}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Prescription Details Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки деталей рецепта:", error.response?.data || error.message);
        throw error;
    }
};

export const updateDoctorWorkSchedules = async (
    doctorId: string,
    schedulePayload: { id: string }[],
    token: string
): Promise<void> => {
    try {
        if (!schedulePayload || schedulePayload.length === 0) {
            console.warn("Нет расписаний для обновления.");
            return;
        }

        console.log("Расписания для обновления (перед отправкой):", schedulePayload);

        await axios.patch(`/api/Doctor/${doctorId}/work-schedules`, schedulePayload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("Успешно обновлено расписание работы.");
    } catch (error: any) {
        console.error("Ошибка обновления расписания работы:", error.response?.data || error.message);
        throw error;
    }
};



export const createPrescription = async (
    doctorId: string,
    patientId: string,
    prescriptionData: {
        medicationName: string;
        dosage: string;
        instructions: string;
        prescriptionDate: string;
        medicalRecordId: string;
        isActive: boolean;
    },
    token: string
): Promise<void> => {
    try {
        const url = `/api/Doctor/${doctorId}/patients/${patientId}/prescriptions`;
        await axios.post(url, prescriptionData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Успешно добавлен рецепт:", prescriptionData);
    } catch (error: any) {
        console.error("Ошибка добавления рецепта:", error.response?.data || error.message);
        throw error;
    }
};


export const createRecommendation = async (
    doctorId: string,
    patientId: string,
    recommendationData: {
        content: string;
        recommendationDate: string;
        medicalRecordId: string;
        isActive: boolean;
    },
    token: string
): Promise<void> => {
    try {
        const url = `/api/Doctor/${doctorId}/patients/${patientId}/recommendations`;
        await axios.post(url, recommendationData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("Успешно добавлена рекомендация:", recommendationData);
    } catch (error: any) {
        console.error("Ошибка добавления рекомендации:", error.response?.data || error.message);
        throw error;
    }
};


export const fetchAppointments = async (
    doctorId: string,
    token: string,
    params: any
): Promise<any[]> => {
    try {
        console.log("Запрос к API:", {
            endpoint: `/api/Doctor/${doctorId}/appointments`,
            headers: { Authorization: `Bearer ${token}` },
            params,
        });

        const response = await axios.get(`/api/Doctor/${doctorId}/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
            params,
        });

        console.log("Ответ от API (Appointments):", response.data);
        return response.data;
    } catch (error) {
        console.error("Ошибка загрузки графика приёмов:", error);
        throw error;
    }
};



export const cancelAppointment = async (doctorId: string, appointmentId: string, token: string): Promise<void> => {
    try {
        const url = `/api/Doctor/${doctorId}/appointments/${appointmentId}/cancel`;
        console.log("Відправляємо запит для скасування запису:", url);

        await axios.delete(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error("Помилка скасування запису:", error);
        throw error;
    }
};


export const fetchDoctorSlots = async (doctorId: string, date: string, token: string): Promise<any[]> => {
    try {
        const response = await axios.get(`/api/Patient/doctors/${doctorId}/slots`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: { date },
        });
        console.log("Полученные слоты:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Ошибка загрузки слотов:", error.response?.data || error.message);
        throw new Error("Не удалось загрузить слоты доктора");
    }
};