import { useState, useEffect } from "react"
import { useAuth } from "../../AuthContext";

import AppointmentCardAdmin from "./Appointment/AppointmentCardAdmin.jsx";

export default function AdminDashboard() {
    
    const { user } = useAuth()

    const [ bookingGroups, setBookingGroups ] = useState({});
    const [ displayGroups, setDisplayGroups ] = useState({});

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
                const groupedBookings = {...Object.groupBy(sortedBookings, ({date}) => {
                        return new Date(date).toDateString();
                    })}
                setBookingGroups(groupedBookings)
                setDisplayGroups(groupedBookings)

            }
            fetchUserAppointments()
        }
    }, [user])

    const userAssignedLabs = user.assignedLabs.join('&')

    const [ showCancelled, setShowCancelled ] = useState(true);
    
    function toggleCancelled() {
        if (showCancelled) {
            setDisplayGroups(Object.entries(bookingGroups).reduce((accumulator, [date, group]) => {
                const filteredBooking = group.filter(booking => booking.status !== 'cancelled')
                if (filteredBooking.length > 0) {
                    accumulator[date] = filteredBooking;
                }
                return accumulator;
            }, {}))
            setShowCancelled(prev => !prev);
        } else {
            setDisplayGroups(bookingGroups);
            setShowCancelled(prev => !prev);
        }
    }

    return (
        <main>
            <h1>{userAssignedLabs} Upcoming Bookings</h1>
            <button onClick={toggleCancelled}>{showCancelled ? 'Hide Cancelled' : 'Show Cancelled'}</button>
            <article style={{ marginTop: "50px"}} className="upcoming-appointments">
                {Object.entries(displayGroups).map(([date, group]) => (
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