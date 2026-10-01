import React from "react";
import { Card } from "antd";
import PatientList from "../components/PatientList";

const ManagePatients: React.FC<{
    doctorId: string;
    hospitalId: string;
    token: string;
    role: "ChiefDoctor" | "Doctor";
}> = ({ doctorId, hospitalId, token, role }) => {
    return (
        <div
            style={{
                padding: "20px",
                maxWidth: "1200px",
                margin: "0 auto",
            }}
        >
            <Card
                bordered={false}
                style={{
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                    padding: "20px",
                    width: "100%",
                }}
            >
                <div style={{ overflowX: "auto" }}>
                    <PatientList
                        doctorId={doctorId}
                        hospitalId={hospitalId}
                        token={token}
                        role={role}
                    />
                </div>
            </Card>
        </div>
    );
};

export default ManagePatients;
