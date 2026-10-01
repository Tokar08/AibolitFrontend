import React, { useEffect, useState, useCallback } from "react";
import { Spin, Typography, Button, Result } from "antd";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import RoleBasedGuard from "./components/RoleBasedGuard";
import DiseaseSearch from "./pages/DiseaseSearch";
import KnowledgeBase from "./pages/KnowledgeBase";
import ManageDoctors from "./pages/ManageDoctors";
import ChiefDoctorStatistics from "./pages/ChiefDoctorStatistics";
import { initKeycloak, createPatient, fetchUserData, logout, getKeycloakInstance } from "./api/keycloak";
import axios from "axios";
import DoctorProfile from "./components/DoctorProfile";
import PatientProfile from "./components/PatientProfile";
import ManageSchedules from "./pages/ManageSchedules";
import ManagePatients from "./pages/ManagePatients";
import AppointmentsPage from "./pages/AppointmentsPage";
import DoctorsPage from "./pages/DoctorsPage";
import {NotFoundPage} from "./pages/NotFoundPage";

const { Title } = Typography;

axios.defaults.baseURL = "https://localhost:44321";

const App: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [authToken, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (userData?.role && window.location.pathname !== "/") {
            window.history.replaceState({}, document.title, "/");
        }
    }, [userData?.role]);

    const fetchUserWithRetry = useCallback(async (token: string, retriesLeft = 3): Promise<any> => {
        try {
            const user = await fetchUserData(token);
            console.table(user);
            return user;
        } catch (fetchError) {
            if (retriesLeft > 0) {
                console.warn(`Помилка отримання даних, спроб залишилося: ${retriesLeft}. Повтор...`);
                await new Promise((resolve) => setTimeout(resolve, 100));
                return fetchUserWithRetry(token, retriesLeft - 1);
            }
            throw fetchError;
        }
    }, []);

    const initializeKeycloakAndHandleUser = useCallback(async () => {
        setError(null);
        setLoading(true);

        try {
            const keycloakInstance = await initKeycloak();

            if (keycloakInstance.authenticated) {
                const token = keycloakInstance.token!;
                console.log("Токен Keycloak:", token);
                setToken(token);
                try {
                    const user = await fetchUserWithRetry(token);
                    if (!user?.role) {
                        throw new Error("Роль користувача відсутня. Перевірте API.");
                    }
                    setUserData(user);
                } catch (fetchError) {
                    console.warn("Користувача не знайдено, створюємо нового...");
                    try {
                        await createPatient(token);
                        console.log("Користувач успішно створений. Повторний запит даних...");
                        const user = await fetchUserWithRetry(token);
                        if (!user?.role) {
                            throw new Error("Роль користувача відсутня. Перевірте API.");
                        }
                        setUserData(user);
                    } catch (createError) {
                        console.error("Помилка створення користувача:", createError);
                        setError(
                            "На жаль, нам не вдалося створити користувача. Перевірте правильність введених даних (наприклад, дата народження у майбутньому)."
                        );
                    }
                }
            } else {
                console.warn("Сесія Keycloak не активна. Перенаправлення на вхід...");
                await keycloakInstance.login();
            }
        } catch (err) {
            console.error("Помилка ініціалізації Keycloak:", err);
            setError("На жаль, ми не змогли ініціалізувати додаток. Будь ласка, спробуйте ще раз.");
        } finally {
            setLoading(false);
        }
    }, [fetchUserWithRetry]);

    useEffect(() => {
        initializeKeycloakAndHandleUser();
    }, [initializeKeycloakAndHandleUser]);

    const handleRetry = async () => {
        console.log("Повторна спроба входу...");
        try {
            const keycloakInstance = getKeycloakInstance();
            await keycloakInstance.login({
                redirectUri: window.location.href,
            });
        } catch (err) {
            console.error("Помилка повторного входу:", err);
        }
    };

    const handleLogout = async () => {
        console.log("Вихід із системи...");
        await logout();
        setUserData(null);
        setToken(null);
        window.location.href = window.location.origin;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin tip="Завантаження даних..." size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Result
                    status="error"
                    title={<Title level={5}>{error}</Title>}
                    extra={
                        <Button type="primary" size="large" onClick={handleRetry}>
                            Спробувати знову
                        </Button>
                    }
                />
            </div>
        );
    }

    const DoctorRoutes = () => (
        <RoleBasedGuard role={userData?.role} allowedRoles={["Doctor"]}>
            <Routes>
                <Route path="/" element={<Navigate to="/doctor/manage-patients" replace />} />
                <Route
                    path="/doctor/appointments"
                    element={
                        <AppointmentsPage
                            doctorId={userData?.additionalData?.id}
                            token={authToken!}
                            role="Doctor"
                        />
                    }
                />


                <Route
                    path="/doctor/manage-patients"
                    element={
                        <ManagePatients
                            doctorId={userData?.additionalData?.id}
                            hospitalId={userData?.additionalData?.hospitalId}
                            token={authToken!}
                            role="Doctor"
                        />
                    }
                />
                <Route
                    path="/doctor/manage-patients/:id"
                    element={<PatientProfile token={authToken!} role={userData?.role} />}
                />
                <Route
                    path="/disease-search"
                    element={
                        <DiseaseSearch token={authToken!} />
                    }
                />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </RoleBasedGuard>
    );


    const AdminRoutes = () => (
        <RoleBasedGuard role={userData?.role} allowedRoles={["Administrator"]}>
            <Routes>
                <Route path="/" element={<Navigate to="/admin/doctors" replace />} />

                <Route
                    path="/admin/knowledge"
                    element={<KnowledgeBase />}
                />
                <Route
                    path="/admin/doctors"
                    element={
                        <ManageDoctors
                            hospitalId={userData?.additionalData?.managedHospitalId}
                            token={authToken!}
                            role="Administrator"
                        />
                    }
                />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />

            </Routes>
        </RoleBasedGuard>
    );


    const ChiefDoctorRoutes = () => (
        <RoleBasedGuard role={userData?.role} allowedRoles={["ChiefDoctor"]}>
            <Routes>
                <Route path="/" element={<Navigate to="/chief-doctor/statistics" replace />} />
                <Route
                    path="/chief-doctor/appointments"
                    element={
                        <AppointmentsPage
                            doctorId={userData?.additionalData?.id}
                            token={authToken!}
                            role="Doctor"
                        />
                    }
                />

                <Route
                    path="/chief-doctor/statistics"
                    element={
                        <ChiefDoctorStatistics
                            hospitalId={userData?.additionalData?.hospitalId}
                            token={authToken!}
                        />
                    }
                />
                <Route
                    path="/chief-doctor/doctors"
                    element={
                        <ManageDoctors
                            hospitalId={userData?.additionalData?.hospitalId}
                            token={authToken!}
                            role="ChiefDoctor"
                        />
                    }
                />
                <Route
                    path="/chief-doctor/doctors/:id"
                    element={<DoctorProfile token={authToken!} />}
                />
                <Route
                    path="/chief-doctor/doctors/:doctorId/patients/:id"
                    element={<PatientProfile token={authToken!} role={userData?.role} />}
                />
                <Route
                    path="/chief-doctor/schedules"
                    element={
                        <ManageSchedules
                            token={authToken!}
                        />
                    }
                />
                <Route
                    path="/chief-doctor/manage-patients"
                    element={
                        <ManagePatients
                            doctorId={userData?.additionalData?.id}
                            hospitalId={userData?.additionalData?.hospitalId}
                            token={authToken!}
                            role="ChiefDoctor"
                        />
                    }
                />
                <Route
                    path="/chief-doctor/manage-patients/:id"
                    element={
                        <PatientProfile
                            token={authToken!}
                            role={userData?.role}
                        />
                    }
                />
                <Route
                    path="/disease-search"
                    element={
                        <DiseaseSearch token={authToken!}/>
                    }
                />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />

            </Routes>
        </RoleBasedGuard>
    );

    const PatientRoutes = () => (
        <RoleBasedGuard role={userData?.role} allowedRoles={["Patient"]}>
            <Routes>
                <Route path="/" element={<Navigate to="/patient/doctors" replace />} />
                <Route
                    path="/patient/:id/medical-card"
                    element={<PatientProfile token={authToken!} role={userData?.role} />}
                />
                <Route
                    path="/patient/doctors"
                    element={<DoctorsPage token={authToken!} patientId={userData?.additionalData?.id} />}
                />
                <Route
                    path="/patient/appointments"
                    element={
                        <AppointmentsPage
                            token={authToken!}
                            patientId={userData?.additionalData?.id}
                            role="Patient"
                        />
                    }
                />
                <Route
                    path="/disease-search"
                    element={
                        <DiseaseSearch token={authToken!}/>
                    }
                />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </RoleBasedGuard>
    );



    return (
        <div className="pt-16">
            <Router>
                <Navbar
                    role={userData?.role || "Unknown"}
                    onLogout={handleLogout}
                    photoUrl={userData?.additionalData?.photoUrl}
                    user={userData}
                    additionalData={userData?.additionalData || {}}
                />
                {userData?.role === "Administrator" && <AdminRoutes/>}
                {userData?.role === "ChiefDoctor" && <ChiefDoctorRoutes/>}
                {userData?.role === "Doctor" && <DoctorRoutes/>}
                {userData?.role === "Patient" && <PatientRoutes />}
            </Router>

        </div>
    );

};

export default App;
