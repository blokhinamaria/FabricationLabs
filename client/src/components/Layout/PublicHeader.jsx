import './Header.css'
import logo from '/FabLab_logo.png'

export default function PublicHeader() {  
    return (
        <header>
            <div className='logo-container'>
                <img className='header-logo' src={logo} alt="FabLab Logo" />
            </div>
        </header>
    );
}