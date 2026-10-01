import React, {useEffect} from "react";
import {ForbiddenPage} from "../pages/ForbiddenPage";
import {useNavigate} from "react-router-dom";

interface RoleBasedGuardProps {
    role: string;
    allowedRoles: string[];
    children: React.ReactNode;
}

const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({ role, allowedRoles, children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (role && !allowedRoles.includes(role)) {
            navigate("/", { replace: true });
        }
    }, [role, allowedRoles, navigate]);

    if (!allowedRoles.includes(role)) {
        console.warn(`Доступ заборонено. Роль "${role}" не входить до списку дозволених: ${allowedRoles.join(", ")}`);
        return <ForbiddenPage />;
    }
    return <>{children}</>;
};

export default RoleBasedGuard;
