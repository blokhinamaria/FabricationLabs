import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

import AppointmentCard from "./Appointment-cards/AppointmentCard";
import { API_URL } from "../../config";

export default function Dashboard() {
    
    const { user } = useAuth()

    const [ upcomingAppointments, setUpcomingAppointments ] = useState([]);
    const [ upcomingReservations, setUpcomingReservations ] = useState([]);

    const [ loading, setLoading ] = useState();
    const [ dataFetchError, setDataFetchError ] = useState('');

    useEffect(() => {

        if(user) {
            async function fetchUserAppointments() {
                setDataFetchError('')
                try {
                    setLoading(true);
                    const response = await fetch(`${API_URL}/api/me/appointment`, { credentials: 'include' })
                    const data = await response.json()
                    if (!response.ok) {
                        setUpcomingAppointments([])
                        setDataFetchError(data.error)
                        return
                    }

                    if (data.appointments.length === 0) {
                        setUpcomingAppointments([])
                        return
                    }
                
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
                    
                } catch (error) {
                    console.error(error)
                    setDataFetchError(`We couldn't get your appointments. Please try again later`)
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
            {
                dataFetchError ? 
                <article style={{ marginTop: "50px"}}>
                    <h3>{dataFetchError}</h3>
                </article>
                :             
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
            }
        </main>
    )
}