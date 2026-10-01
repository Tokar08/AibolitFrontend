import React, { useState, useRef } from "react";
import {
    Modal,
    Form,
    Input,
    Button,
    Upload,
    notification,
    Spin,
    InputNumber,
} from "antd";
import Draggable from "react-draggable";
import type { DraggableEvent, DraggableData } from "react-draggable";
import { RcFile } from "antd/es/upload";
import { createDoctor, createDoctorPhoto } from "../api/doctor";

interface AddDoctorModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: () => void;
    token: string;
    hospitalId: string;
}

const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
                                                           open,
                                                           onClose,
                                                           onAdd,
                                                           token,
                                                           hospitalId,
                                                       }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [photoFile, setPhotoFile] = useState<RcFile | null>(null);
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handlePhotoSelect = (file: RcFile) => {
        const validTypes = ["image/jpeg", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            notification.error({
                message: "Помилка завантаження",
                description: "Допустимі лише формати JPG та JPEG.",
            });
            return false;
        }

        setPhotoFile(file);
        return false;
    };

    const handleAddDoctor = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            let photoUrl = null;

            if (photoFile) {
                const formData = new FormData();
                formData.append("file", photoFile);

                const uploadResponse = await createDoctorPhoto(formData, token);
                photoUrl = uploadResponse.fileUrl;
            }

            const doctorData = {
                specializationTitle: values.specializationTitle,
                hospitalId,
                yearsOfExperience: values.yearsOfExperience,
                education: values.education,
                photoUrl: photoUrl || null,
                visitCount: 0,
            };

            console.log("Данные для отправки на сервер:", doctorData);

            await createDoctor(doctorData, values.keycloakId, token);

            notification.success({
                message: "Лікаря додано",
                description: "Новий лікар успішно доданий.",
            });
            setPosition({ x: 0, y: 0 });
            onAdd();
            onClose();
        } catch (error: any) {
            console.error("Ошибка добавления врача:", error.response?.data || error.message);
            notification.error({
                message: "Помилка додавання",
                description: error.response?.data?.message || "Перевірте правильність даних і спробуйте ще раз.",
            });
        } finally {
            setLoading(false);
        }
    };

    const onStart = (_: DraggableEvent, uiData: DraggableData) => {
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

    const handleDrag = (_: DraggableEvent, ui: DraggableData) => {
        setPosition({ x: ui.x, y: ui.y });
    };

    return (
        <Modal
            title={
                <div
                    style={{ width: "100%", cursor: "move" }}
                    onMouseOver={() => setDisabled(false)}
                    onMouseOut={() => setDisabled(true)}
                >
                    Додати нового лікаря
                </div>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            footer={[
                <Button
                    key="cancel"
                    onClick={onClose}
                    style={{ backgroundColor: "#FF4B4E", color: "#fff" }}
                >
                    Скасувати
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleAddDoctor}
                >
                    Додати
                </Button>,
            ]}
            modalRender={(modal) => (
                <Draggable
                    disabled={disabled}
                    bounds={bounds}
                    position={position}
                    nodeRef={draggleRef}
                    onStart={onStart}
                    onDrag={handleDrag}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
            )}
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="keycloakId"
                        label="Keycloak ID"
                        rules={[{ required: true, message: "Будь ласка, введіть Keycloak ID" }]}
                    >
                        <Input placeholder="Введіть Keycloak ID"  allowClear/>
                    </Form.Item>
                    <Form.Item
                        name="specializationTitle"
                        label="Спеціалізація"
                        rules={[{ required: true, message: "Будь ласка, вкажіть спеціалізацію" }]}
                    >
                        <Input placeholder="Введіть спеціалізацію"  allowClear/>
                    </Form.Item>
                    <Form.Item
                        name="yearsOfExperience"
                        label="Досвід роботи (роки)"
                        rules={[
                            { required: true, message: "Будь ласка, введіть досвід роботи" },
                            { type: "number", min: 1, max: 50, message: "Значення має бути від 1 до 50" },
                        ]}
                    >
                        <InputNumber placeholder="Введіть роки досвіду" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="education"
                        label="Освіта"
                        rules={[{ required: true, message: "Будь ласка, введіть освіту" }]}
                    >
                        <Input placeholder="Введіть освіту"  allowClear/>
                    </Form.Item>
                    <Form.Item>
                        <Upload
                            showUploadList={false}
                            beforeUpload={handlePhotoSelect}
                            accept=".jpg,.jpeg"
                        >
                            <Button>Завантажити фото</Button>
                        </Upload>
                        {photoFile && (
                            <div style={{ marginTop: "20px" }}>
                                <img
                                    src={URL.createObjectURL(photoFile)}
                                    alt="Фото лікаря"
                                    style={{
                                        width: "150px",
                                        height: "150px",
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                    }}
                                />
                            </div>
                        )}
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default AddDoctorModal;
