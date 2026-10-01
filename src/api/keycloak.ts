import Keycloak, { KeycloakInstance, KeycloakOnLoad } from "keycloak-js";
import axios from "axios";

const initOptions = {
    url: "http://localhost:8081",
    realm: "aibolit-api",
    clientId: "aibolit-api",
    onLoad: "login-required" as KeycloakOnLoad,
};

let keycloak: KeycloakInstance | null = null;
let initialized = false;

export const getKeycloakInstance = (): KeycloakInstance => {
    if (!keycloak) {
        keycloak = new Keycloak(initOptions);
    }
    return keycloak;
};

export const initKeycloak = async (): Promise<KeycloakInstance> => {
    const kcInstance = getKeycloakInstance();

    if (initialized) {
        console.log("Keycloak уже инициализирован.");
        return kcInstance;
    }

    try {
        const authenticated = await kcInstance.init({ onLoad: "login-required", checkLoginIframe: false });
        if (authenticated) {
            console.log("Keycloak успешно инициализирован.");
            initialized = true;
            return kcInstance;
        } else {
            console.warn("Пользователь не аутентифицирован. Перенаправляем на вход.");
            kcInstance.login();
            throw new Error("Пользователь не аутентифицирован.");
        }
    } catch (error) {
        console.error("Ошибка инициализации Keycloak:", error);
        throw error;
    }
};

export const createPatient = async (token: string): Promise<void> => {
    try {
        console.log("Создаём нового пациента...");
        await axios.post(
            "/api/Patient",
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Пациент успешно создан.");
    } catch (error) {
        console.error("Ошибка при создании пациента:", error);
        throw error;
    }
};

export const fetchUserData = async (token: string): Promise<any> => {
    try {
        console.log("Запрашиваем данные пользователя...");
        const response = await axios.get("/api/User/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Данные пользователя получены:", response.data);
        return response.data;
    } catch (error) {
        console.error("Ошибка получения данных пользователя:", error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    const kcInstance = getKeycloakInstance();
    try {
        await fetch(`http://localhost:8081/realms/aibolit-api/protocol/openid-connect/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: "aibolit-api",
                refresh_token: kcInstance.refreshToken || "",
            }),
        });

        kcInstance.clearToken();
        kcInstance.login();
        initialized = false;
    } catch (error) {
        console.error("Ошибка при выполнении выхода:", error);
    }
};

export const handleRetry = async (): Promise<void> => {
    console.log("Повторная попытка...");
    try {
        const keycloakInstance = getKeycloakInstance();
        await keycloakInstance.login({
            redirectUri: window.location.href,
        });
    } catch (err) {
        console.error("Ошибка при повторной попытке входа:", err);
    }
};
