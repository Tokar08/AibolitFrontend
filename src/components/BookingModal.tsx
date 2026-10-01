import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, notification, DatePicker, Alert, Popconfirm } from "antd";
import Draggable from "react-draggable";
import type { DraggableEvent, DraggableData } from "react-draggable";
import { bookAppointment } from "../api/patient";
import { fetchDoctorSlots } from "../api/doctor";
import dayjs from "dayjs";

interface BookingModalProps {
    visible: boolean;
    onClose: () => void;
    doctorId: string;
    patientId: string;
    token: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
                                                       visible,
                                                       onClose,
                                                       doctorId,
                                                       patientId,
                                                       token,
                                                   }) => {
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!visible) {
            setSlots([]);
            setSelectedDate(null);
            setSelectedSlot(null);
        }
    }, [visible]);

    const loadSlots = async (date: string) => {
        setLoading(true);
        try {
            const data = await fetchDoctorSlots(doctorId, date, token);
            setSlots(data);
        } catch (error) {
            console.error("Ошибка загрузки слотов:", error);
            notification.error({
                message: "Помилка",
                description: "Не вдалося завантажити слоти. Перевірте підключення.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (date: any, dateString: string | string[]) => {
        if (!date || typeof dateString !== "string") {
            setSelectedDate(null);
            setSlots([]);
        } else {
            setSelectedDate(dateString);
            loadSlots(dateString);
        }
    };

    const disabledDate = (current: any) => {
        return current && current < dayjs().startOf("day");
    };

    const handleSlotSelect = (slot: string) => {
        setSelectedSlot(slot);
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlot || !selectedDate) return;

        try {
            const appointmentDateTime = `${selectedDate}T${selectedSlot}`;
            await bookAppointment(doctorId, patientId, token, appointmentDateTime);

            notification.success({
                message: "Успіх",
                description: "Запис успішно створено.",
            });
            onClose();
        } catch (error) {
            console.error("Ошибка создания записи:", error);
            notification.error({
                message: "Помилка",
                description: "Не вдалося створити запис. Спробуйте ще раз.",
            });
        }
    };

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

    return (
        <Modal
            title={
                <div
                    style={{ width: "100%", cursor: "move" }}
                    onMouseOver={() => setDisabled(false)}
                    onMouseOut={() => setDisabled(true)}
                >
                    Оберіть дату та час для запису
                </div>
            }
            visible={visible}
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
            <div className="mb-4">
                <DatePicker
                    value={selectedDate ? dayjs(selectedDate) : null}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                    placeholder="Оберіть дату"
                    disabledDate={disabledDate}
                    allowClear
                    style={{ width: "100%" }}
                />
            </div>
            {slots.length === 0 && selectedDate && !loading && (
                <Alert
                    message="На жаль, у цього лікаря немає розкладу на вибрану дату."
                    type="warning"
                    style={{ width: "100%", marginBottom: "16px" }}
                    showIcon
                />
            )}
            <div className="grid grid-cols-2 gap-4">
                {loading ? (
                    <p>Завантаження...</p>
                ) : (
                    slots.map((slot) => (
                        <Popconfirm
                            key={slot.startTime}
                            title={`Ви впевнені, що хочете записатися на ${slot.startTime}?`}
                            onConfirm={handleConfirmBooking}
                            okText="Так"
                            cancelText="Ні"
                        >
                            <Button
                                type={slot.isOccupied ? "default" : "primary"}
                                disabled={slot.isOccupied}
                                style={{
                                    margin: "4px",
                                    backgroundColor: slot.isOccupied ? "#D1D5DB" : "#76B9FF",
                                    color: slot.isOccupied ? "#6B7280" : "#FFFFFF",
                                    height: "50px",
                                    fontSize: "16px",
                                    borderColor: slot.isOccupied ? "#D1D5DB" : "#76B9FF",
                                }}
                                onClick={() => handleSlotSelect(slot.startTime)}
                            >
                                {slot.startTime} - {slot.endTime}
                            </Button>
                        </Popconfirm>
                    ))
                )}
            </div>
        </Modal>
    );
};

export default BookingModal;
