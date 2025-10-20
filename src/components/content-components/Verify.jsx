// src/pages/Verify.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Verify() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (!token) {
        setStatus('error');
        return;
        }

        // The /api/verify endpoint will automatically redirect
        // This page is just shown briefly while processing
        window.location.href = `/api/verify?token=${token}`;
    }, [searchParams]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
        {status === 'verifying' && <p>Verifying your email...</p>}
        {status === 'error' && <p>Invalid or expired link</p>}
        </div>
    );
}