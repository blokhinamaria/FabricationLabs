import { useState, useEffect } from "react"
import './Appointment.css'

export default function Appointment({id, data}) {

    const [ appointment, setAppointment ] = useState(data || null)
    const [ loading, setLoading ] = useState(!data)
    const [ error, setError ] = useState(null)

    useEffect(() => {
        if (!data && id) {
            fetchAppointment(id)
        }
    }, [id, data])

    async function fetchAppointment(appointmentId) {
        try {
            setLoading(true)
            const response = await fetch(`/api/appointments?id=${appointmentId}`)
            const data = await response.json()
            if (response.ok) {
                setAppointment(data.appointment)
            } else {
                setError('Failed to load appointment')
            }
        } catch (err) {
            console.log(`Error fetching the newly created appointment: ${err}`)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <p>Loading...</p>
    if (error) return <div>Error: {error}</div>
    if (!appointment) return <p>No appointment found</p>

    const address = () => {
        if (appointment.location === 'FabLab') {
            return <p>R.K. Bailey Art Studios<br />310 N Blvd, Tampa, FL 33606</p>
        } else if (appointment.location === 'Woodshop') {
            return <p>Ferman Center for the Arts<br />214 N Blvd, Tampa, FL 33606</p>
        } else {
            return null
        }
    }

    //calculate days left

    const appointmentDate = new Date(`${appointment.date} ${appointment.startTime}`)

    const daysLeft = () => {

        const today = new Date()
        
        if (appointmentDate.getDate() === today.getDate() &&
            appointmentDate.getMonth() === today.getMonth() &&
            appointmentDate.getFullYear() === today.getFullYear()) {
            
            const differenceInMs = (appointmentDate.getTime() - today.getTime())
            const oneHourInMs = 1000 * 60 * 60;
            const differenceInHours = Math.ceil(differenceInMs / oneHourInMs)
            if (differenceInHours > 1) {
                return `in ${differenceInHours} hours`
            } else if (differenceInHours === 1) {
                return `in ${differenceInHours} hour`
            } else {
                const oneMinuteInMs = 1000 * 60;
                const differenceInMinutes = Math.ceil(differenceInMs / oneMinuteInMs)
                if (differenceInMinutes > 1) {
                    return `in ${differenceInMinutes} minutes`
                } else if (differenceInMinutes === 1){
                    return `in ${differenceInMinutes} minute`
                } else {
                    return `passed`
                }
            }
        } else if (appointmentDate > today) {
            const differenceInMs = (appointmentDate.getTime() - today.getTime())
            const oneDayInMs = 1000 * 60 * 60 * 24;
            const differenceInDays = Math.ceil(differenceInMs / oneDayInMs) 
            if (differenceInDays > 1) {
                return `in ${differenceInDays} days`
            } else if (differenceInDays === 1) {
                return `in ${differenceInDays} day`
            }
        } else {
            return `passed`
        }
    }

    return (
        <div className="appointment-card">
            <p>{daysLeft()}</p>
            <h3>{appointment.equipmentName}</h3>
            <div>
                <img src="/icons/calendar_month_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Calendar" width="24" height="24" />
                <p>{appointmentDate.toDateString()}</p>
            </div>
            <div>
                <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                <p>{appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
            </div>
            <div>
                <img src="/icons/location_on_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Location Pin" width="24" height="24" />
                <div>
                    <p><strong>{appointment.location}</strong></p>
                    <p>{address()}</p>
                </div>
            </div>
        </div>
    )
}