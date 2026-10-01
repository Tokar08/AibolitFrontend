import React, { useEffect, useState } from "react";
import {
    Table,
    Spin,
    Space,
    Tooltip,
    Button,
    Alert,
    Popconfirm,
    notification,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
    fetchAllWorkSchedules,
    deleteWorkSchedule,
    updateWorkSchedule,
    createWorkSchedule,
} from "../api/workSchedule";
import ScheduleModal from "../components/ScheduleModal";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const weekDays = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четверг",
    "П’ятниця",
    "Субота",
];

const ManageSchedules: React.FC<{ token: string }> = ({ token }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalSchedules, setTotalSchedules] = useState<number>(0);
    const [reloadTrigger, setReloadTrigger] = useState<boolean>(false);
    const [api, contextHolder] = notification.useNotification();
    const pageSize = 10;

    useEffect(() => {
        const loadSchedules = async () => {
            setLoading(true);
            try {
                const data = await fetchAllWorkSchedules(token);

                const convertedData = data.map((schedule: any) => ({
                    ...schedule,
                    startTime: dayjs.utc(schedule.startTime, "HH:mm:ss").tz("Europe/Kiev").format("HH:mm"),
                    endTime: dayjs.utc(schedule.endTime, "HH:mm:ss").tz("Europe/Kiev").format("HH:mm"),
                }));

                const sortedData = convertedData.sort((a, b) => {
                    if (a.dayOfWeek === b.dayOfWeek) {
                        return a.startTime.localeCompare(b.startTime);
                    }
                    return a.dayOfWeek - b.dayOfWeek;
                });

                console.log("Sorted schedules:", sortedData);

                setSchedules(sortedData);
                setTotalSchedules(data.length);
            } catch (error) {
                console.error("Error while fetching schedules:", error);
                api.error({
                    message: "Помилка",
                    description: "Не вдалося завантажити розклади. Спробуйте ще раз пізніше.",
                });
            } finally {
                setLoading(false);
            }
        };


        loadSchedules();
    }, [token, reloadTrigger]);


    const handleDelete = async (id: string) => {
        try {
            console.log(`Attempting to delete schedule with ID: ${id}`);
            await deleteWorkSchedule(id, token);
            api.success({
                message: "Успішно",
                description: "Розклад роботи успішно видалено.",
            });
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.error("Error while deleting schedule:", error);
            api.error({
                message: "Помилка",
                description: "Не вдалося видалити розклад роботи.",
            });
        }
    };


    const handleModalSubmit = async (newSchedule: any, isEdit: boolean) => {
        const scheduleToSend = isEdit
            ? {
                ...newSchedule,
                startTime: dayjs.tz(newSchedule.startTime, "HH:mm:ss", "Europe/Kiev").utc().format("HH:mm:ss"),
                endTime: dayjs.tz(newSchedule.endTime, "HH:mm:ss", "Europe/Kiev").utc().format("HH:mm:ss"),
            }
            : newSchedule;

        console.log(`${isEdit ? "Updating" : "Creating"} schedule to server as-is:`, scheduleToSend);
        console.log(token);
        try {
            if (isEdit) {
                await updateWorkSchedule(scheduleToSend.id, scheduleToSend, token);
                api.success({
                    message: "Успішно",
                    description: "Розклад роботи успішно оновлено.",
                });
            } else {
                const createdSchedule = await createWorkSchedule(scheduleToSend, token);
                console.log("Created schedule received from server:", createdSchedule);
                api.success({
                    message: "Успішно",
                    description: "Розклад роботи успішно створено.",
                });
            }
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.error("Error while saving schedule:", error);
            if (!token) {
                console.error("Токен отсутствует. Пользователь не авторизован.");
            }
            api.error({
                message: "Помилка",
                description: "Не вдалося зберегти розклад роботи.",
            });
        } finally {
            setIsModalVisible(false);
            setEditingSchedule(null);
        }
    };



    const openEditModal = (schedule: any) => {
        console.log("Opening edit modal with schedule:", schedule);
        setEditingSchedule(schedule);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        console.log("Closing modal...");
        setIsModalVisible(false);
        setEditingSchedule(null);
    };

    const columns = [
        {
            title: "День тижня",
            dataIndex: "dayOfWeek",
            key: "dayOfWeek",
            render: (dayOfWeek: number) => weekDays[dayOfWeek] || "Невідомо",
        },
        {
            title: "Час початку",
            dataIndex: "startTime",
            key: "startTime",
            render: (time: string) => time || "Невідомо",
        },
        {
            title: "Час закінчення",
            dataIndex: "endTime",
            key: "endTime",
            render: (time: string) => time || "Невідомо",
        },
        {
            title: "Дії",
            key: "actions",
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Редагувати">
                        <EditOutlined
                            style={{
                                color: "#76B9FF",
                                cursor: "pointer",
                                fontSize: "18px",
                            }}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Видалити">
                        <Popconfirm
                            title="Ви впевнені, що хочете видалити цей розклад?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Так"
                            cancelText="Ні"
                        >
                            <DeleteOutlined
                                style={{
                                    color: "#FF4B4E",
                                    cursor: "pointer",
                                    fontSize: "18px",
                                }}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Alert
                message="Увага!"
                description="Будьте уважні при роботі з розкладами. Перевіряйте дані перед збереженням."
                type="info"
                showIcon
                closable
                style={{
                    marginBottom: "20px",
                    maxWidth: "900px",
                    margin: "20px auto",
                }}
            />
            <div
                style={{
                    padding: "20px",
                    maxWidth: "900px",
                    margin: "0 auto",
                    marginTop: "20px",
                    borderRadius: "8px",
                    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.3)",
                }}
            >
                {contextHolder}
                {loading ? (
                    <div style={{ textAlign: "center" }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={schedules.slice(
                            (currentPage - 1) * pageSize,
                            currentPage * pageSize
                        )}
                        rowKey="id"
                        bordered
                        pagination={{
                            current: currentPage,
                            pageSize,
                            total: totalSchedules,
                            onChange: (page) => setCurrentPage(page),
                            style: { display: "flex", justifyContent: "center" },
                        }}
                        style={{ marginBottom: "20px" }}
                    />
                )}
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalVisible(true)}
                    style={{
                        backgroundColor: "#FF4B4E",
                        borderColor: "#FF4B4E",
                        fontSize: "16px",
                    }}
                >
                    Додати розклад
                </Button>

                <ScheduleModal
                    visible={isModalVisible}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                    editingSchedule={editingSchedule}
                />
            </div>
        </>
    );
};

export default ManageSchedules;
