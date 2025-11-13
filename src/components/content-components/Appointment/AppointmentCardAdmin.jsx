import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import './Appointment.css'

export default function AppointmentCardAdmin({id, data}) {

    const [ appointment, setAppointment ] = useState(data || null);
    const [ loading, setLoading ] = useState(!data);
    const [ error, setError ] = useState(null);
    const [ appointmentStatus, setAppointmentStatus ] = useState('')
    const navigate = useNavigate();
    const dialogRef = useRef(null);

    const appointmentDate = new Date(appointment?.date);
    const isClassReservation = appointment?.type === 'class-reservation';
    const appointmentType = (appointment?.type === 'class-reservation' ? 'Class Reservation' : 'Appointment');
    const reservationEnd = (isClassReservation && appointment.endTime ? new Date(appointment.endTime) : null)
    
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
            console.log(`Error fetching appointment data: ${err}`)
        } finally {
            setLoading(false)
        }
    }

    function handleContact() {
        console.log('contact')
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

    async function handleCancel(appointmentId) {
        try {
            const response = await fetch(`/api/appointments?id=${appointmentId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({status: 'canceled'})
            })
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                setAppointmentStatus('Cancelled')
                closeModal();
            }
        } catch (err) {
            console.log(err)
            alert('Something went wrong, please try again later')
        }
    }

    const [dateVisible, setDateVisible] = useState(false);

    if (loading) return <p>Loading...</p>
    if (error) return <div>Error: {error}</div>
    if (!appointment) return <p>No appointment found</p>

    return (
        <div
            className={`appointment-card appointment-overview-details ${appointmentStatus === 'cancelled' ? ('deleted') : null}` }
        >   
            <p>{appointment.type === 'class-reservation' ? "Class" : "Individual"}</p>
            <p>{appointment.status}</p>
            {!dateVisible ? (
                <div className="appointment-icon-text" onClick={() => setDateVisible(prev => !prev)}>
                        <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                        <p>
                            {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                        </p>
                </div>
            ) : (
                <div className="appointment-overview-details" onClick={() => setDateVisible(prev => !prev)}>
                    <div className="appointment-icon-text">
                        <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                        <p>
                            {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                        </p>
                    </div>
                    <div className="appointment-icon-text">
                        <img src="/icons/calendar_month_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Calendar" width="24" height="24" />
                        <p>{appointmentDate.toDateString()}</p>
                    </div>
                </div>
            )}
            
            <h3>{appointment.equipmentName}</h3>
            {appointment.materialPreference &&
                <div className="appointment-icon-text">
                    <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                    <p>
                        Preferred Materials
                    </p>
                </div>
            }
            <div className="appointment-icon-text" onClick={() => handleContact()}>
                <img src="/icons/calendar_month_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Calendar" width="24" height="24" />
                <p>{appointment.userName || appointment.userEmail}</p>
            </div>
            
            

                        <div className="appointment-button-container">
                            <button>View Details</button>
                            <button 
                                onClick={openModal}
                                aria-expanded={isDialogOpen}
                                aria-controls="delete-dialog"
                                aria-haspopup="dialog"
                                >
                                    Cancel
                            </button>
                            <dialog id='delete-dialog' ref={dialogRef} onClick={handleDialogClick}>
                                <button onClick={closeModal}>Close</button>
                                <h4>Are you sure you want to cancel the {appointmentType} for</h4>
                                <div>  
                                    <h3>{appointment.equipmentName}</h3>
                                    <p>on {appointmentDate.toDateString()}</p>
                                    <p>at {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                                    </p>
                                    <div>
                                        <label htmlFor="reason">Reason</label>
                                        <input type="text" id="reason" name="reason" placeholder="Reason for appointment cancelation" />
                                    </div>
                                    <p>The user will be notified via email</p>
                                </div>
                                <button onClick={() => handleCancel(appointment._id)}>Cancel</button>
                            </dialog>
                        </div>
        </div>
    )
}