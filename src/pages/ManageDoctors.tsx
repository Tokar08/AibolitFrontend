import React, { useEffect, useState } from "react";
import {
    Table,
    Typography,
    Spin,
    Space,
    Tooltip,
    Modal,
    message,
    Input,
    Slider,
    Checkbox,
    Button,
    Dropdown,
    Alert,
} from "antd";
import { FilterOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchDoctorsByHospital, deleteDoctorById } from "../api/doctor";
import EditDoctorModal from "../components/EditDoctorModal";
import AddDoctorModal from "../components/AddDoctorModal";
import type { ColumnType } from "antd/es/table";

const { Title } = Typography;
const { confirm } = Modal;

interface Doctor {
    id: string;
    nickname: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    specialization: string;
    yearsOfExperience: number;
    gender: string;
    photoUrl: string;
}

interface Props {
    hospitalId: string;
    token: string;
    role: "Administrator" | "ChiefDoctor";
}

const ManageDoctors: React.FC<Props> = ({ hospitalId, token, role }) => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const pageSize = 10;

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [specialization, setSpecialization] = useState<string>("");
    const [selectedGender, setSelectedGender] = useState<string[]>([]);
    const [yearsOfExperience, setYearsOfExperience] = useState<[number, number]>([1, 50]);

    const navigate = useNavigate();

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const { items } = await fetchDoctorsByHospital(
                hospitalId,
                currentPage,
                pageSize,
                token,
                searchTerm,
                specialization,
                selectedGender,
                yearsOfExperience[0],
                yearsOfExperience[1]
            );
            setDoctors(
                items.map((item) => ({
                    id: item.Id,
                    nickname: item.Nickname,
                    firstName: item.FirstName,
                    lastName: item.LastName,
                    email: item.Email,
                    phoneNumber: item.PhoneNumber,
                    specialization: item.SpecializationTitle,
                    yearsOfExperience: item.YearsOfExperience,
                    gender: item.Gender,
                    photoUrl: item.PhotoUrl,
                }))
            );
        } catch (error) {
            console.error("Ошибка загрузки докторов:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, [currentPage, searchTerm, specialization, selectedGender, yearsOfExperience]);

    const showDeleteConfirm = (doctorId: string) => {
        confirm({
            title: "Ви впевнені, що хочете видалити цього лікаря?",
            icon: <QuestionCircleOutlined style={{ color: "red" }} />,
            content: "Ця дія не може бути скасована.",
            okText: "Так",
            okType: "danger",
            cancelText: "Ні",
            onOk: async () => {
                try {
                    await deleteDoctorById(doctorId, token);
                    message.success("Лікар успішно видалений.");
                    loadDoctors();
                } catch (error) {
                    message.error("Не вдалося видалити лікаря.");
                }
            },
        });
    };

    const handleEditClick = (doctorId: string) => {
        setSelectedDoctorId(doctorId);
        setEditModalVisible(true);
    };

    const closeEditModal = () => {
        setEditModalVisible(false);
        setSelectedDoctorId(null);
    };

    const handleDoctorUpdate = () => {
        closeEditModal();
        loadDoctors();
    };

    const handleAddDoctor = () => {
        setAddModalVisible(true);
    };

    const closeAddModal = () => {
        setAddModalVisible(false);
    };

    const handleDoctorAdd = () => {
        closeAddModal();
        loadDoctors();
    };

    const filterMenu = (
        <div
            style={{
                padding: 20,
                width: "100%",
                maxWidth: "450px",
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.3)",
            }}
        >
            <div style={{ marginBottom: 20 }}>
                <strong>Стать:</strong>
                <br />
                <Checkbox.Group
                    options={[
                        { label: "Чоловік", value: "Чоловік" },
                        { label: "Жінка", value: "Жінка" },
                    ]}
                    value={selectedGender}
                    onChange={(checkedValues) => {
                        setSelectedGender(checkedValues as string[]);
                    }}
                />
            </div>
            <div>
                <strong>Роки досвіду:</strong>
                <Slider
                    range
                    min={0}
                    max={50}
                    value={yearsOfExperience}
                    onChange={(value) => setYearsOfExperience(value as [number, number])}
                />
            </div>
        </div>
    );

    const columns: ColumnType<Doctor>[] = [
        {
            title: "Фото",
            dataIndex: "photoUrl",
            key: "photoUrl",
            render: (url: string) => (
                <img
                    src={url || "https://via.placeholder.com/50"}
                    alt="Фото лікаря"
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            ),
        },
        { title: "Ім'я", dataIndex: "firstName", key: "firstName" },
        { title: "Прізвище", dataIndex: "lastName", key: "lastName" },
        { title: "Спеціалізація", dataIndex: "specialization", key: "specialization" },
        { title: "Роки досвіду", dataIndex: "yearsOfExperience", key: "yearsOfExperience" },
        { title: "Гендер", dataIndex: "gender", key: "gender" },
        {
            title: "Дії",
            key: "actions",
            render: (_: any, record: Doctor) => (
                <Space size="middle">
                    {role === "Administrator" ? (
                        <>
                            <Tooltip title="Редагувати">
                                <EditOutlined
                                    style={{
                                        color: "#76B9FF",
                                        cursor: "pointer",
                                        fontSize: "18px",
                                    }}
                                    onClick={() => handleEditClick(record.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Видалити">
                                <DeleteOutlined
                                    style={{
                                        color: "#FF4B4E",
                                        cursor: "pointer",
                                        fontSize: "18px",
                                    }}
                                    onClick={() => showDeleteConfirm(record.id)}
                                />
                            </Tooltip>
                        </>
                    ) : (
                        <Tooltip title="Переглянути">
                            <EyeOutlined
                                style={{
                                    color: "#FF4B4E",
                                    cursor: "pointer",
                                    fontSize: "18px",
                                }}
                                onClick={() => navigate(`/chief-doctor/doctors/${record.id}`)}
                            />
                        </Tooltip>

                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            {role === "Administrator" && (
                <Alert
                    message="Увага!"
                    description="Для точного розуміння роботи з даними рекомендуємо ознайомитись із матеріалом у вкладці 'База знань'."
                    type="info"
                    showIcon
                    closable
                    className="mb-6 w-full"
                />
            )}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                    gap: "15px",
                    marginBottom: "20px",
                }}
            >
                <Input
                    placeholder="Пошук за ім'ям або прізвищем"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                    style={{
                        gridColumn: "1 / 3",
                        height: "40px",
                        fontSize: "16px",
                        boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.3)",
                    }}
                />
                <Input
                    placeholder="Спеціалізація"
                    value={specialization}
                    allowClear
                    onChange={(e) => setSpecialization(e.target.value)}
                    style={{
                        gridColumn: "3 / 5",
                        height: "40px",
                        fontSize: "16px",
                        boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.3)",
                    }}
                />
                <Dropdown overlay={filterMenu} trigger={["click"]}>
                    <Button
                        type="primary"
                        style={{
                            gridColumn: "5 / 6",
                            height: "40px",
                            fontSize: "16px",
                            backgroundColor: "#FF4B4E",
                            borderColor: "#FF4B4E",
                            boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        <FilterOutlined /> Фільтри
                    </Button>
                </Dropdown>
            </div>
            {loading ? (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <Spin size="large" />
                </div>
            ) : (
                <Table
                    dataSource={doctors}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total: doctors.length,
                        onChange: (page) => setCurrentPage(page),
                        style: { display: "flex", justifyContent: "center" },
                    }}
                    bordered
                    scroll={{ x: "max-content" }}
                    style={{
                        borderRadius: "10px",
                        boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.3)",
                    }}
                />
            )}
            {role === "Administrator" && (
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-start" }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddDoctor}
                        style={{
                            backgroundColor: "#FF4B4E",
                            borderColor: "#FF4B4E",
                            height: "40px",
                            fontSize: "16px",
                        }}
                    >
                        Додати лікаря
                    </Button>
                </div>
            )}
            {selectedDoctorId && (
                <EditDoctorModal
                    doctorId={selectedDoctorId!}
                    open={editModalVisible}
                    onClose={closeEditModal}
                    onUpdate={handleDoctorUpdate}
                    token={token}
                />
            )}
            {addModalVisible && (
                <AddDoctorModal
                    open={addModalVisible}
                    onClose={closeAddModal}
                    onAdd={handleDoctorAdd}
                    token={token}
                    hospitalId={hospitalId}
                />
            )}
        </div>
    );
};

export default ManageDoctors;
