import React, { useEffect, useState } from "react";
import {
    Table,
    Input,
    Button,
    Dropdown,
    Checkbox,
    DatePicker,
    Spin,
    Space,
    Tooltip,
} from "antd";
import { FilterOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchPatientsByDoctor } from "../api/doctor";
import type { ColumnType } from "antd/es/table";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    city: string;
    birthDate: string;
}

interface Props {
    doctorId: string;
    hospitalId: string;
    token: string;
}

const ManagePatients: React.FC<Props> = ({ doctorId, hospitalId, token }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPatients, setTotalPatients] = useState<number>(0);
    const pageSize = 10;

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedGender, setSelectedGender] = useState<string[]>([]);
    const [city, setCity] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [birthDateRange, setBirthDateRange] = useState<[string | undefined, string | undefined]>([
        undefined,
        undefined,
    ]);

    const navigate = useNavigate();

    const loadPatients = async () => {
        setLoading(true);
        try {
            const { items, total } = await fetchPatientsByDoctor(
                doctorId,
                hospitalId,
                token,
                currentPage,
                pageSize,
                searchTerm,
                selectedGender.join(","),
                city,
                phoneNumber,
                birthDateRange[0],
                birthDateRange[1]
            );
            setPatients(
                items.map((item: any) => ({
                    id: item.Id,
                    firstName: item.FirstName,
                    lastName: item.LastName,
                    email: item.Email,
                    phoneNumber: item.PhoneNumber,
                    gender: item.Gender,
                    city: item.City,
                    birthDate: item.BirthDate,
                }))
            );
            setTotalPatients(total);
        } catch (error) {
            console.error("Ошибка загрузки пациентов:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatients();
    }, [currentPage, searchTerm, selectedGender, city, phoneNumber, birthDateRange]);

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
            <div style={{ marginBottom: 20 }}>
                <strong>Місто:</strong>
                <Input
                    placeholder="Введіть місто"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: 20 }}>
                <strong>Телефон:</strong>
                <Input
                    placeholder="Введіть номер телефону"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />
            </div>
            <div style={{ marginBottom: 20 }}>
                <strong>Дата народження:</strong>
                <RangePicker
                    className="w-full"
                    format="YYYY-MM-DD"
                    onChange={(dates, dateStrings) => {
                        setBirthDateRange([dateStrings[0] || undefined, dateStrings[1] || undefined]);
                    }}
                    value={[
                        birthDateRange[0] ? dayjs(birthDateRange[0]) : null,
                        birthDateRange[1] ? dayjs(birthDateRange[1]) : null,
                    ]}
                    placeholder={["Початок", "Кінець"]}
                />
            </div>
        </div>
    );

    const columns: ColumnType<Patient>[] = [
        { title: "Ім'я", dataIndex: "firstName", key: "firstName" },
        { title: "Прізвище", dataIndex: "lastName", key: "lastName" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Телефон", dataIndex: "phoneNumber", key: "phoneNumber" },
        { title: "Стать", dataIndex: "gender", key: "gender" },
        { title: "Місто", dataIndex: "city", key: "city" },
        { title: "Дата народження", dataIndex: "birthDate", key: "birthDate" },
        {
            title: "Дії",
            key: "actions",
            render: (_: any, record: Patient) => (
                <Space size="middle">
                    <Tooltip title="Переглянути">
                        <EyeOutlined
                            style={{
                                color: "#FF4B4E",
                                cursor: "pointer",
                                fontSize: "18px",
                            }}
                            onClick={() =>
                                navigate(`/chief-doctor/doctors/${doctorId}/patients/${record.id}`, {
                                    state: { hospitalId, token },
                                })
                            }
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ width: "100%" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "15px",
                    marginBottom: "20px",
                }}
            >
                <Input
                    placeholder="Пошук за ім'ям або прізвищем"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        gridColumn: "1 / 3",
                        height: "40px",
                        fontSize: "16px",
                    }}
                />
                <Dropdown overlay={filterMenu} trigger={["click"]}>
                    <Button
                        type="primary"
                        style={{
                            gridColumn: "3 / 4",
                            height: "40px",
                            fontSize: "16px",
                            backgroundColor: "#FF4B4E",
                            borderColor: "#FF4B4E",
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
                    dataSource={patients}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total: totalPatients,
                        onChange: (page) => setCurrentPage(page),
                        style: { display: "flex", justifyContent: "center" },
                    }}
                    bordered
                    scroll={{ x: "max-content" }}
                />
            )}
        </div>
    );
};

export default ManagePatients;
