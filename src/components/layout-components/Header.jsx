import { useState } from 'react'
import './Header.css'

export default function Header() {

    const [isOpen, setIsOpen] = useState(false);

    function menuToggle() {
        setIsOpen(prev => !prev);
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
                    <li><a>Sign Out</a></li>
                </ul>
                    <span className='user-type'>UserType</span>
            </nav>
            
        </header>
    )
}