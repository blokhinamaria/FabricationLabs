import './Footer.css'

export default function Footer() {
    return (
        <footer>
            <div className='information'>
                <div>
                    <p>Hours of Operation</p>
                    <p>Monday–Friday</p>
                    <p>9 AM to 5 PM</p>
                </div>
                <div>
                    <p>Fabrication Lab Located at</p>
                    <p>R.K. Bailey Art Studios</p>
                    <p>310 N Blvd, Tampa, FL 33606</p>
                </div>
                <div>
                    <p>Woodshop Located at</p>
                    <p>Ferman Center for the Arts</p>
                    <p>214 N Blvd, Tampa, FL 33606</p>
                </div>
            </div>
            <div className='logo-container'>
                <span className='logo'>UTampa</span>
                <span className='logo'>Fabrication Lab + Woodshop</span>
            </div>
        </footer>
        
    )
}