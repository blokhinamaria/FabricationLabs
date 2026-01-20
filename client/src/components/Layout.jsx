import  { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Layout/Header';
import Footer from './Layout/Footer';
import { useAuth } from '../AuthContext';
import LoadingFallback from './Layout/LoadingFallback';

export default function Layout() {

    const { user, loading } = useAuth()

    useEffect(() => {
        if (user) {
            const roleClass = user.role === 'admin' || user.role === 'demo-admin' 
                ? 'theme-admin' 
                : user.role === 'faculty' || user.role === 'demo-faculty'
                    ? 'theme-faculty' 
                    : '';
            
            document.body.className = roleClass;
        } else {
            document.body.className = '';
        }

        // Cleanup
        return () => {
            document.body.className = '';
        };
    }, [user]);

    if (loading) {
        return (
            <LoadingFallback/>
        );
    }
    

    return (
        <>
            <Header />
                <Outlet />
            <Footer />
        </>
    )
}