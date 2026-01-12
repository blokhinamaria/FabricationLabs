import { useState, useEffect, useRef } from "react"
import './Appointment.css'
import { AlarmIcon, ArrowDownIcon, ArrowUpIcon, CalendarIcon, CloseSmallIcon, ExpandCircleDownIcon, ExpandCircleUpIcon, MailIcon, PersonIcon, StackIcon } from '../../Icons.jsx';
import { useAuth } from "../../../AuthContext";
import Tooltip from '@mui/material/Tooltip';

export default function AppointmentCardAdmin({id, data, fetchAppointments}) {

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
        setEmailFormError('')
        
        if (!subject.trim()) {
            setEmailFormError('Email Subject is required')
            return
        }

        if (!message.trim()) {
            setEmailFormError('Email Message is required')
            return
        }

        if (userRole === 'demo-admin') {
            window.alert('Email sent')
            closeModal(contactDialogRef)
            setMessage('')
            setSubject('')
            return;
        }
        
        const email = appointment.userEmail;

        if (!email) {
            setEmailFormError('User email is required')
            return
        }

        let html = message.trim();

        const alert = 'Email sent';

        await sendEmail(email, subject.trim(), html, alert)
        setMessage('')
        setSubject('')
        closeModal(contactDialogRef);

    }

    const [ cancellationReason, setCancellationReason ] = useState('')

    async function handleCancel(appointmentId) {
        if (userRole === 'demo-admin') {
            setAppointmentStatus('cancelled');
            window.alert('Cancellation notice sent')
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
                await fetchAppointments();
            }
        } catch (err) {
            console.log(err)
            window.alert('Something went wrong, please try again later')
        }
    }

    const [emailFormError, setEmailFormError] = useState('')

    async function sendEmail(email, subject, html, alert) {
        setEmailFormError('')

        try {
            const response = await fetch('/api/send-email', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email: email, subject: subject, html: html })
            })
            if (response.ok) {
                window.alert(alert)
            } else {
                throw new Error('Something went wrong')
            }
        } catch (err) {
            // setErrorMessage('Something went wrong. Please try again')
            console.log(err)
            setEmailFormError(err)
        }
    }

    const [isDateVisible, setIsDateVisible] = useState(false);
    const [isEmailVisible, setIsEmailVisible] = useState(false);

    const [ isExpanded, setIsExpanded ] = useState(false);

    function handleExpand() {
        if (isExpanded) {
            setIsExpanded(false);
            setIsDateVisible(false);
            setIsEmailVisible(false);
        } else {
            setIsExpanded(true);
            setIsDateVisible(true);
            setIsEmailVisible(true);
        }
    }

    if (loading) return <p>Loading...</p>
    if (error) return <div>Error: {error}</div>
    if (!appointment) return <p>No appointment found</p>

    return (
        <section className={`appointment-overview ${appointmentStatus === 'cancelled' ? ('deleted') : null}` }>   
            <div className="appointment-overview-group">
                {appointmentStatus === 'cancelled' &&
                <p className="error-message">Cancelled</p>}
                <p>{appointment.type === 'class-reservation' ? "Class" : "Individual"}</p>
                {isExpanded ? 
                    (
                        <Tooltip title='Hide details' arrow placement="right">
                            <ExpandCircleUpIcon className="dropdown-icon" onClick={handleExpand}/>
                        </Tooltip>
                    ) : (
                        <Tooltip title='See all details' arrow placement="right">
                            <ExpandCircleDownIcon className="dropdown-icon" onClick={handleExpand} />
                        </Tooltip>
                    )
                }
            </div>
            {!isDateVisible ? (
                <div  className="appointment-overview-group hover" onClick={() => setIsDateVisible(prev => !prev)}>
                    <div className="appointment-icon-text">
                        <AlarmIcon/>
                        <p>
                            {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                        </p>
                    </div>
                    <ArrowDownIcon className="dropdown-icon"/>
                </div>
            ) : (
                <div className="appointment-overview-group hover" onClick={() => setIsDateVisible(prev => !prev)}>
                    <div className="appointment-icon-text">
                        <AlarmIcon/>
                        <p>
                            {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                        </p>
                    </div>
                    <div className="appointment-icon-text">
                        <CalendarIcon />
                        <p>{appointmentDate.toDateString()}</p>
                    </div>
                    <ArrowUpIcon className="dropdown-icon"/>
                </div>
            )}
            
            <h3>{appointment.equipmentName}</h3>
            {appointment.materialPreference &&
                <div className="appointment-icon-text">
                    <StackIcon />
                    <p><em>Preferred Materials</em></p>
                    {appointment.materialSelections.map(material => (
                                <p key={material.id}>{material.material} {material.size} {material.color}</p>
                            ))}
                </div>
            }
            {appointment.userName ? (
                !isEmailVisible ? 
                (<div  className="appointment-overview-group hover" onClick={() => setIsEmailVisible(prev => !prev)}>
                    <div className="appointment-icon-text">
                        <PersonIcon />
                        <p>{appointment.userName}</p>
                    </div>
                    <ArrowDownIcon className="dropdown-icon"/>
                </div>
                ) : (
                    <div  className="appointment-overview-group hover" onClick={() => setIsEmailVisible(prev => !prev)}>
                        <div className="appointment-icon-text">
                            <PersonIcon />
                            <p>{appointment.userName}</p>
                        </div>
                        <div className="appointment-icon-text" onClick={handleCopyClick}>
                            <MailIcon />
                            <Tooltip title={copied ? ('Copied') : "Click to copy the email"} arrow placement="right">
                                <p ref={userEmailRef} className="text-to-copy">{appointment.userEmail}</p>
                            </Tooltip>
                        </div>
                        <ArrowUpIcon className="dropdown-icon"/>
                    </div>
                )) : (
                    <div className="appointment-icon-text">
                            <MailIcon />
                            <p>{appointment.userEmail}</p>
                        </div>
                )
            }

            {isExpanded && (
                <>
                    {appointment.classNumber && 
                        <div className="appointment-overview-group">
                            <p><em>Class number:</em></p>
                            <p>{appointment.classNumber}</p>
                        </div>}
                    {appointment.notes && 
                        <div className="appointment-overview-group">
                            <p><em>Additional details:</em></p>
                            <p>{appointment.notes}</p>
                        </div>}
                </>
            )}

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
                                    <button onClick={() => (closeModal(contactDialogRef), setIsContactDialogOpen(false))} className="dialog-close-button">Close <CloseSmallIcon/> </button>
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
                                            />
                                    </div>
                                    <div>
                                        <label htmlFor="message">Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            placeholder="Message to the user"
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            />
                                    </div>
                                    <p>The user will be notified via email</p>
                                    {emailFormError && <p className="error-message">{emailFormError}</p>}
                                    <button type="submit">Send email</button>
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
                                    <button onClick={() => (closeModal(cancelDialogRef), setIsCancelDialogOpen(false))} className="dialog-close-button">Close <CloseSmallIcon /></button>
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