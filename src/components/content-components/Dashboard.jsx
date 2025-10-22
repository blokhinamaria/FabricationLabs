import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

export default function Dashboard() {

    const navigate = useNavigate();
    
    //data for testing
    const { user } = useAuth()

    // const [ user, setUser ] = useState(null);
    const [ upcomingAppointments, setUpcomingAppointments ] = useState([]);

    useEffect(() => {

        if(user) {
            console.log(user)
            async function fetchUserAppointments() {
                const response = await fetch(`/api/appointments?userId=${user._id}`);
                const data = await response.json()

                console.log(data)
                setUpcomingAppointments(data.appointments)
            }
            fetchUserAppointments()
        }
    }, [user])

    console.log(upcomingAppointments)

    return (
        <main>
            <article className="new-appointment">
                <Link to='/dashboard/newappointment'><button>Schedule new appointment</button></Link>
            </article>
            <article style={{ marginTop: "50px"}}>
                {upcomingAppointments?.length > 0 ? (
                    <div>
                        <h2>Upcoming appointments</h2>
                        <div className="appointment-list">
                            <ul>
                                {upcomingAppointments.map((appointment) => (
                                <li key={appointment._id} className="appointment-card">
                                    {appointment.equipment?.name}
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