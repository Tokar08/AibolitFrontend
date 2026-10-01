import React, { useState, useRef, useEffect } from "react";
import {Modal, Typography, Spin, Divider} from "antd";
import Draggable from "react-draggable";
import type { DraggableData, DraggableEvent } from "react-draggable";
import { fetchRecommendationDetails, fetchDoctorDetails } from "../api/doctor";
import dayjs from "dayjs";
import {fetchRecommendationDetailsByPatient} from "../api/patient";

const { Title, Text } = Typography;

interface RecommendationModalProps {
    visible: boolean;
    recommendationId: string | null;
    doctorId: string;
    patientId: string;
    token: string;
    role: "Doctor" | "ChiefDoctor" | "Patient";
    onClose: () => void;
}
const RecommendationModal: React.FC<RecommendationModalProps> = ({
                                                                     visible,
                                                                     recommendationId,
                                                                     doctorId,
                                                                     patientId,
                                                                     token,
                                                                     role,
                                                                     onClose,
                                                                 }) => {
    const [recommendation, setRecommendation] = useState<any>(null);
    const [doctorDetails, setDoctorDetails] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
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
            if (!recommendationId) return;

            setLoading(true);
            try {
                let recommendationData;

                if (role === "Patient") {
                    recommendationData = await fetchRecommendationDetailsByPatient(
                        patientId,
                        recommendationId,
                        token
                    );
                } else {
                    recommendationData = await fetchRecommendationDetails(
                        doctorId,
                        patientId,
                        recommendationId,
                        token
                    );
                }

                setRecommendation(recommendationData);


                const doctorData = await fetchDoctorDetails(recommendationData.doctorId, token);
                setDoctorDetails(doctorData);

            } catch (error) {
                console.error("Ошибка загрузки деталей рекомендации:", error);
            } finally {
                setLoading(false);
            }
        };

        if (visible) fetchDetails();
    }, [visible, recommendationId, doctorId, patientId, token, role]);

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

    if (!recommendation) {
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
                    Деталі рекомендації
                    <Divider
                        style={{
                            margin: '10px 0',
                            borderWidth: '2px',
                            borderRadius: '4px',
                            borderColor: '#76B9FF',
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
                <div className="flex justify-between items-center">
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
                            {dayjs(recommendation.recommendationDate).format("DD.MM.YYYY")}
                        </Text>
                    </div>
                </div>
                <div>
                    <Title level={5}>Рекомендація:</Title>
                    <Text style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}>
                        {recommendation.content || "Немає даних"}
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default RecommendationModal;
