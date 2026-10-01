import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Typography, Card, Spin, Table, Input, DatePicker, Switch, Alert, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { fetchPatientDetails as fetchPatientDetailsByDoctor , fetchRecommendations, fetchPrescriptions } from "../api/doctor";
import dayjs from "dayjs";
import RecommendationModal from "./RecommendationModal";
import PrescriptionModal from "./PrescriptionModal";
import AddRecommendationModal from "./AddRecommendationModal";
import AddPrescriptionModal from "./AddPrescriptionModal";
import {fetchPatientDetails, fetchPatientPrescriptions, fetchPatientRecommendations} from "../api/patient";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
interface PatientProfileProps {
    token: string;
    role: "Doctor" | "ChiefDoctor" | "Patient";
}

const PatientProfile: React.FC<PatientProfileProps> = ({ token, role }) => {
    const { id: patientId } = useParams<{ id: string }>();
    const location = useLocation();
    const { doctorId: stateDoctorId, hospitalId } = location.state || {};

    const doctorId = stateDoctorId;

    const [patient, setPatient] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loadingPatient, setLoadingPatient] = useState<boolean>(true);
    const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState<boolean>(false);

    const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
    const [isRecommendationModalVisible, setRecommendationModalVisible] = useState(false);
    const [isPrescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
    const [isAddRecommendationModalVisible, setAddRecommendationModalVisible] = useState(false);
    const [isAddPrescriptionModalVisible, setAddPrescriptionModalVisible] = useState(false);

    const [recFilters, setRecFilters] = useState({
        minDate: undefined as string | undefined,
        maxDate: undefined as string | undefined,
        contentSearch: "",
        sortByDescending: true,
    });

    const [presFilters, setPresFilters] = useState({
        minDate: undefined as string | undefined,
        maxDate: undefined as string | undefined,
        medicationName: "",
        sortByDescending: true,
    });

    const loadRecommendations = async () => {
        setLoadingRecommendations(true);
        try {
            const params = {
                minDate: recFilters.minDate,
                maxDate: recFilters.maxDate,
                contentSearch: recFilters.contentSearch,
                sortByDescending: recFilters.sortByDescending,
            };

            const data =
                role === "Patient"
                    ? await fetchPatientRecommendations(patientId!, token, params)
                    : await fetchRecommendations(
                        doctorId!,
                        patientId!,
                        token,
                        recFilters.minDate,
                        recFilters.maxDate,
                        recFilters.contentSearch,
                        recFilters.sortByDescending
                    );

            setRecommendations(data);
        } catch (error) {
            console.error("Error loading recommendations:", error);
        } finally {
            setLoadingRecommendations(false);
        }
    };


    const loadPrescriptions = async () => {
        setLoadingPrescriptions(true);
        try {
            const params = {
                minDate: presFilters.minDate,
                maxDate: presFilters.maxDate,
                medicationName: presFilters.medicationName,
                sortByDescending: presFilters.sortByDescending,
            };

            const data =
                role === "Patient"
                    ? await fetchPatientPrescriptions(patientId!, token, params)
                    : await fetchPrescriptions(
                        doctorId!,
                        patientId!,
                        token,
                        presFilters.minDate,
                        presFilters.maxDate,
                        presFilters.medicationName,
                        presFilters.sortByDescending
                    );

            setPrescriptions(data);
        } catch (error) {
            console.error("Error loading prescriptions:", error);
        } finally {
            setLoadingPrescriptions(false);
        }
    };



    useEffect(() => {
        const loadPatient = async () => {
            if (!patientId) return;

            setLoadingPatient(true);

            try {
                let data;

                if (role === "Patient") {
                    console.log("Fetching patient data for role: Patient");
                    data = await fetchPatientDetails(patientId, token);
                } else if (role === "Doctor" || role === "ChiefDoctor") {
                    if (!doctorId || !hospitalId) {
                        console.warn("Doctor ID or Hospital ID is missing.");
                        return;
                    }
                    console.log("Fetching patient data for role:", role);
                    data = await fetchPatientDetailsByDoctor(doctorId, hospitalId, patientId, token);
                } else {
                    throw new Error("Unsupported role for fetching patient details.");
                }

                console.log("Loaded patient data:", data);
                setPatient(data);
            } catch (error) {
                console.error("Error loading patient details:", error);
            } finally {
                setLoadingPatient(false);
            }
        };

        loadPatient();
    }, [patientId, doctorId, hospitalId, token, role]);


    useEffect(() => {
        loadRecommendations();
    }, [recFilters, doctorId, patientId, token]);

    useEffect(() => {
        loadPrescriptions();
    }, [presFilters, doctorId, patientId, token]);

    if (loadingPatient) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Title level={4}>Дані пацієнта не знайдено.</Title>
            </div>
        );
    }

    const recommendationColumns = [
        {
            title: "Рекомендація",
            dataIndex: "Content",
            key: "Content",
            ellipsis: true,
        },
        {
            title: "Дата",
            dataIndex: "RecommendationDate",
            key: "Date",
            render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
        },
    ];

    const prescriptionColumns = [
        {
            title: "Ліки",
            dataIndex: "MedicationName",
            key: "MedicationName",
            ellipsis: true,
        },
        {
            title: "Дозування",
            dataIndex: "Dosage",
            key: "Dosage",
            ellipsis: true,
        },
        {
            title: "Інструкції",
            dataIndex: "Instructions",
            key: "Instructions",
            ellipsis: true,
        },
        {
            title: "Дата",
            dataIndex: "PrescriptionDate",
            key: "PrescriptionDate",
            render: (value: string) => dayjs(value).format("DD.MM.YYYY"),
        },
    ];

    const handleRecommendationClick = (recommendationId: string) => {
        setSelectedRecommendationId(recommendationId);
        setRecommendationModalVisible(true);
    };

    const handlePrescriptionClick = (prescriptionId: string) => {
        setSelectedPrescriptionId(prescriptionId);
        setPrescriptionModalVisible(true);
    };

    return (
        <div className="p-5 max-w-4xl mx-auto space-y-8">
            {role !== "Patient" && (
                <Card
                    bordered={false}
                    className="rounded-lg shadow-lg p-6 bg-white"
                    style={{ boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)" }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <Text strong className="text-base">Ім'я та Прізвище:</Text>
                            <div className="text-sm">
                                {`${patient.FirstName || "—"} ${patient.LastName || "—"}`}
                            </div>
                        </div>
                        <div>
                            <Text strong className="text-base">Email:</Text>
                            <div className="text-sm">{patient.Email || "Не вказано"}</div>
                        </div>
                        <div>
                            <Text strong className="text-base">Телефон:</Text>
                            <div className="text-sm">{patient.PhoneNumber || "Не вказано"}</div>
                        </div>
                        <div>
                            <Text strong className="text-base">Місто:</Text>
                            <div className="text-sm">{patient.City || "Не вказано"}</div>
                        </div>
                        <div>
                            <Text strong className="text-base">Дата народження:</Text>
                            <div className="text-sm">{patient.BirthDate || "Не вказано"}</div>
                        </div>
                        <div>
                            <Text strong className="text-base">Гендер:</Text>
                            <div className="text-sm">{patient.Gender || "Не вказано"}</div>
                        </div>
                    </div>
                </Card>
            )}


            <Alert
                message="Порада"
                description="Щоб переглянути інформацію про лікарський засіб або рекомендацію, натисніть на елемент у таблиці."
                type="info"
                showIcon
                closable
            />

            <Card title="Рецепти" className="shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <Input
                        placeholder="Пошук за назвою ліків"
                        allowClear
                        value={presFilters.medicationName}
                        onChange={(e) => {
                            const value = e.target.value;
                            setPresFilters((prev) => ({ ...prev, medicationName: value }));
                            if (value === "") {
                                loadPrescriptions();
                            }
                        }}
                    />
                    <RangePicker
                        onChange={(dates, dateStrings) =>
                            setPresFilters((prev) => ({
                                ...prev,
                                minDate: dateStrings[0] || undefined,
                                maxDate: dateStrings[1] || undefined,
                            }))
                        }
                        placeholder={["Початок", "Кінець"]}
                    />
                    <Switch
                        checkedChildren="Нові"
                        unCheckedChildren="Старі"
                        checked={presFilters.sortByDescending}
                        onChange={(checked) =>
                            setPresFilters((prev) => ({ ...prev, sortByDescending: checked }))
                        }
                        style={{
                            backgroundColor: presFilters.sortByDescending ? "#76B9FF" : "#FF4B4E",
                            marginTop: "5px",
                        }}
                    />
                </div>
                <Table
                    dataSource={prescriptions}
                    columns={prescriptionColumns}
                    rowKey="Id"
                    pagination={{ position: ["bottomCenter"] }}
                    loading={loadingPrescriptions}
                    bordered
                    onRow={(record) => ({
                        onClick: () => handlePrescriptionClick(record.Id),
                    })}
                />
                {role !== "Patient" && (
                    <div className="flex justify-start mt-4">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setAddPrescriptionModalVisible(true)}
                            style={{
                                backgroundColor: "#FF4B4E",
                                borderColor: "#FF4B4E",
                            }}
                        >
                            Додати рецепт
                        </Button>
                    </div>
                )}
            </Card>


            <Card title="Рекомендації" className="shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <Input
                        placeholder="Пошук за змістом"
                        allowClear
                        value={recFilters.contentSearch}
                        onChange={(e) => {
                            const value = e.target.value;
                            setRecFilters((prev) => ({ ...prev, contentSearch: value }));
                            if (value === "") {
                                loadRecommendations();
                            }
                        }}
                    />
                    <RangePicker
                        onChange={(dates, dateStrings) =>
                            setRecFilters((prev) => ({
                                ...prev,
                                minDate: dateStrings[0] || undefined,
                                maxDate: dateStrings[1] || undefined,
                            }))
                        }
                        placeholder={["Початок", "Кінець"]}
                    />
                    <Switch
                        checkedChildren="Нові"
                        unCheckedChildren="Старі"
                        checked={recFilters.sortByDescending}
                        onChange={(checked) =>
                            setRecFilters((prev) => ({ ...prev, sortByDescending: checked }))
                        }
                        style={{
                            backgroundColor: recFilters.sortByDescending ? "#76B9FF" : "#FF4B4E",
                            marginTop: "5px",
                        }}
                    />
                </div>
                <Table
                    dataSource={recommendations}
                    columns={recommendationColumns}
                    rowKey="Id"
                    pagination={{ position: ["bottomCenter"] }}
                    loading={loadingRecommendations}
                    bordered
                    onRow={(record) => ({
                        onClick: () => handleRecommendationClick(record.Id),
                    })}
                />
                {role !== "Patient" && (
                    <div className="flex justify-start mt-4">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setAddRecommendationModalVisible(true)}
                            style={{
                                backgroundColor: "#FF4B4E",
                                borderColor: "#FF4B4E",
                            }}
                        >
                            Додати рекомендацію
                        </Button>
                    </div>
                )}
            </Card>


            <RecommendationModal
                visible={isRecommendationModalVisible}
                recommendationId={selectedRecommendationId}
                doctorId={doctorId!}
                patientId={patientId!}
                token={token}
                role={role}
                onClose={() => setRecommendationModalVisible(false)}
            />

            <PrescriptionModal
                visible={isPrescriptionModalVisible}
                prescriptionId={selectedPrescriptionId}
                doctorId={doctorId!}
                patientId={patientId!}
                token={token}
                role={role}
                onClose={() => setPrescriptionModalVisible(false)}
            />

            <AddRecommendationModal
                visible={isAddRecommendationModalVisible}
                onClose={() => setAddRecommendationModalVisible(false)}
                doctorId={doctorId!}
                patientId={patientId!}
                medicalRecordId={patient.MedicalRecordId}
                token={token}
                refreshRecommendations={loadRecommendations}
            />

            <AddPrescriptionModal
                visible={isAddPrescriptionModalVisible}
                onClose={() => setAddPrescriptionModalVisible(false)}
                doctorId={doctorId!}
                patientId={patientId!}
                medicalRecordId={patient.MedicalRecordId}
                token={token}
                refreshPrescriptions={loadPrescriptions}
            />
        </div>
    );
};

export default PatientProfile;
