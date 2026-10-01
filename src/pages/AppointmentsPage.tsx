import React, { useState, useEffect } from "react";
import {
    Card,
    Spin,
    DatePicker,
    Switch,
    Button,
    Popconfirm,
    Empty,
    Pagination,
    notification,
    Dropdown,
    Checkbox,
    Menu
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import {fetchAppointments, cancelAppointment, fetchDoctorDetails} from "../api/doctor";
import {cancelPatientAppointment, fetchPatientAppointments, fetchPatientDetails} from "../api/patient";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface AppointmentsPageProps {
    doctorId?: string;
    patientId?: string;
    token: string;
    role: "Doctor" | "Patient";
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ doctorId, patientId, token, role }) => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [filters, setFilters] = useState({
        minDate: undefined as string | undefined,
        maxDate: undefined as string | undefined,
        sortByDescending: true,
        status: [] as string[],
        page: 1,
        size: 9,
    });


    const fetchDoctorName = async (doctorId: string | undefined) => {
        try {
            const doctor = await fetchDoctorDetails(doctorId!, token);
            return `${doctor.FirstName || "—"} ${doctor.LastName || "—"}`;
        } catch (error) {
            console.error("Ошибка получения имени доктора:", error);
            return "Невідомо";
        }
    };


    const fetchPatientName = async (patientId: string) => {
        try {
            const patient = await fetchPatientDetails(patientId, token);
            return `${patient.FirstName || "—"} ${patient.LastName || "—"}`;
        } catch (error) {
            console.error("Ошибка получения имени пациента:", error);
            return "Невідомо";
        }
    };

    const validateFilters = (): boolean => {
        if (filters.minDate && filters.maxDate) {
            const minDate = dayjs(filters.minDate);
            const maxDate = dayjs(filters.maxDate);
            return minDate.isBefore(maxDate);
        }
        return true;
    };

    const handleDateChange = (dates: any, dateStrings: [string, string]) => {
        setFilters((prev) => ({
            ...prev,
            minDate: dateStrings[0] ? dayjs(dateStrings[0]).startOf("day").toISOString() : undefined,
            maxDate: dateStrings[1] ? dayjs(dateStrings[1]).endOf("day").toISOString() : undefined,
            page: 1,
        }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({
            ...prev,
            page,
        }));
    };


    const handleCancelAppointment = async (appointmentId: string) => {
        try {
            if (role === "Doctor") {
                await cancelAppointment(doctorId!, appointmentId, token);
            } else if (role === "Patient") {
                await cancelPatientAppointment(patientId!, appointmentId, token);
            }
            
            const updatedAppointments = appointments.filter(
                (appointment) => appointment.id !== appointmentId
            );

            setAppointments(updatedAppointments);
            setTotalRecords((prev) => prev - 1);
            
            if (updatedAppointments.length === 0 && filters.page > 1) {
                const prevPage = filters.page - 1;
                const params = {
                    MinDate: filters.minDate,
                    MaxDate: filters.maxDate,
                    SortByDescending: filters.sortByDescending,
                    page: prevPage,
                    size: filters.size,
                };

                try {
                    const prevPageData =
                        role === "Doctor"
                            ? await fetchAppointments(doctorId!, token, params)
                            : await fetchPatientAppointments(patientId!, token, params);

                    const prevAppointmentsWithNames = await Promise.all(
                        prevPageData.map(async (appointment: any) => {
                            const relatedName =
                                role === "Patient"
                                    ? await fetchDoctorName(appointment.DoctorId || appointment.doctorId)
                                    : await fetchPatientName(appointment.PatientId || appointment.patientId);

                            return {
                                id: appointment.Id || appointment.id,
                                relatedName,
                                appointmentDateTime: dayjs(
                                    appointment.AppointmentDate || appointment.appointmentDate
                                ).format("DD.MM.YYYY HH:mm"),
                                isScheduled: appointment.IsScheduled ?? appointment.isScheduled,
                                isActive: appointment.IsActive ?? appointment.isActive,
                            };
                        })
                    );

                    setAppointments(prevAppointmentsWithNames);
                    setFilters((prev) => ({ ...prev, page: prevPage }));
                } catch (error) {
                    console.error("Ошибка при загрузке данных предыдущей страницы:", error);
                }
            }
          
            else if (updatedAppointments.length < filters.size) {
                const nextPage = filters.page + 1;
                const params = {
                    MinDate: filters.minDate,
                    MaxDate: filters.maxDate,
                    SortByDescending: filters.sortByDescending,
                    page: nextPage,
                    size: filters.size,
                };

                try {
                    const nextPageData =
                        role === "Doctor"
                            ? await fetchAppointments(doctorId!, token, params)
                            : await fetchPatientAppointments(patientId!, token, params);

                    const nextAppointmentsWithNames = await Promise.all(
                        nextPageData.map(async (appointment: any) => {
                            const relatedName =
                                role === "Patient"
                                    ? await fetchDoctorName(appointment.DoctorId || appointment.doctorId)
                                    : await fetchPatientName(appointment.PatientId || appointment.patientId);

                            return {
                                id: appointment.Id || appointment.id,
                                relatedName,
                                appointmentDateTime: dayjs(
                                    appointment.AppointmentDate || appointment.appointmentDate
                                ).format("DD.MM.YYYY HH:mm"),
                                isScheduled: appointment.IsScheduled ?? appointment.isScheduled,
                                isActive: appointment.IsActive ?? appointment.isActive,
                            };
                        })
                    );

                    setAppointments([...updatedAppointments, ...nextAppointmentsWithNames]);
                } catch (error) {
                    console.error("Ошибка при загрузке данных следующей страницы:", error);
                }
            }

            loadAppointments();
        
            notification.success({
                message: "Успіх",
                description: "Запис успішно скасовано.",
            });
        } catch (error) {
            console.error("Ошибка при отмене записи:", error);

         
            notification.error({
                message: "Помилка",
                description: "Не вдалося скасувати запис. Спробуйте ще раз.",
            });
        }
    };

    const loadAppointments = async () => {
        if (!validateFilters()) {
            setAppointments([]);
            setTotalRecords(0);
            return;
        }

        setLoading(true);
        try {
            const params = {
                MinDate: filters.minDate,
                MaxDate: filters.maxDate,
                SortByDescending: filters.sortByDescending,
            };

            const data =
                role === "Doctor"
                    ? await fetchAppointments(doctorId!, token, params)
                    : await fetchPatientAppointments(patientId!, token, params);
            
            let filteredData = data;
            if (role === "Patient" && filters.status.length > 0) {
                filteredData = filteredData.filter((appointment: any) =>
                    filters.status.includes(
                        appointment.IsScheduled ? "scheduled" : "cancelled"
                    )
                );
            }
            
            setTotalRecords(filteredData.length);

            const paginatedData = filteredData.slice(
                (filters.page - 1) * filters.size,
                filters.page * filters.size
            );

            const appointmentsWithNames = await Promise.all(
                paginatedData.map(async (appointment: any) => {
                    const isPatient = role === "Patient";
                    const relatedName = isPatient
                        ? await fetchDoctorName(appointment.DoctorId || appointment.doctorId)
                        : await fetchPatientName(appointment.PatientId || appointment.patientId);

                    return {
                        id: appointment.Id || appointment.id,
                        relatedName,
                        appointmentDateTime: dayjs(
                            appointment.AppointmentDate || appointment.appointmentDate
                        ).format("DD.MM.YYYY HH:mm"),
                        isScheduled: appointment.IsScheduled ?? appointment.isScheduled,
                        isActive: appointment.IsActive ?? appointment.isActive,
                    };
                })
            );

            setAppointments(appointmentsWithNames);
        } catch (error) {
            console.error("Ошибка загрузки записей:", error);
            setAppointments([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadAppointments();
    }, [filters, doctorId, patientId]);


    const handleStatusFilterChange = (selectedStatuses: string[]) => {
        setFilters((prev) => ({ ...prev, status: selectedStatuses, page: 1 }));
    };

    const filterMenu = (
        <Menu>
            <div style={{ padding: "10px" }}>
                <p style={{ marginBottom: "10px", fontWeight: "bold", color: "#333" }}>
                    Оберіть стан запису:
                </p>
                <Checkbox.Group
                    options={[
                        { label: "Заплановані записи", value: "scheduled" },
                        { label: "Скасовані записи", value: "cancelled" },
                    ]}
                    value={filters.status}
                    onChange={(values) => handleStatusFilterChange(values as string[])}
                />
            </div>
        </Menu>
    );


    return (
        <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
            <Card
                bordered={false}
                className="rounded-lg shadow-md p-6 bg-white max-w-5xl w-full"
                style={{boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"}}
            >
                <div
                    className={`grid ${role === "Patient" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"} gap-4 mb-6`}>
                    <RangePicker
                        onChange={handleDateChange}
                        placeholder={["Початок", "Кінець"]}
                        className="w-full"
                        format="YYYY-MM-DD"
                    />
                    <Switch
                        checkedChildren="Нові"
                        unCheckedChildren="Старі"
                        checked={filters.sortByDescending}
                        onChange={(checked) =>
                            setFilters((prev) => ({...prev, sortByDescending: checked}))
                        }
                        style={{
                            backgroundColor: filters.sortByDescending ? "#76B9FF" : "#FF4B4E",
                            marginTop: "5px",
                        }}
                    />
                    {role === "Patient" && (
                        <Dropdown overlay={filterMenu} trigger={["click"]}>
                            <Button
                                type="primary"
                                style={{
                                    height: "35px",
                                    fontSize: "14px",
                                    backgroundColor: "#FF4B4E",
                                    borderColor: "#FF4B4E",
                                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                <FilterOutlined/> Фільтри
                            </Button>
                        </Dropdown>
                    )}
                </div>


                <Spin spinning={loading} tip="">
                    {appointments.length === 0 && !loading ? (
                        <Empty description="Записів не знайдено"/>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        style={{
                                            borderRadius: "10px",
                                            padding: "20px",
                                            backgroundColor: appointment.isScheduled
                                                ? "#E0F3FF"
                                                : "#F3F4F6",
                                            border: appointment.isScheduled
                                                ? "1px solid #76B9FF"
                                                : "1px solid #D1D5DB",
                                            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
                                            transition: "transform 0.3s, box-shadow 0.3s",
                                        }}
                                        className="hover:scale-105 hover:shadow-lg"
                                    >
                                        <div style={{marginBottom: "16px"}}>
                                            <p style={{fontSize: "14px", color: "#4B5563"}}>
                                                {role === "Patient" ? "Доктор" : "Пацієнт"}
                                            </p>
                                            <h3
                                                style={{
                                                    fontSize: "18px",
                                                    fontWeight: "600",
                                                    color: "#1F2937",
                                                }}
                                            >
                                                {appointment.relatedName}
                                            </h3>
                                        </div>
                                        <div style={{marginBottom: "16px"}}>
                                            <p style={{fontSize: "14px", color: "#4B5563"}}>Дата та час</p>
                                            <h3
                                                style={{
                                                    fontSize: "18px",
                                                    fontWeight: "600",
                                                    color: "#374151",
                                                }}
                                            >
                                                {appointment.appointmentDateTime}
                                            </h3>
                                        </div>
                                        <div style={{marginBottom: "16px"}}>
                                            <p style={{fontSize: "14px", color: "#4B5563"}}>Стан</p>
                                            <h3
                                                style={{
                                                    fontSize: "18px",
                                                    fontWeight: "600",
                                                    color: appointment.isScheduled ? "#07689F" : "#9CA3AF",
                                                }}
                                            >
                                                {appointment.isScheduled === true ? "Заплановано" : "Скасовано"}
                                            </h3>
                                        </div>
                                        {appointment.isScheduled && (
                                            <Popconfirm
                                                title="Ви впевнені, що хочете скасувати запис?"
                                                onConfirm={() => handleCancelAppointment(appointment.id)}
                                                okText="Так"
                                                cancelText="Ні"
                                            >
                                                <Button
                                                    type="default"
                                                    style={{
                                                        width: "100%",
                                                        backgroundColor: "#FFFFFF",
                                                        borderColor: "#FF4B4E",
                                                        color: "#FF4B4E",
                                                        borderRadius: "8px",
                                                        fontWeight: "bold",
                                                        transition: "all 0.3s",
                                                    }}
                                                    className="hover:bg-[#FF4B4E] hover:text-white"
                                                >
                                                    Скасувати
                                                </Button>
                                            </Popconfirm>
                                        )}
                                    </div>


                                ))}
                            </div>

                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    current={filters.page}
                                    pageSize={filters.size}
                                    total={totalRecords}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                />

                            </div>
                        </>
                    )}
                </Spin>
            </Card>
        </div>
    );
};

export default AppointmentsPage;
