import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export const ForbiddenPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
            }}
        >
            <Result
                status="403"
                title="403"
                subTitle="На жаль, у вас немає прав доступу до цієї сторінки."
                extra={
                    <Button type="primary" onClick={() => navigate('/')}>
                        На головну
                    </Button>
                }
            />
        </div>
    );
};