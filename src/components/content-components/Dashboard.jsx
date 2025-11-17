import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

import AppointmentCard from "./Appointment/AppointmentCard";

export default function Dashboard() {
    
    const { user } = useAuth()

    const [ upcomingAppointments, setUpcomingAppointments ] = useState([]);
    const [ upcomingReservations, setUpcomingReservations ] = useState([]);

    useEffect(() => {

        if(user) {
            async function fetchUserAppointments() {
                const response = await fetch(`/api/appointments?userId=${user._id}`, 
                    {
                    credentials: 'include'
                }
                );
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

    return (
        <main>
            <article className="appointment-buttons">
                <div className="button-group">
                    {user.role === 'faculty' && <button onClick={handleNewReservation}>Reserve for class</button>}
                    <button onClick={handleNewAppointment}>Schedule new appointment</button>
                </div>
                
            </article>
            <article style={{ marginTop: "50px"}} className="upcoming-appointments">
                {upcomingAppointments?.length > 0 || upcomingReservations?.length > 0 ? (
                    <>
                        {user.role === 'faculty' && upcomingReservations?.length > 0 && (
                            <div>
                                <h2>Upcoming Reservations</h2>
                                <section className="appointment-list">
                                        {upcomingReservations.map((appointment) => (
                                            <AppointmentCard key={appointment._id} data={appointment}/>
                                    ))}
                                </section>
                            </div>
                            )}
                        {upcomingAppointments?.length > 0 && (
                            <div>
                                <h2>Upcoming Appointments</h2>
                                <section className="appointment-list">
                                        {upcomingAppointments.map((appointment) => (
                                            <AppointmentCard key={appointment._id} data={appointment}/>
                                    ))}
                                </section>
                            </div>
                            )}
                    </>
                    ) : (
                        <h3>You have no Upcoming Appointments</h3>
                    )}
            </article>
        </main>
    )
}