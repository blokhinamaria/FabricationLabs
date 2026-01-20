import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import LoadingOrbit from "../../Icons/LoadingOrbit";

import AppointmentCard from "../Cards/AppointmentCard";
import { API_URL } from "../../../config";

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

    if (loading) 
        return (
        <main className='flow-lg'>
            <h2>
                Loading Your Workspace...
            </h2>
            <LoadingOrbit />
        </main>
    )

    return (
        <main>
            <article>
                <section className='flow'>
                    <p className="kicker">Start Here</p>
                    {(user.role === 'faculty' || user.role === 'demo-faculty') && <button onClick={handleNewReservation}>Reserve for class</button>}
                    <button onClick={handleNewAppointment}>Schedule new appointment</button>
                </section>
            {
                dataFetchError ? 
                <section>
                    <h3>{dataFetchError}</h3>
                </section>
                :             
                <section className="wide flow-lg">
                    {(upcomingAppointments?.length > 0 || upcomingReservations?.length > 0) ? (
                        <>
                            {(user.role === 'faculty' || user.role === 'demo-faculty') && upcomingReservations?.length > 0 && (
                                <div className="flow">
                                    <h1>Upcoming Class Reservations</h1>
                                    <div className="card-box">
                                        {upcomingReservations.map((appointment) => (
                                            <AppointmentCard key={appointment._id} data={appointment}/>
                                        ))}
                                    </div>
                                </div>
                                )}
                            {upcomingAppointments?.length > 0 && (
                                <div className="flow">
                                    <h1>Upcoming Individual Appointments</h1>
                                    <div className="card-box">
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
                </section>
            }
            </article>
        </main>
    )
}