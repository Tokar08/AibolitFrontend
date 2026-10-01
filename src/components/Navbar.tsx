import React, { useState } from "react";
import { Avatar, Button, Drawer, Dropdown, Menu } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";

interface NavbarProps {
    role: string;
    onLogout: () => Promise<void>;
    photoUrl?: string;
    user: any;
    additionalData: any;
}

const Navbar: React.FC<NavbarProps> = ({ role, onLogout, photoUrl, user, additionalData }) => {
    const navigate = useNavigate();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [profileVisible, setProfileVisible] = useState(false);
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl);

    const handlePhotoUpdate = (newPhotoUrl: string) => {
        setCurrentPhotoUrl(newPhotoUrl);
        additionalData.photoUrl = newPhotoUrl;
    };

    const items = [
        ...(role === "Administrator"
            ? [
                { key: "doctors", label: "Керування лікарями", onClick: () => navigate("/admin/doctors") },
                { key: "knowledge", label: "База знань", onClick: () => navigate("/admin/knowledge") },
                {
                    key: "adminPanel",
                    label: "Адмінська панель",
                    onClick: () => window.open("http://localhost:8081/admin/master/console/#/aibolit-api/", "_blank"),
                },
            ]
            : []),
        ...(role === "ChiefDoctor"
            ? [
                { key: "statistics", label: "Статистика", onClick: () => navigate("/chief-doctor/statistics") },
                { key: "doctors", label: "Всі лікарі", onClick: () => navigate("/chief-doctor/doctors") },
                { key: "schedules", label: "Управління розкладом", onClick: () => navigate("/chief-doctor/schedules") },
                { key: "managePatients", label: "Керування пацієнтами", onClick: () => navigate("/chief-doctor/manage-patients") },
                { key: "appointments", label: "Мої записи", onClick: () => navigate("/chief-doctor/appointments") },
            ]
            : []),
        ...(role === "Doctor"
            ? [
                { key: "managePatients", label: "Керування пацієнтами", onClick: () => navigate("/doctor/manage-patients") },
                { key: "appointments", label: "Мої записи", onClick: () => navigate("/doctor/appointments") },
            ]
            : []),
        ...(role === "Patient"
            ? [
                {
                    key: "medicalCard",
                    label: "Мед. карта",
                    onClick: () => navigate(`/patient/${additionalData?.id}/medical-card`),
                },
                {
                    key: "doctors",
                    label: "Лікарі",
                    onClick: () => navigate(`/patient/doctors`),
                },
                {
                    key: "appointments",
                    label: "Мої записи",
                    onClick: () => navigate(`/patient/appointments`),
                },
            ]
            : []),
        ...(role === "ChiefDoctor" || role === "Doctor" || role === "Patient"
            ? [
                {
                    key: "diseaseSearch",
                    label: "Пошук захворювання",
                    onClick: () => navigate("/disease-search"),
                },
            ]
            : []),
    ];

    const menu = (
        <Menu>
            <Menu.Item key="profile" onClick={() => setProfileVisible(true)}>
                Переглянути профіль
            </Menu.Item>
            <Menu.Item key="logout" danger onClick={onLogout}>
                Вийти
            </Menu.Item>
        </Menu>
    );

    
    return (
        <div
            className={`fixed top-0 w-full lg:w-[70%] left-1/2 transform -translate-x-1/2 bg-white shadow-lg z-50 flex justify-between items-center px-4 h-16 ${
                role === "ChiefDoctor" ? "max-w-[1100px]" : "max-w-[800px]"
            } rounded-b-lg`}
        >
            <img
                src="https://storage.googleapis.com/aibolit-bucket/system/aibolit-logo.jpg"
                alt="Logo"
                className="h-10"
            />
            <div className="lg:hidden">
                <Button
                    icon={<MenuOutlined />}
                    size="large"
                    onClick={() => setDrawerVisible(true)}
                />
            </div>
            <Menu
                mode="horizontal"
                className="hidden lg:flex flex-grow justify-center"
                items={items.map((item) => ({ ...item, key: item.key }))}
            />
            <Dropdown
                overlay={menu}
                placement="bottomRight"
                arrow
                trigger={["click"]}
                className="hidden lg:block"
            >
                <Avatar
                    size="large"
                    src={currentPhotoUrl || undefined}
                    icon={!currentPhotoUrl ? <UserOutlined /> : undefined}
                    className="cursor-pointer"
                />
            </Dropdown>
            <Drawer
                title={null}
                placement="right"
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
                bodyStyle={{ padding: 0 }}
            >
                <div className="p-6 flex justify-center">
                    <Avatar
                        size={80}
                        src={photoUrl || undefined}
                        icon={!photoUrl ? <UserOutlined /> : undefined}
                    />
                </div>
                <Menu
                    mode="vertical"
                    items={items.map((item) => ({
                        ...item,
                        key: item.key,
                        onClick: () => {
                            setDrawerVisible(false);
                            item.onClick();
                        },
                    }))}
                />
                <Button
                    type="primary"
                    danger
                    block
                    className="mt-4"
                    onClick={onLogout}
                >
                    Вийти
                </Button>
            </Drawer>
            <ProfileModal
                role={role}
                additionalData={additionalData}
                open={profileVisible}
                onClose={() => setProfileVisible(false)}
                onPhotoUpdate={handlePhotoUpdate}
                token={user?.token}
            />
        </div>
    );
};

export default Navbar;
