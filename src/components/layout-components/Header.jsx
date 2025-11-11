import { useState } from 'react'
import { useNavigate } from "react-router-dom";

import './Header.css'
import { useAuth } from '../../AuthContext';
import logo from '/FabLab_logo.png'

export default function Header() {

    const [isOpen, setIsOpen] = useState(false);

    function menuToggle() {
        setIsOpen(prev => !prev);
    }

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    function handleLogoClick() {
        if (user) {
            navigate('/dashboard')
        }
        
    }

    return (
        <header>
            <div className='logo-container' onClick={handleLogoClick}>
                <img className='header-logo' src={logo} />
            </div>

            { user ? 
                <>
                    <button className='hamburger' onClick={menuToggle} aria-expanded={isOpen}>Menu</button>
                
                    <nav id='main-menu' className={isOpen ? 'open' : ''}>
                        <ul>
                            <li><button className='nav' disabled>Appointments</button></li>
                            <li><button className='nav' disabled>Profile</button></li>
                            <li><button onClick={logout} className='nav'>Logout</button></li>
                        </ul>
                            <span className='user-type'>{user?.role}</span>
                    </nav>
                </>
                : 
                null}
            
            {/* <button className='hamburger' onClick={menuToggle}>Menu</button>
                
            <nav id='main-menu' className={isOpen ? 'open' : ''}>
                <ul>
                    <li><button className='nav'>Appointments</button></li>
                    <li><button className='nav'>Profile</button></li>
                    <li><button onClick={logout} className='nav'>Logout</button></li>
                </ul>
                    <span className='user-type'>UserType</span>
            </nav>
             */}
        </header>
    )
}