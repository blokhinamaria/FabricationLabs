import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {

    const navigate = useNavigate();
    
    //data for testing
    const userEmail = 'mail@ut.edu'

    const [ user, setUser ] = useState(null);
    const [ upcomingAppointments, setUpcomingAppointments ] = useState([]);

    useEffect(() => {

    //     async function checkAuth() {
    //     const response = await fetch('/api/check-auth');
    //     const data = await response.json();
        
    //     if (data.authenticated) {
    //         setUser(data.user);
    //     } else {
    //         navigate('/');
    //     }
    // }

    // checkAuth();

        async function fetchUserData() {
            // const response = await fetch(`data/users/[userId]`); ?
            const response = await fetch(`data/users.json`);
            const data = await response.json()

            const user = data.find((user) => user.userEmail === userEmail);

            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));

            if (user && user.bookings.length > 0) {
                const response = await fetch(`data/bookings.json`);
                const data = await response.json();
                
                setUpcomingAppointments(data);
            }
        }
        fetchUserData();
        
    }, [navigate])

    return (
        <main>
            <article className="new-appointment">
                <Link to='/dashboard/newappointment'><button>Schedule new appointment</button></Link>
            </article>
            <article style={{ marginTop: "50px"}}>
                {upcomingAppointments.length > 0 ? (
                    <div>
                        <h2>Upcoming appointments</h2>
                        <div className="appointment-list">
                            <ul>
                                {upcomingAppointments.map((appointment) => (
                                <li key={appointment.bookingId} className="appointment-card">
                                    {appointment.date}
                                </li>
                            ))}
                            </ul>
                            
                        </div>
                    </div>
                    
                ) : (
                    <div>
                        <h2>No upcoming appointments</h2>
                    </div>
                )}
            </article>
        </main>
    )
}