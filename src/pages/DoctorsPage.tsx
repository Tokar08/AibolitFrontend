import React, { useEffect, useState } from "react";
import {
    Tabs,
    Input,
    Button,
    Tooltip,
    Dropdown,
    Spin,
    Slider,
    Checkbox,
    List,
    Pagination,
    Empty,
} from "antd";
import { HeartOutlined, HeartFilled, FilterOutlined } from "@ant-design/icons";
import {
    fetchAllDoctors,
    fetchFavorites,
    toggleFavoriteDoctor,
    removeFavoriteDoctor,
} from "../api/patient";
import { fetchHospitalDetails } from "../api/hospital";
import BookingModal from "../components/BookingModal";

const { TabPane } = Tabs;

interface DoctorsPageProps {
    token: string;
    patientId: string;
}

const DoctorsPage: React.FC<DoctorsPageProps> = ({ token, patientId }) => {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [hospitalCache, setHospitalCache] = useState<{ [key: string]: { title: string; address: string } }>({});
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        SearchTerm: "",
        SpecializationTitle: "",
        HospitalTitle: "",
        Gender: [] as string[],
        MinYearsOfExperience: 0,
        MaxYearsOfExperience: 50,
        page: 1,
        size: 10,
    });
    const [totalDoctors, setTotalDoctors] = useState<number>(0);
    const [favoritesPage, setFavoritesPage] = useState<number>(1);
    const favoritesPageSize = 10;

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const filtersForApi = {
                ...filters,
                Gender: filters.Gender.join(","),
            };
            const data = await fetchAllDoctors(token, filtersForApi);

            const hospitalIds = Array.from(
                new Set(data.items.map((doc: any) => doc.HospitalId).filter(Boolean))
            );

            const hospitals = await Promise.all(
                hospitalIds.map((id) => fetchHospitalDetails(id, token))
            );

            const newHospitalCache = hospitals.reduce((acc, hospital) => {
                if (hospital) {
                    acc[hospital.Id] = {
                        title: hospital.Title,
                        address: hospital.Address,
                    };
                }
                return acc;
            }, {} as { [key: string]: { title: string; address: string } });

            setHospitalCache((prev) => ({ ...prev, ...newHospitalCache }));
            setDoctors(data.items);
            setTotalDoctors(data.total);
        } catch (error) {
            console.error("Помилка завантаження лікарів:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const favoriteDoctors = await fetchFavorites(patientId, token);
            setFavorites(favoriteDoctors);
        } catch (error) {
            console.error("Помилка завантаження обраних лікарів:", error);
        }
    };

    const toggleFavorite = async (doctorId: string, isFavorite: boolean) => {
        try {
            if (isFavorite) {
                await removeFavoriteDoctor(patientId, doctorId, token);
            } else {
                await toggleFavoriteDoctor(patientId, doctorId, token);
            }
            await loadFavorites();
        } catch (error) {
            console.error("Помилка зміни обраного:", error);
        }
    };

    useEffect(() => {
        loadDoctors();
        loadFavorites();
    }, [filters]);

    const filterMenu = (
        <div style={{ padding: 20, width: "100%", maxWidth: "400px", background: "#fff" }}>
            <div>
                <strong>Стать:</strong>
            </div>
            <div style={{ marginBottom: "10px" }}>
                <Checkbox.Group
                    options={[
                        { label: "Чоловік", value: "Чоловік" },
                        { label: "Жінка", value: "Жінка" },
                    ]}
                    value={filters.Gender}
                    onChange={(values) => setFilters((prev) => ({ ...prev, Gender: values as string[] }))}
                />
            </div>
            <div style={{marginBottom: "10px"}}>
                <strong>Назва лікарні:</strong>
                <Input
                    placeholder="Назва лікарні"
                    value={filters.HospitalTitle}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            HospitalTitle: e.target.value,
                            page: 1,
                        }))
                    }
                    allowClear
                    style={{
                        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
                    }}
                />
            </div>
            <div>
            <strong>Роки досвіду:</strong>
                <Slider
                    range
                    min={0}
                    max={50}
                    value={[filters.MinYearsOfExperience, filters.MaxYearsOfExperience]}
                    onChange={(values) =>
                        setFilters((prev) => ({
                            ...prev,
                            MinYearsOfExperience: values[0],
                            MaxYearsOfExperience: values[1],
                        }))
                    }
                />
            </div>
        </div>
    );

    const renderDoctorCard = (item: any) => {
        const isFavorite = favorites.some((fav: any) => fav.Id === item.Id);
        const hospital = hospitalCache[item.HospitalId];
        return (
            <div className="bg-white rounded-lg border-2 border-blue-400 shadow-lg mb-4 p-6 flex flex-col md:flex-row md:items-center relative">
                <Tooltip title={isFavorite ? "Видалити з обраного" : "Додати в обране"}>
                    <Button
                        type="text"
                        icon={
                            isFavorite ? (
                                <HeartFilled style={{ color: "#FF4B4E", fontSize: "26px" }} />
                            ) : (
                                <HeartOutlined style={{ fontSize: "26px" }} />
                            )
                        }
                        onClick={() => toggleFavorite(item.Id, isFavorite)}
                        className="absolute top-4 right-4"
                    />
                </Tooltip>

                <img
                    src={item.PhotoUrl || "https://via.placeholder.com/120"}
                    alt="Доктор"
                    className="w-28 h-28 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
                />

                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <h3 className="col-span-1 md:col-span-3 text-lg font-bold text-center md:text-left">
                        {`${item.FirstName} ${item.LastName}`}
                    </h3>
                    <p>
                        <strong>Спеціалізація:</strong> {item.SpecializationTitle || "Немає даних"}
                    </p>
                    <p>
                        <strong>Роки досвіду:</strong> {item.YearsOfExperience}
                    </p>
                    <p>
                        <strong>Гендер:</strong> {item.Gender}
                    </p>
                    <p>
                        <strong>Кількість візитів:</strong> {item.VisitCount || 0}
                    </p>
                    <p>
                        <strong>Освіта:</strong> {item.Education || "Немає даних"}
                    </p>
                    <p>
                        <strong>Телефон:</strong> {item.PhoneNumber || "Немає даних"}
                    </p>
                    <p>
                        <strong>Email:</strong> {item.Email || "Немає даних"}
                    </p>
                    <p>
                        <strong>Лікарня:</strong>{" "}
                        {hospital ? `"${hospital.title}", ${hospital.address}` : "Завантаження..."}
                    </p>
                </div>

                <Button
                    className="mt-4 md:mt-0 bg-blue-400 border-blue-400 text-white rounded-md px-6 py-3 font-semibold hover:bg-blue-500"
                    onClick={() => openBookingModal(item.Id)}
                >
                    Записатися
                </Button>
            </div>
        );
    };

    const paginatedFavorites = favorites.slice(
        (favoritesPage - 1) * favoritesPageSize,
        favoritesPage * favoritesPageSize
    );

    const openBookingModal = (doctorId: string) => {
        setSelectedDoctor(doctorId);
        setModalVisible(true);
    };

    const closeBookingModal = () => {
        setSelectedDoctor(null);
        setModalVisible(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mx-auto max-w-5xl">
            <Spin spinning={loading}>
                <Tabs defaultActiveKey="1" centered size="middle" className="mb-4">
                    <TabPane tab="Всі лікарі" key="1">
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
                                value={filters.SearchTerm}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        SearchTerm: e.target.value || "",
                                        page: 1,
                                    }))
                                }
                                allowClear
                                style={{
                                    gridColumn: "1 / 3",
                                    height: "40px",
                                    fontSize: "16px",
                                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
                                }}
                            />
                            <Input
                                placeholder="Спеціалізація"
                                value={filters.SpecializationTitle}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        SpecializationTitle: e.target.value || "",
                                        page: 1,
                                    }))
                                }
                                allowClear
                                style={{
                                    gridColumn: "3 / 5",
                                    height: "40px",
                                    fontSize: "16px",
                                    boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
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
                                        boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)",
                                    }}
                                >
                                    <FilterOutlined /> Фільтри
                                </Button>
                            </Dropdown>
                        </div>
                        {doctors.length > 0 ? (
                            <>
                                <List
                                    itemLayout="vertical"
                                    size="large"
                                    dataSource={doctors}
                                    renderItem={renderDoctorCard}
                                />
                                <Pagination
                                    current={filters.page}
                                    pageSize={filters.size}
                                    total={totalDoctors}
                                    onChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                                    className="flex justify-center mt-4"
                                />
                            </>
                        ) : (
                            <Empty description="Немає лікарів" />
                        )}
                    </TabPane>
                    <TabPane tab="Обрані лікарі" key="2">
                        {favorites.length > 0 ? (
                            <>
                                <List
                                    itemLayout="vertical"
                                    size="large"
                                    dataSource={paginatedFavorites}
                                    renderItem={renderDoctorCard}
                                />
                                <Pagination
                                    current={favoritesPage}
                                    pageSize={favoritesPageSize}
                                    total={favorites.length}
                                    onChange={(page) => setFavoritesPage(page)}
                                    className="flex justify-center mt-4"
                                />
                            </>
                        ) : (
                            <Empty description="Немає обраних лікарів" />
                        )}
                    </TabPane>
                </Tabs>
            </Spin>

            <BookingModal
                visible={modalVisible}
                onClose={closeBookingModal}
                doctorId={selectedDoctor!}
                patientId={patientId}
                token={token}
            />
        </div>

    );
};

export default DoctorsPage;
