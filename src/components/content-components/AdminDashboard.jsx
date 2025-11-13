import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

import AppointmentCardAdmin from "./Appointment/AppointmentCardAdmin.jsx";

export default function AdminDashboard() {
    
    const { user } = useAuth()

    const [ upcomingAppointments, setUpcomingAppointments ] = useState([]);
    const [ upcomingReservations, setUpcomingReservations ] = useState([]);

    const [ allUpcomingBookings, setAllUpcomingBookings ] = useState([]);
    const [ bookingGroups, setBookingGroups ] = useState({});

    function sortBookings(a, b) {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return aDate - bDate;
    }

    useEffect(() => {

        if(user) {
            async function fetchUserAppointments() {
                const response = await fetch(`/api/appointments?role=${user.role}&labs=${user.assignedLabs.join(',')}`);
                const data = await response.json()
                
                const today = new Date();
                
                const filterBookingsByDate = data.appointments.filter((appointment) => {
                    const appointmentTime = new Date(appointment.date)
                    return appointmentTime > today;
                })

                const sortedBookings = filterBookingsByDate.sort((a, b) => sortBookings(a,b))

                setAllUpcomingBookings(sortedBookings)
                
                setBookingGroups({...Object.groupBy(sortedBookings, ({date}) => {
                        return new Date(date).toDateString()
                    })}
                )

                //filtering
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

                setUpcomingAppointments(sortedAppointments);


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

    const userAssignedLabs = user.assignedLabs.join('&')

    return (
        <main>
            <h1>{userAssignedLabs} Upcoming Bookings</h1>
            <article style={{ marginTop: "50px"}} className="upcoming-appointments">
                {Object.entries(bookingGroups).map(([date, group]) => (
                    <section key={date}>
                        <h2>{date}</h2>
                        <div className="appointment-list">
                                {group.map((booking) => (
                                    <AppointmentCardAdmin key={booking._id} data={booking}/>
                            ))}
                        </div>
                    </section>
                ))}
            </article>
        </main>
    )
}