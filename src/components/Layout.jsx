import  { Outlet } from 'react-router-dom';

import Header from './layout-components/Header';
import Footer from './layout-components/Footer';

export default function Layout() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}