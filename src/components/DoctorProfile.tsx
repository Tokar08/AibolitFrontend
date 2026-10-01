import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, Avatar, Card, Spin, Select, notification } from "antd";
import { fetchDoctorDetails, updateDoctorWorkSchedules } from "../api/doctor";
import { fetchAllWorkSchedules } from "../api/workSchedule";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import PatientList from "./PatientList";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

const weekDays = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четверг",
    "П’ятниця",
    "Субота",
];

const DoctorProfile: React.FC<{ token: string }> = ({ token }) => {
    const { id: doctorId } = useParams<{ id: string }>();
    const [doctor, setDoctor] = useState<any>(null);
    const [workSchedules, setWorkSchedules] = useState<any[]>([]);
    const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [doctorData, schedules] = await Promise.all([
                    fetchDoctorDetails(doctorId!, token),
                    fetchAllWorkSchedules(token),
                ]);

                const convertedSchedules = schedules.map((schedule: any) => ({
                    ...schedule,
                    startTime: dayjs
                        .utc(schedule.startTime, "HH:mm:ss")
                        .tz("Europe/Kiev")
                        .format("HH:mm"),
                    endTime: dayjs
                        .utc(schedule.endTime, "HH:mm:ss")
                        .tz("Europe/Kiev")
                        .format("HH:mm"),
                }));

                setDoctor(doctorData);
                setWorkSchedules(convertedSchedules);

                const selected = doctorData.WorkSchedules?.map(
                    (schedule: any) => schedule.Id
                ) || [];
                setSelectedSchedules(selected);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            } finally {
                setLoading(false);
            }
        };

        if (doctorId) {
            loadData();
        }
    }, [doctorId, token]);

    const handleWorkScheduleChange = async (value: string[]) => {
        const selectedSchedulesData = workSchedules.filter((schedule) =>
            value.includes(schedule.id)
        );

        const schedulePayload = selectedSchedulesData.map((schedule) => ({
            id: schedule.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: dayjs
                .tz(schedule.startTime, "HH:mm", "Europe/Kiev")
                .utc()
                .format("HH:mm:ss"),
            endTime: dayjs
                .tz(schedule.endTime, "HH:mm", "Europe/Kiev")
                .utc()
                .format("HH:mm:ss"),
        }));

        setIsUpdating(true);

        try {
            await updateDoctorWorkSchedules(doctorId!, schedulePayload, token);

            setSelectedSchedules(value);

            api.success({
                message: "Розклад роботи оновлено",
                description: "Зміни успішно збережені.",
            });
        } catch (error) {
            console.error("Ошибка обновления расписания работы:", error);
            api.error({
                message: "Помилка оновлення розкладу",
                description: "Не вдалося зберегти зміни. Спробуйте ще раз.",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!doctor) {
        return (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Title level={4}>Дані лікаря не знайдено.</Title>
            </div>
        );
    }

    const scheduleOptions = workSchedules
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .map((schedule: any) => ({
            label: `${weekDays[schedule.dayOfWeek] || "Невідомо"}: ${
                schedule.startTime || "Немає даних"
            } - ${schedule.endTime || "Немає даних"}`,
            value: schedule.id,
        }));

    return (
        <div
            style={{
                padding: "20px",
                maxWidth: "1000px",
                margin: "0 auto",
            }}
        >
            {contextHolder}
            <Card
                bordered={false}
                style={{
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                    padding: "20px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        alignItems: "flex-start",
                        justifyContent: "center",
                    }}
                >
                    <Avatar
                        src={doctor.PhotoUrl || "https://via.placeholder.com/300"}
                        size={200}
                        style={{
                            border: "2px solid #76B9FF",
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                        }}
                    />
                    <div style={{ flexGrow: 1 }}>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                gap: "20px",
                                marginTop: "10px",
                            }}
                        >
                            <div>
                                <Text strong style={{ fontSize: "16px" }}>
                                    Ім'я та Прізвище:
                                </Text>
                                <div style={{ fontSize: "14px" }}>
                                    {`${doctor.FirstName || "—"} ${doctor.LastName || "—"}`}
                                </div>
                            </div>
                            <div>
                                <Text strong style={{ fontSize: "16px" }}>Email:</Text>
                                <div style={{ fontSize: "14px" }}>{doctor.Email || "Не вказано"}</div>
                            </div>
                            <div>
                                <Text strong style={{ fontSize: "16px" }}>Телефон:</Text>
                                <div style={{ fontSize: "14px" }}>{doctor.PhoneNumber || "Не вказано"}</div>
                            </div>
                            <div>
                                <Text strong style={{ fontSize: "16px" }}>Спеціалізація:</Text>
                                <div style={{ fontSize: "14px" }}>{doctor.SpecializationTitle || "Не вказано"}</div>
                            </div>
                            <div>
                                <Text strong style={{ fontSize: "16px" }}>Роки досвіду:</Text>
                                <div style={{ fontSize: "14px" }}>{doctor.YearsOfExperience || "Не вказано"}</div>
                            </div>
                            <div>
                                <Text strong style={{ fontSize: "16px" }}>Гендер:</Text>
                                <div style={{ fontSize: "14px" }}>{doctor.Gender || "Не вказано"}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                    <Text strong style={{ fontSize: "16px" }}>Розклад роботи:</Text>
                    <Select
                        mode="multiple"
                        style={{ width: "100%", marginTop: "10px", fontSize: "14px" }}
                        placeholder="Оберіть розклад"
                        options={scheduleOptions}
                        value={selectedSchedules}
                        onChange={handleWorkScheduleChange}
                        loading={isUpdating}
                    />
                </div>
            </Card>
            <div
                style={{
                    width: "100%",
                    marginTop: "30px",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.3)",
                    backgroundColor: "#fff",
                }}
            >
                <PatientList
                    doctorId={doctor.Id}
                    hospitalId={doctor.HospitalId}
                    token={token}
                    role="ChiefDoctor"
                />
            </div>
        </div>
    );
};

export default DoctorProfile;
