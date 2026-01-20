import  { Outlet } from 'react-router-dom';
import Footer from './Layout/Footer';
import PublicHeader from './Layout/PublicHeader';

export default function PublicLayout() {

    return (
        <>
            <PublicHeader />
                <Outlet />
            <Footer />
        </>
    )
}