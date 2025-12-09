import  { Outlet } from 'react-router-dom';

import Header from './layout-components/Header';
import Footer from './layout-components/Footer';
import { useAuth } from '../AuthContext';
import LoadingFallback from './layout-components/LoadingFallback';

export default function Layout() {

    const { loading } = useAuth()

    if (loading) {
        return (
        <>
            <Header isLoading={true} />
                <LoadingFallback/>
            <Footer />
        </>
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