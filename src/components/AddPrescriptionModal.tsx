import React, { useState, useRef } from "react";
import { Modal, Input, notification, Alert } from "antd";
import Draggable from "react-draggable";
import type { DraggableEvent, DraggableData } from "react-draggable";
import { createPrescription } from "../api/doctor";

interface AddPrescriptionModalProps {
    visible: boolean;
    onClose: () => void;
    doctorId: string;
    patientId: string;
    medicalRecordId: string;
    token: string;
    refreshPrescriptions: () => void;
}

const AddPrescriptionModal: React.FC<AddPrescriptionModalProps> = ({
                                                                       visible,
                                                                       onClose,
                                                                       doctorId,
                                                                       patientId,
                                                                       medicalRecordId,
                                                                       token,
                                                                       refreshPrescriptions,
                                                                   }) => {
    const [medicationName, setMedicationName] = useState("");
    const [dosage, setDosage] = useState("");
    const [instructions, setInstructions] = useState("");
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

    const handleAddPrescription = async () => {
        if (!medicationName.trim() || !dosage.trim() || !instructions.trim()) {
            notification.error({ message: "Помилка", description: "Всі поля повинні бути заповнені." });
            return;
        }

        setIsLoading(true);
        try {
            const prescriptionData = {
                medicationName,
                dosage,
                instructions,
                prescriptionDate: new Date().toISOString(),
                medicalRecordId,
                isActive: true,
            };
            await createPrescription(doctorId, patientId, prescriptionData, token);
            notification.success({ message: "Рецепт додано успішно!" });
            refreshPrescriptions();
            setMedicationName("");
            setDosage("");
            setInstructions("");
            onClose();
        } catch (error) {
            notification.error({ message: "Помилка додавання рецепту." });
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
                    Додати рецепт
                </div>
            }
            open={visible}
            onOk={handleAddPrescription}
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
            <Input
                placeholder="Назва ліків"
                value={medicationName}
                allowClear
                onChange={(e) => setMedicationName(e.target.value)}
                style={{ marginBottom: "10px" }}
            />
            <Input
                placeholder="Дозування"
                value={dosage}
                allowClear
                onChange={(e) => setDosage(e.target.value)}
                style={{ marginBottom: "10px" }}
            />
            <Input.TextArea
                placeholder="Інструкції"
                rows={4}
                allowClear
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
            />
        </Modal>
    );
};

export default AddPrescriptionModal;
