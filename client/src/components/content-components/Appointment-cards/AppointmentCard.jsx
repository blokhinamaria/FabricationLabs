import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { API_URL } from '../../../config'
import './Appointment.css'

export default function AppointmentCard({id, data}) {

    const [ appointment, setAppointment ] = useState(data || null);
    const [ loading, setLoading ] = useState(!data);
    const [ error, setError ] = useState(null);
    const [ appointmentStatus, setAppointmentStatus ] = useState(appointment?.status)
    const navigate = useNavigate();
    const dialogRef = useRef(null);

    const isClassReservation = appointment?.type === 'class-reservation'
    const reservationEnd = (isClassReservation && appointment.endTime ? new Date(appointment.endTime) : null)
    const appointmentType = (appointment?.type === 'class-reservation' ? 'Class Reservation' : 'Appointment');

    useEffect(() => {
        if (!data && id) {
            fetchAppointment(id)
        }
    }, [id, data])

    async function fetchAppointment(appointmentId) {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/api/appointments?id=${appointmentId}`)
            const data = await response.json()
            console.log(data)
            if (response.ok) {
                setAppointment(data.appointment)
            } else {
                setError('Failed to load appointment')
            }
        } catch (err) {
            console.log(`Error fetching appointment data: ${err}`)
        } finally {
            setLoading(false)
        }
    }

    const address = () => {
        if (appointment?.location === 'FabLab') {
            return <p>R.K. Bailey Art Studios<br />310 N Blvd, Tampa, FL 33606</p>
        } else if (appointment?.location === 'Woodshop') {
            return <p>Ferman Center for the Arts<br />214 N Blvd, Tampa, FL 33606</p>
        } else {
            return null
        }
    }

    //calculate days left

    const appointmentDate = new Date(appointment?.date)

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

    function handleEdit(id) {
        navigate('/dashboard/editappointment', { state: id });
    }

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const openModal = () => {
        dialogRef.current.showModal()
        setIsDialogOpen(true)
    }

    const closeModal = () => {
        dialogRef.current.close()
        setIsDialogOpen(false)
    }

    //close dialog when clicking outside
    const handleDialogClick = (e) => {
        if (e.target === dialogRef.current) {
            closeModal();
        }
    }

    async function handleDelete(appointmentId) {
        try {
            const response = await fetch(`${API_URL}/api/appointments?id=${appointmentId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(id)
            })
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                setAppointmentStatus('deleted')
                closeModal();
            }
        } catch (err) {
            console.log(err)
            alert('Something went wrong, please try again later')
        }
    }

    if (loading) return <p>Loading...</p>
    if (error) return <div>Error: {error}</div>
    if (!appointment) return <p>No appointment found</p>

    return (
        <section
            className={`appointment-overview ${appointmentStatus === 'deleted' ? ('deleted') : ''}` }
        >   
            <div className="appointment-overview-group">
                {appointmentStatus === 'cancelled' ? (
                    <p className="error-message">Cancelled</p>
                ) : (
                    <p>{appointmentStatus === 'deleted' ? ('Deleted') : daysLeft()}</p>
                )}
                <h3>{appointment.equipmentName}</h3>
            </div>
            <div className="appointment-overview-group">
                <div className="appointment-icon-text">
                    <img src="/icons/calendar_month_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Calendar" width="24" height="24" />
                    <p>{appointmentDate.toDateString()}</p>
                </div>
                <div className="appointment-icon-text">
                    <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                    <p>
                        {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                    </p>
                </div>
            </div>
            <div className="appointment-overview-group"> 
                <div className="appointment-icon-text">
                    <img src="/icons/location_on_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Location Pin" width="24" height="24" />
                    <div>
                        <p><strong>{appointment.location}</strong></p>
                        {address()}
                    </div>
                </div>
            </div>
            {
                appointmentStatus === 'deleted' ? null : (
                    <div className="appointment-button-container">
                            <button onClick={() => handleEdit(appointment._id)} 
                                disabled={
                                    isClassReservation || 
                                    appointment.status === 'cancelled'}>Modify</button>
                            <button 
                                onClick={openModal}
                                aria-expanded={isDialogOpen}
                                aria-controls="delete-dialog"
                                aria-haspopup="dialog"
                                >
                                    Delete
                            </button>
                            <dialog id='delete-dialog' ref={dialogRef} onClick={handleDialogClick}>
                                <div className="dialog-close-button-wrapper">
                                    <button onClick={closeModal} className="dialog-close-button">Close <img src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"/></button>
                                </div>
                                <h4>Are you sure you want to delete the {appointmentType} for</h4>
                                <div>  
                                    <h3>{appointment.equipmentName}</h3>
                                    <p>on {appointmentDate.toDateString()}</p>
                                    <p>at {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                                    </p>
                                </div>
                                {!isClassReservation && appointment.status !== 'cancelled' && <button onClick={() => handleEdit(appointment._id)}>Modify</button>}
                                <button onClick={() => handleDelete(appointment._id)}>Delete</button>
                            </dialog>
                        </div>
                    )
                }
        </section>
    )
}