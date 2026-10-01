import React, { useRef, useState } from "react";
import { Modal, Input, Alert, Upload, notification, Spin } from "antd";
import type { DraggableData, DraggableEvent } from "react-draggable";
import Draggable from "react-draggable";
import {
    fetchDoctorDetails,
    updateDoctorWithPhotoPath,
    updateDoctorWorkSchedules,
    uploadDoctorPhoto,
} from "../api/doctor";

interface ProfileModalProps {
    role: string;
    additionalData: any;
    open: boolean;
    onClose: () => void;
    onPhotoUpdate: (newPhotoUrl: string) => void;
    token: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
                                                       role,
                                                       additionalData,
                                                       open,
                                                       onClose,
                                                       onPhotoUpdate,
                                                       token,
                                                   }) => {
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null);
    const [api, contextHolder] = notification.useNotification();
    const [isUploading, setIsUploading] = useState(false);

    const onStart = (event: DraggableEvent, uiData: DraggableData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) return;

        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };

    const handlePhotoUpload = async (file: File) => {
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const newPhotoUrl = await uploadDoctorPhoto(formData, token);

            console.log("Отримано URL нового фото:", newPhotoUrl);

            const doctorData = await fetchDoctorDetails(additionalData.id, token);

            console.log("Завантажені дані лікаря:", doctorData);

            const { Patients, LikedByPatients, WorkSchedules, ...filteredPayload } = doctorData;

            const updatedPayload = {
                ...filteredPayload,
                PhotoUrl: newPhotoUrl,
            };

            console.log("Фінальні дані для відправки лікаря (без WorkSchedules):", updatedPayload);

            await updateDoctorWithPhotoPath(additionalData.id, updatedPayload, token);

            if (WorkSchedules && WorkSchedules.length > 0) {
                const workSchedulesForPatch = WorkSchedules.map((schedule: any) => ({
                    id: schedule.Id,
                    dayOfWeek: schedule.DayOfWeek,
                    startTime: schedule.StartTime,
                    endTime: schedule.EndTime,
                    isActive: schedule.IsActive,
                }));

                console.log("Сформовані WorkSchedules для відправки:", workSchedulesForPatch);

                await updateDoctorWorkSchedules(additionalData.id, workSchedulesForPatch, token);
            } else {
                console.log("WorkSchedules відсутні або не потребують оновлення.");
            }

            onPhotoUpdate(newPhotoUrl);

            api.success({
                message: "Фото оновлено",
                description: "Ваше фото успішно оновлено.",
                duration: 3,
            });
        } catch (error: any) {
            console.error("Помилка оновлення лікаря:", error);
            api.error({
                message: "Помилка оновлення",
                description: error.message || "Не вдалося оновити дані лікаря. Спробуйте ще раз.",
                duration: 5,
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={
                    <div
                        style={{ width: "100%", cursor: "move" }}
                        onMouseOver={() => setDisabled(false)}
                        onMouseOut={() => setDisabled(true)}
                    >
                        Інформація про профіль
                    </div>
                }
                open={open}
                onCancel={onClose}
                footer={null}
                modalRender={(modal) => (
                    <Draggable
                        disabled={disabled}
                        bounds={bounds}
                        nodeRef={draggleRef}
                        onStart={(event, uiData) => onStart(event as DraggableEvent, uiData)}
                    >
                        <div ref={draggleRef}>{modal}</div>
                    </Draggable>
                )}
            >
                <Spin spinning={isUploading}>
                    <Alert
                        message="Зміна даних"
                        description="Змінити основний номер телефону, особисті дані та документи можна лише у реєстратурі лікарні."
                        type="warning"
                        showIcon
                        className="mb-4"
                    />
                    {role === "Doctor" || role === "ChiefDoctor" ? (
                        <div className="profile-photo" style={{ textAlign: "center", marginBottom: "20px" }}>
                            <Upload
                                showUploadList={false}
                                beforeUpload={handlePhotoUpload}
                                accept=".jpg,.jpeg"
                            >
                                <div
                                    style={{
                                        display: "inline-block",
                                        cursor: "pointer",
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        width: "150px",
                                        height: "150px",
                                        background: "#f0f0f0",
                                        position: "relative",
                                    }}
                                >
                                    <img
                                        src={additionalData?.photoUrl || "https://via.placeholder.com/150"}
                                        alt="Профіль"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                            </Upload>
                        </div>
                    ) : null}
                    <div className="profile-fields">
                        <div className="field">
                            <label>Ім'я</label>
                            <Input value={additionalData?.firstName || "Немає даних"} disabled />
                        </div>
                        <div className="field">
                            <label>Прізвище</label>
                            <Input value={additionalData?.lastName || "Немає даних"} disabled />
                        </div>
                        <div className="field">
                            <label>Email</label>
                            <Input value={additionalData?.email || "Немає даних"} disabled />
                        </div>
                        <div className="field">
                            <label>Дата народження</label>
                            <Input value={additionalData?.birthDate || "Немає даних"} disabled />
                        </div>
                        <div className="field">
                            <label>Номер телефону</label>
                            <Input value={additionalData?.phoneNumber || "Немає даних"} disabled />
                        </div>
                        <div className="field">
                            <label>Гендер</label>
                            <Input value={additionalData?.gender || "Немає даних"} disabled />
                        </div>
                        <div className="field">
                            <label>Місто</label>
                            <Input value={additionalData?.city || "Немає даних"} disabled />
                        </div>
                        {(role === "Doctor" || role === "ChiefDoctor") && (
                            <>
                                <div className="field">
                                    <label>Спеціалізація</label>
                                    <Input value={additionalData?.specializationTitle || "Немає даних"} disabled />
                                </div>
                                <div className="field">
                                    <label>Освіта</label>
                                    <Input value={additionalData?.education || "Немає даних"} disabled />
                                </div>
                                <div className="field">
                                    <label>Роки досвіду</label>
                                    <Input value={additionalData?.yearsOfExperience || "Немає даних"} disabled />
                                </div>
                            </>
                        )}
                    </div>
                </Spin>
            </Modal>
        </>
    );
};

export default ProfileModal;
