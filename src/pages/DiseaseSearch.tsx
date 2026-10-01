import React, { useState } from "react";
import { Input, Button, Select, Spin, Result, Alert, Popover } from "antd";
import { searchDisease } from "../api/diseaseSearch";
import ResponseRenderer from "../components/ResponseRenderer";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

interface DiseaseSearchProps {
    token: string;
}

const DiseaseSearch: React.FC<DiseaseSearchProps> = ({ token }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [provider, setProvider] = useState<"openai" | "external">("openai");
    const [loading, setLoading] = useState<boolean>(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<boolean>(false);

    const handleSearch = async () => {
        if (!searchTerm) return;
        setLoading(true);
        setError(false);
        try {
            const result = await searchDisease(searchTerm, provider, token);
            if (provider === "external" && (!result.links || result.links.length === 0)) {
                setError(true);
            } else {
                setResponse(result);
            }
        } catch (error) {
            console.error("Помилка пошуку:", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleProviderChange = (value: "openai" | "external") => {
        setProvider(value);
        setSearchTerm("");
        setResponse(null);
        setError(false);
    };

    const popoverContent = (
        <div>
            <p>
                <strong>Режим AI:</strong><br/>
                Відповіді генеруються штучним інтелектом.
            </p>
            <p>
                <strong>Зовнішній пошук:</strong><br/>
                Інформація з перевірених медичних баз.
            </p>
        </div>
    );

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:gap-4 lg:items-center gap-4">
                <div className="w-full lg">
                    <Input
                        placeholder={
                            provider === "openai"
                                ? "Введіть свій запит (наприклад, розкажіть про грип)"
                                : "Введіть назву хвороби (наприклад, грип)"
                        }
                        value={searchTerm}
                        allowClear
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-lg shadow-lg"
                        style={{
                            fontSize: "16px",
                            height: "40px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                            width: "100%",
                        }}
                    />
                </div>
                <div className="w-full lg:w-auto">
                    <Popover content={popoverContent} placement="rightBottom">
                        <Select
                            defaultValue="openai"
                            value={provider}
                            onChange={handleProviderChange}
                            className="rounded-lg shadow-lg"
                            dropdownStyle={{
                                fontSize: "16px",
                            }}
                            style={{
                                fontSize: "16px",
                                height: "40px",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                                width: "100%",
                            }}
                        >
                            <Option value="openai">Режим AI</Option>
                            <Option value="external">Зовнішній пошук</Option>
                        </Select>
                    </Popover>
                </div>
                <div className="w-full lg:w-auto">
                    <Button
                        color="danger"
                        variant="solid"
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                        disabled={loading}
                        className="rounded-lg shadow-lg"
                        style={{
                            height: "40px",
                            fontSize: "16px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                            width: "100%",
                        }}
                    >
                        Пошук
                    </Button>
                </div>
            </div>

            <Alert
                message="Цей інструмент є допоміжним"
                description="Цей інструмент не замінює консультації з лікарем. Якщо у вас є питання щодо здоров’я, зверніться до кваліфікованого медичного спеціаліста."
                type="info"
                showIcon
                closable
                className="mt-6 w-full"
            />

            {loading ? (
                <div className="mt-6 text-center">
                    <Spin size="large" tip="Пошук..." />
                </div>
            ) : error ? (
                <div className="mt-6">
                    <Result
                        status="warning"
                        title="Нічого не знайдено. Переконайтесь, що ввели правильні дані."
                    />
                </div>
            ) : response ? (
                provider === "external" ? (
                    <>
                        <Alert
                            description="Рекомендуємо скористатися браузером із перекладачем для зручності читання."
                            message={
                                <span>
                                    Ці результати отримані з{" "}
                                    <a
                                        href="https://medlineplus.gov"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        MedlinePlus
                                    </a>
                                </span>
                            }
                            type="info"
                            showIcon
                            closable
                            className="mt-6 w-full"
                        />
                        <div
                            className="mt-6 shadow-lg rounded-lg p-6 bg-white border border-gray-200"
                            style={{ boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)" }}
                        >
                            <h2 className="mb-4 text-xl font-semibold text-gray-800">
                                Результати для запиту: "{searchTerm}"
                            </h2>
                            <ul className="list-disc ml-6">
                                {response.links.map((link: string, index: number) => {
                                    const [url, title] = link.split(",");
                                    return (
                                        <li key={index} className="mb-2 text-blue-600 underline">
                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                {title}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </>
                ) : (
                    <ResponseRenderer content={response.content} provider="openai" />
                )
            ) : null}
        </div>
    );
};

export default DiseaseSearch;
