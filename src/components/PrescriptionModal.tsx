import React, { useState, useRef, useEffect } from "react";
import {Modal, Typography, Spin, Divider} from "antd";
import Draggable from "react-draggable";
import type { DraggableEvent, DraggableData } from "react-draggable";
import { fetchPrescriptionDetails, fetchDoctorDetails } from "../api/doctor";
import dayjs from "dayjs";
import {fetchPrescriptionDetailsByPatient} from "../api/patient";

const { Title, Text } = Typography;

interface PrescriptionModalProps {
    visible: boolean;
    prescriptionId: string | null;
    doctorId: string;
    patientId: string;
    token: string;
    role: "Doctor" | "ChiefDoctor" | "Patient";
    onClose: () => void;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
                                                                 visible,
                                                                 prescriptionId,
                                                                 doctorId,
                                                                 patientId,
                                                                 token,
                                                                 role,
                                                                 onClose,
                                                             }) => {
    const [prescription, setPrescription] = useState<any>(null);
    const [doctorDetails, setDoctorDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
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

    useEffect(() => {
        const fetchDetails = async () => {
            if (!prescriptionId) return;

            setLoading(true);
            try {
                let prescriptionData;

                if (role === "Patient") {
                    prescriptionData = await fetchPrescriptionDetailsByPatient(patientId, prescriptionId, token);
                } else {
                    prescriptionData = await fetchPrescriptionDetails(doctorId, patientId, prescriptionId, token);
                }

                setPrescription(prescriptionData);


                const doctorData = await fetchDoctorDetails(prescriptionData.doctorId, token);
                setDoctorDetails(doctorData);

            } catch (error) {
                console.error("Ошибка загрузки деталей рецепта:", error);
            } finally {
                setLoading(false);
            }
        };

        if (visible) fetchDetails();
    }, [visible, prescriptionId, doctorId, patientId, token, role]);

    if (loading) {
        return (
            <Modal
                visible={visible}
                onCancel={onClose}
                footer={null}
                centered
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
                <div className="flex justify-center items-center min-h-[200px]">
                    <Spin size="large" />
                </div>
            </Modal>
        );
    }

    if (!prescription) {
        return null;
    }

    return (
        <Modal
            title={
                <div
                    style={{ width: "100%", cursor: "move" }}
                    onMouseOver={() => setDisabled(false)}
                    onMouseOut={() => setDisabled(true)}
                >
                    Деталі рецепта
                    <Divider
                        style={{
                            margin: '8px 0',
                            borderColor: '#76B9FF',
                            borderWidth: '2px',
                            borderRadius: '4px'
                        }}
                    />
                </div>
            }
            visible={visible}
            onCancel={onClose}
            footer={null}
            centered
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
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Title level={5}>Лікар:</Title>
                        <Text style={{ fontSize: "16px" }}>
                            {doctorDetails
                                ? `${doctorDetails.FirstName} ${doctorDetails.LastName}`
                                : "Немає даних"}
                        </Text>
                    </div>
                    <div>
                        <Title level={5}>Дата:</Title>
                        <Text style={{ fontSize: "16px" }}>
                            {dayjs(prescription.prescriptionDate).format("DD.MM.YYYY")}
                        </Text>
                    </div>
                    <div>
                        <Title level={5}>Назва ліків:</Title>
                        <Text style={{ fontSize: "16px" }}>
                            {prescription.medicationName || "Немає даних"}
                        </Text>
                    </div>
                    <div>
                        <Title level={5}>Дозування:</Title>
                        <Text style={{ fontSize: "16px" }}>
                            {prescription.dosage || "Немає даних"}
                        </Text>
                    </div>
                </div>
                <div>
                    <Title level={5}>Інструкції:</Title>
                    <Text style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}>
                        {prescription.instructions || "Немає даних"}
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default PrescriptionModal;
