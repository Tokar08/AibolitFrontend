import React, { useEffect, useRef, useState } from "react";
import { Modal, Form, Select, TimePicker, notification } from "antd";
import Draggable from "react-draggable";
import type { DraggableEvent, DraggableData } from "react-draggable";
import dayjs from "dayjs";

const { Option } = Select;

const weekDays = [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четверг",
    "П’ятниця",
    "Субота",
];

interface ScheduleModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (schedule: any, isEdit: boolean) => void;
    editingSchedule: any | null;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
                                                         visible,
                                                         onClose,
                                                         onSubmit,
                                                         editingSchedule,
                                                     }) => {
    const [form] = Form.useForm();
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (visible) {
            if (editingSchedule) {
                form.setFieldsValue({
                    dayOfWeek: editingSchedule.dayOfWeek,
                    startTime: dayjs(editingSchedule.startTime, "HH:mm"),
                    endTime: dayjs(editingSchedule.endTime, "HH:mm"),
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, editingSchedule, form]);

    const handleFinish = (values: any) => {
        const startTime = dayjs(values.startTime).format("HH:mm:ss");
        const endTime = dayjs(values.endTime).format("HH:mm:ss");

        if (dayjs(values.endTime).isBefore(dayjs(values.startTime))) {
            notification.error({
                message: "Помилка",
                description: "Час закінчення має бути пізніше часу початку.",
            });
            return;
        }

        const newSchedule = {
            ...editingSchedule,
            dayOfWeek: values.dayOfWeek,
            startTime,
            endTime,
        };

        onSubmit(newSchedule, !!editingSchedule);
        form.resetFields();
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
                    {editingSchedule ? "Редагувати розклад" : "Додати розклад"}
                </div>
            }
            visible={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText="Зберегти"
            cancelText="Скасувати"
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
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="dayOfWeek"
                    label="День тижня"
                    rules={[{ required: true, message: "Оберіть день тижня!" }]}
                >
                    <Select placeholder="Оберіть день тижня"  allowClear>
                        {weekDays.map((day, index) => (
                            <Option key={index} value={index}>
                                {day}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="startTime"
                    label="Час початку"
                    rules={[{ required: true, message: "Вкажіть час початку!" }]}
                >
                    <TimePicker format="HH:mm" showNow={false} />
                </Form.Item>
                <Form.Item
                    name="endTime"
                    label="Час закінчення"
                    rules={[{ required: true, message: "Вкажіть час закінчення!" }]}
                >
                    <TimePicker format="HH:mm" showNow={false} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ScheduleModal;
