import { useState, useEffect } from "react"

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

    return (
        <section>
            <h3>{appointment.equipmentName}</h3>
            <p>Date: {appointment.date}</p>
            <p>Time: {appointment.startTime}</p>
        </section>
    )
}