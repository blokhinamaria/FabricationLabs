import { useState } from 'react'
import { useNavigate } from "react-router-dom";

import './Header.css'
import { useAuth } from '../../AuthContext';
import logo from '/FabLab_logo.png'
import { HumburgerIcon } from '../Icons.jsx';

export default function Header({isLoading = false} ) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);

    function handleLogoClick() {
        if (user) {
            const dashboard = (user.role === 'admin' || user.role === 'demo-admin') ? 'admin-dashboard' : 'dashboard'
            navigate(`/${dashboard}`)
        }
    }

    function menuToggle() {
        setIsOpen(prev => !prev);
    }

    if (isLoading) {
        return (
            <header>
                <div className='logo-container'>
                    <img className='header-logo' src={logo} alt="FabLab Logo" />
                </div>
            </header>
        );
    }

    if (!user) {
        return (
            <header>
                <div className='logo-container'>
                    <img className='header-logo' src={logo} alt="FabLab Logo" />
                </div>
            </header>
        );
    }

    const isAdmin = user.role === 'admin' || user.role === 'demo-admin';

    return (
        <header>
            <div className='logo-container' onClick={handleLogoClick}>
                <img className='header-logo' src={logo} />
            </div>
            <div>
                <HumburgerIcon id='hamburger' onClick={menuToggle}/>
                <nav id='main-menu' className={isOpen ? 'open' : ''}>
                    <ul>
                        {isAdmin ? (
                            <>
                                <li>
                                    <button 
                                        className='nav' 
                                        onClick={() => {
                                            navigate('/admin-dashboard/equipment');
                                            setIsOpen(false);}}
                                        >Equipment</button>
                                </li>
                                <li>
                                    <button 
                                        className='nav' onClick={() => {
                                            navigate('/admin-dashboard/schedule');
                                            setIsOpen(false);}}
                                        >Schedule</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <button 
                                        className='nav' 
                                        disabled
                                        title="Coming soon"
                                    >
                                        Appointments
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        className='nav' 
                                        disabled
                                        title="Coming soon"
                                    >
                                        Profile
                                    </button>
                                </li>
                            </>
                        )}
                        <li>
                            <button 
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }} 
                                className='nav'
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </nav>
                {/* <span className='user-type'>Faculty</span> */}
                <span className='user-type'>{user.role}</span>
            </div>
        </header>
    )
}