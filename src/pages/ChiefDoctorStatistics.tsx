import React, { useEffect, useState } from "react";
import { Typography, Spin, Row, Col, Card, Progress, List, Avatar } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { fetchStatistics } from "../api/statistics";

const { Title } = Typography;

interface DoctorRating {
    key: string;
    name: string;
    visitCount?: number;
    likedByPatientsCount?: number;
    photoUrl: string;
}

const ChiefDoctorStatistics: React.FC<{ hospitalId: string; token: string }> = ({ hospitalId, token }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [statistics, setStatistics] = useState<any>(null);

    useEffect(() => {
        const loadStatistics = async () => {
            try {
                setLoading(true);
                const data = await fetchStatistics(hospitalId, token);
                setStatistics(data);
            } catch (error) {
                console.error("Ошибка загрузки статистики:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStatistics();
    }, [hospitalId, token]);

    if (loading || !statistics) {
        return (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Spin size="large" />
            </div>
        );
    }

    const cardStyle: React.CSSProperties = {
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.4)",
        padding: "10px",
        textAlign: "center",
    };

    const progressTextStyle = { color: "#000" };

    const genderDoctors = statistics.genderPercentageDoctors || {};
    const genderPatients = statistics.genderPercentagePatients || {};

    const doctorVisitRatings: DoctorRating[] = statistics.doctorVisitRatings.map((doctor: any) => ({
        key: `${doctor.firstName} ${doctor.lastName}`,
        name: `${doctor.firstName} ${doctor.lastName}`,
        visitCount: doctor.visitCount,
        photoUrl: doctor.photoUrl,
    }));

    const doctorLikeRatings: DoctorRating[] = statistics.doctorLikeRatings.map((doctor: any) => ({
        key: `${doctor.firstName} ${doctor.lastName}`,
        name: `${doctor.firstName} ${doctor.lastName}`,
        likedByPatientsCount: doctor.likedByPatientsCount,
        photoUrl: doctor.photoUrl,
    }));

    const genderDoctorsData = Object.entries(statistics.genderDistributionDoctors).map(([name, count]) => ({
        name,
        count,
    }));

    const genderPatientsData = Object.entries(statistics.genderDistributionPatients).map(([name, count]) => ({
        name,
        count,
    }));

    const doctorAgeGroupsData = Object.entries(statistics.doctorAgeGroups).map(([ageGroup, count]) => ({
        ageGroup,
        count,
    }));

    const patientAgeGroupsData = Object.entries(statistics.patientAgeGroups).map(([ageGroup, count]) => ({
        ageGroup,
        count,
    }));

    const doctorSpecializationData = Object.entries(statistics.doctorSpecializationDistribution).map(([specialization, count]) => ({
        specialization,
        count,
    }));

    const patientSpecializationPercentageData = Object.entries(statistics.patientSpecializationPercentage).map(([specialization, percent]) => ({
        specialization,
        percent,
    }));

    const renderProgress = (percent: number, text: string, isRed?: boolean) => (
        <Progress
            type="circle"
            percent={percent}
            format={() => <span style={progressTextStyle}>{percent}%</span>}
            strokeColor={isRed ? "red" : "#1890ff"}
        />
    );

    return (
        <div
            style={{
                padding: "20px",
                maxWidth: "1400px",
                margin: "0 auto",
                background: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            }}
        >
            <Title level={2}>Статистика лікарні</Title>
            <Row
                gutter={[16, 16]}
                style={{ marginBottom: "20px" }}
                justify="center"
            >
                <Col xs={24} sm={8} lg={8}>
                    <Card title="Загальна кількість" style={cardStyle}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => (
                                <span style={progressTextStyle}>{statistics.totalStaff}</span>
                            )}
                            strokeColor="#1890ff"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={8}>
                    <Card title="Лікарів" style={cardStyle}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => (
                                <span style={progressTextStyle}>{statistics.totalDoctors}</span>
                            )}
                            strokeColor="#1890ff"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={8}>
                    <Card title="Адміністраторів" style={cardStyle}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => (
                                <span style={progressTextStyle}>{statistics.totalAdministrators}</span>
                            )}
                            strokeColor="#1890ff"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={8}>
                    <Card title="Пацієнтів" style={cardStyle}>
                        <Progress
                            type="circle"
                            percent={100}
                            format={() => (
                                <span style={progressTextStyle}>{statistics.totalPatients}</span>
                            )}
                            strokeColor="#1890ff"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={8}>
                    <Card title="Доктори (жінки)" style={cardStyle}>
                        {renderProgress(genderDoctors["Жінка"] || 0, "Доктори (жінки)")}
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={8}>
                    <Card title="Доктори (чоловіки)" style={cardStyle}>
                        {renderProgress(genderDoctors["Чоловік"] || 0, "Доктори (чоловіки)")}
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={8}>
                    <Card title="Рівень відміни" style={cardStyle}>
                        {renderProgress(statistics.cancellationRate, "Рівень відміни", true)}
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={8}>
                    <Card title="Пацієнти (жінки)" style={cardStyle}>
                        {renderProgress(genderPatients["Жінка"] || 0, "Пацієнти (жінки)")}
                    </Card>
                </Col>
                <Col xs={24} sm={8} lg={8}>
                    <Card title="Пацієнти (чоловіки)" style={cardStyle}>
                        {renderProgress(genderPatients["Чоловік"] || 0, "Пацієнти (чоловіки)")}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{marginBottom: "20px"}} justify="space-between">
                <Col xs={24} md={12}>
                    <Card title="Рейтинг лікарів (відвідування)" style={cardStyle}>
                        <List
                            dataSource={doctorVisitRatings.slice(0, 10)}
                            renderItem={(item: DoctorRating, index: number) => (
                                <List.Item>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                        }}
                                    >
                                        <div style={{fontSize: "16px", textAlign: "center", minWidth: "30px"}}>
                                            {index + 1}.
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                flexGrow: 1,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Avatar src={item.photoUrl} size={50} style={{flexShrink: 0}}/>
                                            <div
                                                style={{
                                                    fontSize: "16px",
                                                    color: "#000",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {item.name}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: "16px",
                                            color: "#000",
                                            textAlign: "right",
                                            minWidth: "50px"
                                        }}>
                                            {item.visitCount}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="Рейтинг лікарів (вподобання)" style={cardStyle}>
                        <List
                            dataSource={doctorLikeRatings.slice(0, 10)}
                            renderItem={(item: DoctorRating, index: number) => (
                                <List.Item>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                        }}
                                    >
                                        <div style={{fontSize: "16px", textAlign: "center", minWidth: "30px"}}>
                                            {index + 1}.
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                flexGrow: 1,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Avatar src={item.photoUrl} size={50} style={{flexShrink: 0}}/>
                                            <div
                                                style={{
                                                    fontSize: "16px",
                                                    color: "#000",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {item.name}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: "16px",
                                            color: "#000",
                                            textAlign: "right",
                                            minWidth: "50px"
                                        }}>
                                            {item.likedByPatientsCount}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

                <Row gutter={[16, 16]} style={{marginBottom: "20px"}}>
                    <Col xs={24} md={12}>
                        <Card title="Гендерний розподіл лікарів" style={cardStyle}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={genderDoctorsData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="count" fill="#8884d8"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Гендерний розподіл пацієнтів" style={cardStyle}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={genderPatientsData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="count" fill="#82ca9d"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>


                <Row gutter={[16, 16]} style={{marginBottom: "20px"}}>
                    <Col xs={24} md={12}>
                        <Card title="Віковий розподіл лікарів" style={cardStyle}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={doctorAgeGroupsData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="ageGroup"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="count" fill="#ffc658"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Віковий розподіл пацієнтів" style={cardStyle}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={patientAgeGroupsData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="ageGroup"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="count" fill="#82ca9d"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{marginBottom: "20px"}}>
                    <Col xs={24} md={12}>
                        <Card title="Спеціалізації лікарів (Кількість)" style={cardStyle}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={doctorSpecializationData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="specialization"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="count" fill="#8884d8"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Розподіл пацієнтів за спеціалізаціями (Відсоток)" style={cardStyle}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={patientSpecializationPercentageData}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="specialization"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Bar dataKey="percent" fill="#82ca9d"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>
            </div>

    );
};

export default ChiefDoctorStatistics;
