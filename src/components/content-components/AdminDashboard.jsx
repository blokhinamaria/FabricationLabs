import { useState, useEffect } from "react"
import { useAuth } from "../../AuthContext";

import AppointmentCardAdmin from "./Appointment-cards/AppointmentCardAdmin.jsx";

export default function AdminDashboard() {
    
    const { user } = useAuth()

    const [ bookingGroups, setBookingGroups ] = useState({});
    const [ displayGroups, setDisplayGroups ] = useState({});

    function sortBookings(a, b) {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return aDate - bDate;
    }

    const [ showCancelledButton, setShowCancelledButton ] = useState(false)

    useEffect(() => {
        if(user) {   
            fetchAppointments()
        }
    }, [user])

    async function fetchAppointments() {
                const response = await fetch(`/api/appointments?role=${user.role}&labs=${user.assignedLabs.join(',')}`);
                const data = await response.json()
                
                const today = new Date();
                
                const filterBookingsByDate = data.appointments.filter((appointment) => {
                    const appointmentTime = new Date(appointment.date)
                    return appointmentTime > today;
                })

                setShowCancelledButton(filterBookingsByDate.some(booking => booking.status === 'cancelled'))

                const sortedBookings = filterBookingsByDate.sort((a, b) => sortBookings(a,b))
                const groupedBookings = {...Object.groupBy(sortedBookings, ({date}) => {
                        return new Date(date).toDateString();
                    })}
                setBookingGroups(groupedBookings)
                setDisplayGroups(groupedBookings)
                
            }

    const userAssignedLabs = user.assignedLabs.join('&');

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
            {showCancelledButton && <button onClick={toggleCancelled}>{showCancelled ? 'Hide Cancelled' : 'Show Cancelled'}</button>}
            <article style={{ marginTop: "50px"}} className="upcoming-appointments">
                {Object.entries(displayGroups).map(([date, group]) => (
                    <section key={date}>
                        <h2>{date}</h2>
                        <div className="appointment-list">
                                {group.map((booking) => (
                                    <AppointmentCardAdmin key={booking._id} data={booking} fetchAppointments={fetchAppointments}/>
                            ))}
                        </div>
                    </section>
                ))}
            </article>
        </main>
    )
}