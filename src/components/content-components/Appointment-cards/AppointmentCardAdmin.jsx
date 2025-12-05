import { useState, useEffect, useRef } from "react"
import './Appointment.css'
import { useAuth } from "../../../AuthContext";
import Tooltip from '@mui/material/Tooltip';

export default function AppointmentCardAdmin({id, data}) {

    const { userRole } = useAuth()

    const [ appointment, setAppointment ] = useState(data || null);
    const [ loading, setLoading ] = useState(!data);
    const [ error, setError ] = useState(null);
    const [ appointmentStatus, setAppointmentStatus ] = useState(appointment?.status)

    const [message, setMessage ] = useState('')
    const [subject, setSubject] = useState('')

    const userEmailRef = useRef(null);
    const [ copied, setCopied ] = useState(false);
    const contactDialogRef = useRef(null);
    const cancelDialogRef = useRef(null);

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

    async function handleCopyClick (e) {
        e.stopPropagation();
        setIsEmailVisible(true)
        if (userEmailRef.current) {
            const textToCopy = userEmailRef.current.textContent;
            try {
                await navigator.clipboard.writeText(textToCopy);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)


    const openModal = (dialogRef) => {
        dialogRef.current.showModal()
        // setIsDialogOpen(true)
    }

    const closeModal = (dialogRef) => {
        dialogRef.current.close()
        // setIsDialogOpen(false)
    }

    // close dialog when clicking outside
    const handleDialogClick = (e, dialogRef) => {
        if (e.target === dialogRef.current) {
            closeModal(dialogRef);
        }
        // closeModal(dialogRef);
    }

    async function handleSendMessage(e) {
        e.preventDefault();
        if (userRole === 'demo-admin') {
            alert('Email sent')
            closeModal(contactDialogRef)
            return;
        }
        
        const email = appointment.userEmail;

        let html = message;

        const alert = 'Email sent';

        await sendEmail(email, subject, html, alert)
        setMessage('')
        setSubject('')
        closeModal(contactDialogRef);

    }

    const [ cancellationReason, setCancellationReason ] = useState('')

    async function handleCancel(appointmentId) {
        if (userRole === 'demo-admin') {
            setAppointmentStatus('cancelled')
            closeModal(cancelDialogRef);
            return;
        }

        const email = appointment.userEmail

        const subject = 'Appointment Cancelled'

        let html = `
            <p>Hi there,</p>
            <p>We had to cancel your ${appointmentType} for ${appointment.equipmentName}</p>
            <p>On ${appointmentDate.toDateString()} at ${appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
            <p>Reason for cancellation</p>
            <p>${cancellationReason}</p>
            <p>You can use the link below to login and reschedule</p>
            <a href="{{VERIFY_LINK}}" target="_self" style="background:#6dff60;color:#000;padding:10px 20px;text-decoration:none;border-radius:4px;">Log in</a>
            <p>This link expires in 30 minutes since the email was sent. If link has expired login to <a href="fabrication-labs.vercel.app>UTampa Fabrication Labs here</a> to reschedule</p>
            <p>– The FabLab Team</p>
        `

        const alert = 'Cancellation notice sent'

        try {
            const response = await fetch(`/api/appointments?id=${appointmentId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({status: 'cancelled'})
            })
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                setAppointmentStatus('cancelled')
                await sendEmail(email, subject, html, alert)
                closeModal(cancelDialogRef);
            }
        } catch (err) {
            console.log(err)
            alert('Something went wrong, please try again later')
        }
    }

    async function sendEmail(email, subject, html, alert) {

        try {
            const response = await fetch('/api/send-email', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email: email, subject: subject, html: html })
            })
            if (response.ok) {
                alert(alert)
            } else {
                throw new Error('Something went wrong')
            }
        } catch (err) {
            // setErrorMessage('Something went wrong. Please try again')
            console.log(err)
        }
    }

    const [dateVisible, setDateVisible] = useState(false);
    const [isEmailVisible, setIsEmailVisible] = useState(false);


    if (loading) return <p>Loading...</p>
    if (error) return <div>Error: {error}</div>
    if (!appointment) return <p>No appointment found</p>

    return (
        <section className={`appointment-overview ${appointmentStatus === 'cancelled' ? ('deleted') : null}` }>   
            <div className="appointment-overview-group">
                {appointmentStatus === 'cancelled' &&
                <p className="error-message">Cancelled</p>}
                <p>{appointment.type === 'class-reservation' ? "Class" : "Individual"}</p>
            </div>
            {!dateVisible ? (
                <div  className="appointment-overview-group hover" onClick={() => setDateVisible(prev => !prev)}>
                    <div className="appointment-icon-text">
                        <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                        <p>
                            {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                        </p>
                    </div>
                    <img className="dropdown-icon" src="/icons/keyboard_arrow_down_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" />
                </div>
            ) : (
                <div className="appointment-overview-group hover" onClick={() => setDateVisible(prev => !prev)}>
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
                    <img className="dropdown-icon" src="/icons/keyboard_arrow_up_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" />
                </div>
            )}
            
            <h3>{appointment.equipmentName}</h3>
            {appointment.materialPreference &&
                <div className="appointment-icon-text">
                    <img src="/icons/stacks_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg" alt="Clock" width="24" height="24" />
                    <div>
                        <em>
                        Preferred Materials
                        
                    </em>
                    {appointment.materialSelections.map(material => (
                                <p key={material.id}>{material.material} {material.size} {material.color}</p>
                            ))}
                    </div>
                    
                </div>
            }
            {appointment.userName ? (
                !isEmailVisible ? 
                (<div  className="appointment-overview-group hover" onClick={() => setIsEmailVisible(prev => !prev)}>
                    <div className="appointment-icon-text">
                        <img src="/icons/person_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg" alt="Calendar" width="24" height="24" />
                        <p>{appointment.userName}</p>
                    </div>
                    <img className="dropdown-icon" src="/icons/keyboard_arrow_down_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" />
                </div>
                ) : (
                    <div  className="appointment-overview-group hover" onClick={() => setIsEmailVisible(prev => !prev)}>
                        <div className="appointment-icon-text">
                            <img src="/icons/person_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg" alt="Calendar" width="24" height="24" />
                            <p>{appointment.userName}</p>
                        </div>
                        <div className="appointment-icon-text" onClick={handleCopyClick}>
                            <img src="/icons/mail_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg" alt="Calendar" width="24" height="24" />
                            <Tooltip title={copied ? ('Copied') : "Click to copy the email"} arrow placement="right">
                                <p ref={userEmailRef} className="text-to-copy">{appointment.userEmail}</p>
                            </Tooltip>
                        </div>
                        <img className="dropdown-icon" src="/icons/keyboard_arrow_up_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" />
                    </div>
                )) : (
                    <div className="appointment-icon-text">
                            <img src="/icons/mail_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg" alt="Calendar" width="24" height="24" />
                            <p>{appointment.userEmail}</p>
                        </div>
                )
            }
                        <div className="appointment-button-container">
                            <button 
                                onClick={() => (openModal(contactDialogRef), setIsContactDialogOpen(true))}
                                aria-expanded={isContactDialogOpen}
                                aria-controls="contact-dialog"
                                aria-haspopup="dialog"
                                disabled={appointmentStatus === 'cancelled'}
                                >
                                    Contact User
                            </button>
                            <dialog id='contact-dialog' ref={contactDialogRef} onClick={(e) => (handleDialogClick(e, contactDialogRef), setIsContactDialogOpen(false))}>
                                <div className="dialog-close-button-wrapper">
                                    <button onClick={() => (closeModal(contactDialogRef), setIsContactDialogOpen(false))} className="dialog-close-button">Close <img src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"/></button>
                                </div>
                                <div>
                                    <h2>Contact User</h2>
                                {appointment.userName ? (
                                    <h3>{appointment.userName}<br/>{appointment.userEmail}</h3>
                                ) : (
                                    <h3>{appointment.userEmail}</h3>
                                )}
                                </div>
                                <form onSubmit={handleSendMessage}>
                                    <h4>What is your message?</h4>
                                    <div>
                                        <label htmlFor="subject">Subject</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            placeholder="Email subject"
                                            value={subject}
                                            onChange={e => setSubject(e.target.value)}
                                            required />
                                    </div>
                                    <div>
                                        <label htmlFor="message">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            placeholder="Message to the user"
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            required />
                                    </div>
                                    <p>The user will be notified via email</p>
                                    <button type="submit">Send message</button>
                                </form>
                                
                                <div>
                                    <h2>Appointment Details</h2>
                                    <h3>{appointment.equipmentName}</h3>
                                    <p>on {appointmentDate.toDateString()}</p>
                                    <p>at {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                                    </p>
                                </div>
                                
                            </dialog>

                            <button 
                                onClick={() => (openModal(cancelDialogRef), setIsCancelDialogOpen(true))}
                                aria-expanded={isCancelDialogOpen}
                                aria-controls="cancel-dialog"
                                aria-haspopup="dialog"
                                disabled={appointmentStatus === 'cancelled'}
                                >
                                    {appointmentStatus !== 'cancelled' ? 'Cancel' : 'Cancelled'}
                            </button>
                            
                            <dialog id='cancel-dialog' ref={cancelDialogRef} onClick={(e) => (handleDialogClick(e, cancelDialogRef), setIsCancelDialogOpen(false))}>
                                <div className="dialog-close-button-wrapper">
                                    <button onClick={() => (closeModal(cancelDialogRef), setIsCancelDialogOpen(false))} className="dialog-close-button">Close <img src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"/></button>
                                </div>
                                    <div>  
                                        <h4>Are you sure you want to cancel the {appointmentType} for</h4>
                                        <h3>{appointment.equipmentName}</h3>
                                        <p>on {appointmentDate.toDateString()}</p>
                                        <p>at {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                        {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                                    </p>
                                    </div>
                                    <div>
                                        <label htmlFor="reason">Reason</label>
                                        <input
                                            type="text"
                                            id="reason"
                                            name="reason"
                                            placeholder="Reason for appointment cancelation"
                                            value={cancellationReason}
                                            onChange={e => setCancellationReason(e.target.value)}
                                            required />
                                    </div>
                                    <p>The user will be notified via email</p>
                                
                                <button onClick={() => handleCancel(appointment._id)}>Cancel {appointmentType}</button>
                            </dialog>
                        </div>
        </section>
    )
}