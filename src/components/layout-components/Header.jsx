import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Header.css'

export default function Header() {

    const [isOpen, setIsOpen] = useState(false);

    function menuToggle() {
        setIsOpen(prev => !prev);
    }


    async function handleLogout() {
        try {
            await fetch('/api/logout', {
                method: "POST",
                credentials: 'include'
            })
            window.location.href = '/'
        } catch (err) {
            console.log(`Logout failed: ${err}`)
        }
    }

    return (
        <header>
            <div className='logo-container'>
                <span className='logo'>UTampa</span>
                <span className='logo'>Fabrication Lab + Woodshop</span>
            </div>
            
            <button className='hamburger' onClick={menuToggle}>Menu</button>
                
            <nav id='main-menu' className={isOpen ? 'open' : ''}>
                <ul>
                    <li><a>Appointments</a></li>
                    <li><a>Profile</a></li>
                    <li onClick={handleLogout}>Sign Out</li>
                </ul>
                    <span className='user-type'>UserType</span>
            </nav>
            
        </header>
    )
}