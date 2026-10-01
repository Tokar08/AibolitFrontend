import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
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
                status="404"
                title="404"
                subTitle="На жаль, сторінку, яку ви шукаєте, не знайдено."
                extra={
                    <Button type="primary" onClick={() => navigate('/')}>
                        На головну
                    </Button>
                }
            />
        </div>
    );
};