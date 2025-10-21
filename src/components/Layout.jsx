import  { Outlet } from 'react-router-dom';

import Header from './layout-components/Header';
import Footer from './layout-components/Footer';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Layout() {

    const navigate = useNavigate();

    useEffect(() => {
    
            async function checkAuth() {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            
            if (!data.authenticated) {
                navigate('/');
            }
            }
    
        checkAuth();
}, [navigate])

    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}