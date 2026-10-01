import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, Form, Spin, Input, Upload, notification, InputNumber, Popconfirm } from "antd";
import { RcFile } from "antd/es/upload";
import Draggable from "react-draggable";
import {
    fetchDoctorDetails,
    updateDoctorWithPhotoPath,
    updateDoctorWorkSchedules,
    uploadDoctorPhoto
} from "../api/doctor";

interface EditDoctorModalProps {
    doctorId: string;
    open: boolean;
    onClose: () => void;
    onUpdate: () => void;
    token: string;
}

const EditDoctorModal: React.FC<EditDoctorModalProps> = ({
                                                             doctorId,
                                                             open,
                                                             onClose,
                                                             onUpdate,
                                                             token,
                                                         }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [newPhotoUrl, setNewPhotoUrl] = useState<string | null>(null);
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open && doctorId) {
            loadDoctorDetails();
        }
    }, [open, doctorId]);

    const loadDoctorDetails = async () => {
        setLoading(true);
        try {
            const doctorData = await fetchDoctorDetails(doctorId, token);
            setPhotoUrl(doctorData.PhotoUrl || null);
            form.setFieldsValue({
                specialization: doctorData.SpecializationTitle,
                yearsOfExperience: doctorData.YearsOfExperience,
                education: doctorData.Education,
            });
        } catch (error) {
            notification.error({
                message: "Помилка завантаження даних",
                description: "Не вдалося завантажити дані лікаря. Спробуйте пізніше.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (file: RcFile) => {
        const validTypes = ["image/jpeg", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            notification.error({
                message: "Помилка завантаження",
                description: "Допустимі лише формати JPG та JPEG.",
                duration: 5,
            });
            return false;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const fileUrl = await uploadDoctorPhoto(formData, token);
            setNewPhotoUrl(fileUrl);
            setPhotoUrl(fileUrl);

            notification.success({
                message: "Фото завантажено",
                description: "Ваше фото успішно завантажено.",
                duration: 3,
            });
        } catch (error) {
            notification.error({
                message: "Помилка завантаження",
                description: "Не вдалося завантажити фото. Спробуйте ще раз.",
            });
        } finally {
            setLoading(false);
        }

        return false;
    };

    const handleSave = async () => {
        try {
            const updatedData = await form.validateFields();
            setLoading(true);

            const doctorData = await fetchDoctorDetails(doctorId, token);

            const updatedDoctorData = {
                ...doctorData,
                SpecializationTitle: updatedData.specialization,
                YearsOfExperience: updatedData.yearsOfExperience,
                Education: updatedData.education,
                PhotoUrl: newPhotoUrl || doctorData.PhotoUrl,
            };

            const filteredPayload = JSON.parse(
                JSON.stringify(updatedDoctorData, (key, value) => {
                    if (key === "WorkSchedules") return undefined;
                    return value;
                })
            );

            console.log("Финальные данные для отправки врача:", filteredPayload);

            await updateDoctorWithPhotoPath(doctorId, filteredPayload, token);

            const workSchedules = doctorData.WorkSchedules?.map((schedule: any) => ({
                id: schedule.Id,
            }));

            if (workSchedules && workSchedules.length > 0) {
                console.log("Обновляем WorkSchedules через PATCH:", workSchedules);
                await updateDoctorWorkSchedules(doctorId, workSchedules, token);
            } else {
                console.warn("Нет валидных данных расписания для обновления.");
            }

            notification.success({
                message: "Дані оновлено",
                description: "Інформацію про лікаря успішно оновлено.",
            });

            onUpdate();
            onClose();
        } catch (error: any) {
            console.error("Ошибка обновления врача:", error);
            notification.error({
                message: "Помилка оновлення",
                description: "Перевірте правильність даних і спробуйте ще раз.",
            });
        } finally {
            setLoading(false);
        }
    };



    const onStart = (event: any, uiData: any) => {
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

    return (
        <Modal
            title={
                <div
                    style={{ width: "100%", cursor: "move" }}
                    onMouseOver={() => setDisabled(false)}
                    onMouseOut={() => setDisabled(true)}
                >
                    Редагування інформації про лікаря
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="cancel"
                        onClick={onClose}
                        style={{ backgroundColor: "#FF4B4E", color: "#fff" }}>
                    Скасувати
                </Button>,
                <Popconfirm
                    title="Ви впевнені, що хочете зберегти зміни?"
                    onConfirm={handleSave}
                    okText="Так"
                    cancelText="Ні"
                >
                    <Button key="submit" type="primary">
                        Зберегти
                    </Button>
                </Popconfirm>,
            ]}
            modalRender={(modal) => (
                <Draggable
                    disabled={disabled}
                    bounds={bounds}
                    nodeRef={draggleRef}
                    onStart={onStart}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
            )}
            centered
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical">
                    <Form.Item>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                margin: "20px auto",
                            }}
                        >
                            <Upload
                                showUploadList={false}
                                beforeUpload={handlePhotoUpload}
                                accept=".jpg,.jpeg"
                            >
                                <div
                                    style={{
                                        cursor: "pointer",
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        width: "150px",
                                        height: "150px",
                                    }}
                                >
                                    <img
                                        src={photoUrl || "https://via.placeholder.com/150"}
                                        alt="Фото профілю"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                            </Upload>
                        </div>
                    </Form.Item>
                    <Form.Item
                        name="specialization"
                        label="Спеціалізація"
                        rules={[{ required: true, message: "Будь ласка, вкажіть спеціалізацію" }]}
                    >
                        <Input placeholder="Введіть спеціалізацію"  allowClear/>
                    </Form.Item>
                    <Form.Item
                        name="yearsOfExperience"
                        label="Досвід роботи (роки)"
                        rules={[
                            { required: true, message: "Будь ласка, вкажіть досвід роботи" },
                            { type: "number", min: 1, max: 50, message: "Значення має бути від 1 до 50" },
                        ]}
                    >
                        <InputNumber
                            placeholder="Введіть роки досвіду"
                            style={{ width: "100%" }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="education"
                        label="Освіта"
                        rules={[{ required: true, message: "Будь ласка, вкажіть освіту" }]}
                    >
                        <Input placeholder="Введіть освіту"  allowClear/>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default EditDoctorModal;
