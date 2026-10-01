import React from "react";
import { Card, Typography, List, Collapse, Grid } from "antd";
import { FilePdfOutlined, LinkOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const KnowledgeBase: React.FC = () => {
    const screens = useBreakpoint();

    const links = [
        {
            title: "Що таке Keycloak?",
            url: "https://habr.com/ru/companies/slurm/articles/654475/",
            description: "Основні принципи роботи Keycloak та його функції.",
        },
        {
            title: "SSO (Single Sign-On): Що це і навіщо потрібно?",
            url: "https://aws.amazon.com/ru/what-is/sso/",
            description: "Пояснення концепції єдиного входу в систему.",
        },
        {
            title: "OAuth2 та OpenID Connect: Основи",
            url: "https://habr.com/ru/articles/491116/",
            description: "Розбір основних протоколів авторизації та ідентифікації.",
        },
        {
            title: "PKCE (Proof Key for Code Exchange): Як і навіщо використовувати?",
            url: "https://blog.logto.io/ru/how-pkce-protects-the-authorization-code-flow-for-native-apps",
            description: "Огляд додаткового рівня безпеки для OAuth2.",
        },
        {
            title: "Управління користувачами у Keycloak",
            url: "https://docs.2gis.com/ru/on-premise/administration/keycloak",
            description: "Посібник з управління користувачами.",
        },
        {
            title: "Офіційна документація Keycloak",
            url: "https://www.keycloak.org/documentation",
            description: "Офіційні матеріали для роботи з Keycloak.",
        },
        {
            title: "Приклади в Postman для Keycloak API",
            url: "https://www.postman.com/assignmentsnoroff/keycloak-api/overview",
            description: "Приклади використання API Keycloak у Postman.",
        },
        {
            title: "Генератор Code Verifier та Code Challenge",
            url: "https://tonyxu-io.github.io/pkce-generator/",
            description: "Інструмент для швидкого генерування Code Verifier та Code Challenge для PKCE.",
        },
        {
            title: "Keycloak: Medium блог",
            url: "https://medium.com/keycloak",
            description: "Корисні статті та поради від ком'юніті Keycloak.",
        },
    ];


    const files = [
        {
            title: "Keycloak: Інструкція по авторизації",
            url: "https://storage.googleapis.com/aibolit-bucket/system/a50a0916-ecab-4d01-88ff-f2596e3e97ae_Keycloak.pdf",
        },
        {
            title: "Редагування даних у Keycloak",
            url: "https://storage.googleapis.com/aibolit-bucket/system/ccf3a8b8-3125-4be2-b8a0-fa22587d6558_%D0%86%D0%BD%D1%81%D1%82%D1%80%D1%83%D0%BA%D1%86%D1%96%D1%8F_%D0%B7_%D1%83%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D1%96%D0%BD%D0%BD%D1%8F_%D0%B4%D0%B0%D0%BD%D0%B8%D0%BC%D0%B8_%D0%BA%D0%BE%D1%80%D0%B8%D1%81%D1%82%D1%83%D0%B2%D0%B0%D1%87%D1%96%D0%B2_%D1%87%D0%B5%D1%80%D0%B5%D0%B7_Keycloak.pdf",
        },
    ];



    return (
        <div style={{ padding: screens.sm ? "20px 50px" : "10px" }}>
            <Title level={2} style={{ textAlign: "center", color: "#FF4B4E"}}>
                База знань
            </Title>

            <section>
                <Title level={3}>Практична документація</Title>
                <List
                    grid={{ gutter: 16, column: screens.sm ? 3 : 1 }}
                    dataSource={links}
                    renderItem={(item) => (
                        <List.Item>
                            <Card
                                hoverable
                                style={{
                                    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.4)",
                                    borderRadius: "8px",
                                    minHeight: "180px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                }}
                                title={
                                    <Paragraph
                                        style={{
                                            wordWrap: "break-word",
                                            whiteSpace: "normal",
                                            overflowWrap: "break-word",
                                            marginBottom: 0,
                                        }}
                                    >
                                        {item.title}
                                    </Paragraph>
                                }
                                extra={
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: "block",
                                            marginTop: "10px",
                                            textAlign: "center",
                                        }}
                                    >
                                        Переглянути <LinkOutlined />
                                    </a>
                                }
                            >
                                <Paragraph
                                    style={{
                                        wordWrap: "break-word",
                                        whiteSpace: "normal",
                                        overflowWrap: "break-word",
                                        marginBottom: 0,
                                    }}
                                >
                                    {item.description}
                                </Paragraph>
                            </Card>
                        </List.Item>
                    )}
                />
            </section>

            <section style={{ marginTop: "20px" }}>
                <Title level={3}>Файли для завантаження</Title>
                <List
                    grid={{ gutter: 16, column: screens.sm ? 2 : 1 }}
                    dataSource={files}
                    renderItem={(item) => (
                        <List.Item>
                            <Card
                                hoverable
                                style={{
                                    boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.4)",
                                    borderRadius: "8px",
                                    marginBottom: 0,
                                }}
                                title={
                                    <span
                                        style={{
                                            wordWrap: "break-word",
                                            overflowWrap: "break-word",
                                            whiteSpace: "normal",
                                        }}
                                    >
                                        {item.title}
                                     </span>
                                }
                                extra={
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        Завантажити <FilePdfOutlined />
                                    </a>
                                }
                            />

                        </List.Item>
                    )}
                />
            </section>

        </div>
    );
};

export default KnowledgeBase;
