import React, { useState, useRef } from "react";
import { Modal, Input, notification, Alert } from "antd";
import Draggable from "react-draggable";
import type { DraggableEvent, DraggableData } from "react-draggable";
import { createRecommendation } from "../api/doctor";

interface AddRecommendationModalProps {
    visible: boolean;
    onClose: () => void;
    doctorId: string;
    patientId: string;
    medicalRecordId: string;
    token: string;
    refreshRecommendations: () => void;
}

const AddRecommendationModal: React.FC<AddRecommendationModalProps> = ({
                                                                           visible,
                                                                           onClose,
                                                                           doctorId,
                                                                           patientId,
                                                                           medicalRecordId,
                                                                           token,
                                                                           refreshRecommendations,
                                                                       }) => {
    const [content, setContent] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const draggleRef = useRef<HTMLDivElement>(null);

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

    const handleAddRecommendation = async () => {
        if (!content.trim()) {
            notification.error({ message: "Помилка", description: "Поле рекомендації не може бути порожнім." });
            return;
        }

        setIsLoading(true);
        try {
            const recommendationData = {
                content,
                recommendationDate: new Date().toISOString(),
                medicalRecordId,
                isActive: true,
            };
            await createRecommendation(doctorId, patientId, recommendationData, token);
            notification.success({ message: "Рекомендацію додано успішно!" });
            refreshRecommendations();
            setContent("");
            onClose();
        } catch (error) {
            notification.error({ message: "Помилка додавання рекомендації." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div
                    style={{ width: "100%", cursor: "move" }}
                    onMouseOver={() => setDisabled(false)}
                    onMouseOut={() => setDisabled(true)}
                >
                    Додати рекомендацію
                </div>
            }
            open={visible}
            onOk={handleAddRecommendation}
            onCancel={onClose}
            confirmLoading={isLoading}
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
            <Alert
                message="Увага"
                description="Будьте уважні при вводі даних. Їх неможливо видалити після створення."
                type="warning"
                showIcon
                className="mb-4"
            />
            <Input.TextArea
                allowClear
                placeholder="Введіть текст рекомендації"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
        </Modal>
    );
};

export default AddRecommendationModal;
