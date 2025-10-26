import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

import Appointment from "./appointments/Appointment";



export default function Dashboard() {
    
    const { user } = useAuth()

    const [ upcomingAppointments, setUpcomingAppointments ] = useState([]);

    useEffect(() => {

        if(user) {
            async function fetchUserAppointments() {
                const response = await fetch(`/api/appointments?userId=${user._id}`, 
                    {
                    credentials: 'include'
                }
                );
                const data = await response.json()

                const sortedAppointments = data.appointments.sort((a, b) => {
                    const aDate = new Date(`${a.date} ${a.startTime}`)
                    const bDate = new Date(`${b.date} ${b.startTime}`)
                    return aDate - bDate;
                }
                )

                setUpcomingAppointments(sortedAppointments)
            }
            fetchUserAppointments()
        }
    }, [user])

    return (
        <main>
            <article className="appointment-buttons">
                <Link to='/dashboard/newappointment'><button>Schedule new appointment</button></Link>
            </article>
            <article style={{ marginTop: "50px"}} className="upcoming-appointments">
                {upcomingAppointments?.length > 0 ? (
                    <>
                        <h2>Upcoming appointments</h2>
                        <section className="appointment-list">
                                {upcomingAppointments.map((appointment) => (
                                    <Appointment key={appointment._id} data={appointment}/>
                            ))}
                        </section>
                    </>
                ) : (
                    <div>
                        <h2>No upcoming appointments</h2>
                    </div>
                )}
            </article>
        </main>
    )
}