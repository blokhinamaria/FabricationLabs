import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

import AppointmentCard from "./Appointment-cards/AppointmentCard";

export default function Dashboard() {
    
    const { user } = useAuth()

    const [ upcomingAppointments, setUpcomingAppointments ] = useState([]);
    const [ upcomingReservations, setUpcomingReservations ] = useState([]);

    const [ loading, setLoading ] = useState();

    useEffect(() => {

        if(user) {
            async function fetchUserAppointments() {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/appointments?userId=${user._id}`, 
                    { credentials: 'include' });
                    if (response.ok) {
                        const data = await response.json()
                    
                    const today = new Date();
                    const filterAppointmentsByDate = data.appointments.filter((appointment) => {
                        const appointmentTime = new Date(appointment.date)
                        return appointmentTime > today;
                    })

                    const filterAppointments = filterAppointmentsByDate.filter(appointment => (appointment?.type === 'individual-appointment' || !appointment?.type))
                    
                    const sortedAppointments = filterAppointments.sort((a, b) => {
                        const aDate = new Date(a.date)
                        const bDate = new Date(b.date)
                        return aDate - bDate;
                    }
                    )
                    
                    setUpcomingAppointments(sortedAppointments)

                    const filteredReservations = filterAppointmentsByDate.filter(appointment => appointment?.type === 'class-reservation')

                    const sortedReservations = filteredReservations.sort((a, b) => {
                        const aDate = new Date(a.date)
                        const bDate = new Date(b.date)
                        return aDate - bDate;
                    }
                    )
                    setUpcomingReservations(sortedReservations)
                    }
                } catch (err) {
                    console.log(`Error fetching booking information: ${err}`)
                } finally {
                    setLoading(false)
                }
            }
            fetchUserAppointments()
        }
    }, [user])

    const navigate = useNavigate();

    function handleNewReservation() {
        navigate('/dashboard/newreservation')
    }

    function handleNewAppointment() {
        navigate('/dashboard/newappointment')
    }

    if (loading) return (<main>Loading Your Dashboard...</main>)

    return (
        <main>
            <article className="appointment-buttons">
                <div className="button-group">
                    {(user.role === 'faculty' || user.role === 'demo-faculty') && <button onClick={handleNewReservation}>Reserve for class</button>}
                    <button onClick={handleNewAppointment}>Schedule new appointment</button>
                </div>
                
            </article>
            <article style={{ marginTop: "50px"}} className="upcoming-appointments">
                {(upcomingAppointments?.length > 0 || upcomingReservations?.length > 0) ? (
                    <>
                        {(user.role === 'faculty' || user.role === 'demo-faculty') && upcomingReservations?.length > 0 && (
                            <div>
                                <h1>Upcoming Class Reservations</h1>
                                <section className="appointment-list">
                                        {upcomingReservations.map((appointment) => (
                                            <AppointmentCard key={appointment._id} data={appointment}/>
                                    ))}
                                </section>
                            </div>
                            )}
                        {upcomingAppointments?.length > 0 && (
                            <div>
                                <h1>Upcoming Individual Appointments</h1>
                                <div className="appointment-list">
                                        {upcomingAppointments.map((appointment) => (
                                            <AppointmentCard key={appointment._id} data={appointment}/>
                                    ))}
                                </div>
                            </div>
                            )}
                    </>
                    ) : (
                        <h3>You Have No Upcoming Appointments</h3>
                    )}
            </article>
        </main>
    )
}