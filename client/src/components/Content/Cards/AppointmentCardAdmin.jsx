import { useState, useEffect, useRef } from "react"
import { AlarmIcon, ArrowDownIcon, ArrowUpIcon, CalendarIcon, ExpandCircleDownIcon, ExpandCircleUpIcon, MailIcon, PersonIcon, StackIcon } from '../../Icons/Icons.jsx';
import Tooltip from '@mui/material/Tooltip';
import { API_URL } from "../../../config.js";
import ContactDialogAdmin from "./Dialogs/ContactDialogAdmin.jsx";
import CancelDialogAdmin from "./Dialogs/CancelDialogAdmin.jsx";

export default function AppointmentCardAdmin({id, data}) {

    const [ appointment, setAppointment ] = useState(data || null);
    const [ loading, setLoading ] = useState(!data);
    const [ error, setError ] = useState(null);
    const [ appointmentStatus, setAppointmentStatus ] = useState(appointment?.status)

    const userEmailRef = useRef(null);
    const [ copied, setCopied ] = useState(false);
    const contactDialogRef = useRef(null);
    const cancelDialogRef = useRef(null);

    const appointmentDate = new Date(appointment?.date);
    const isClassReservation = appointment?.type === 'class-reservation';
    const reservationEnd = (isClassReservation && appointment.endTime ? new Date(appointment.endTime) : null)
    
    useEffect(() => {
        if (!data && id) {
            fetchAppointment(id)
        }
    }, [id, data])

    async function fetchAppointment(appointmentId) {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/api/admin/appointment/${appointmentId}`, {credentials:'include'})
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
    }

    const closeModal = (dialogRef) => {
        dialogRef.current.close()
    }

    // close dialog when clicking outside
    const handleDialogClick = (e, dialogRef) => {
        if (e.target === dialogRef.current) {
            closeModal(dialogRef);
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

    function handleKeyActivate(e, callback) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback(e);
        }
    }

    if (loading) return <p>Loading...</p>
    if (error) return <div>Error: {error}</div>
    if (!appointment) return <p>No appointment found</p>

    return (
        <div className={`card ${appointmentStatus === 'cancelled' ? ('deleted') : null}` }>   
            <div className="card-content-group">
                {appointmentStatus === 'cancelled' &&
                <p className="error-message">Cancelled</p>}
                <p>{appointment.type === 'class-reservation' ? "Class" : "Individual"}</p>
                {isExpanded ? 
                    (
                        <Tooltip title='Hide details' arrow placement="right">
                            <ExpandCircleUpIcon
                                className="dropdown-icon"
                                onClick={handleExpand}
                                onKeyDown={(e) => handleKeyActivate(e, () => handleExpand())}
                                role="button"
                                tabIndex={0}
                                aria-label="Hide details"
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title='See all details' arrow placement="right">
                            <ExpandCircleDownIcon
                                className="dropdown-icon"
                                onClick={handleExpand}
                                onKeyDown={(e) => handleKeyActivate(e, () => handleExpand())}
                                role="button"
                                tabIndex={0}
                                aria-label="Show all details"
                            />
                        </Tooltip>
                    )
                }
            </div>
            {!isDateVisible ? (
                <div
                    className="card-content-group hover"
                    onClick={() => setIsDateVisible(prev => !prev)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyActivate(e, () => setIsDateVisible(prev => !prev))}
                    aria-label="Toggle date details"
                >
                    <div className="card-icon-text">
                        <AlarmIcon/>
                        <p>
                            {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                        </p>
                    </div>
                    <ArrowDownIcon className="dropdown-icon"/>
                </div>
            ) : (
                <div
                    className="card-content-group hover"
                    onClick={() => setIsDateVisible(prev => !prev)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyActivate(e, () => setIsDateVisible(prev => !prev))}
                    aria-label="Toggle date details"
                >
                    <div className="card-icon-text">
                        <AlarmIcon/>
                        <p>
                            {appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            {isClassReservation && ` to ${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                        </p>
                    </div>
                    <div className="card-icon-text">
                        <CalendarIcon />
                        <p>{appointmentDate.toDateString()}</p>
                    </div>
                    <ArrowUpIcon className="dropdown-icon"/>
                </div>
            )}
            
            <h3>{appointment.equipmentName}</h3>
            {appointment.materialPreference &&
                <div className="card-icon-text">
                    <StackIcon />
                    <p><em>Preferred Materials</em></p>
                    {appointment.materialSelections.map(material => (
                        <p key={material.id}>{material.material} {material.size} {material.color}</p>
                    ))}
                </div>
            }
            {appointment.userName ? (
                !isEmailVisible ? 
                (<div
                    className="card-content-group hover"
                    onClick={() => setIsEmailVisible(prev => !prev)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyActivate(e, () => setIsEmailVisible(prev => !prev))}
                    aria-label="Show email"
                >
                    <div className="card-icon-text">
                        <PersonIcon />
                        <p>{appointment.userName}</p>
                    </div>
                    <ArrowDownIcon className="dropdown-icon"/>
                </div>
                ) : (
                    <div
                        className="card-content-group hover"
                        onClick={() => setIsEmailVisible(prev => !prev)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => handleKeyActivate(e, () => setIsEmailVisible(prev => !prev))}
                        aria-label="Hide email"
                    >
                        <div className="card-icon-text">
                            <PersonIcon />
                            <p>{appointment.userName}</p>
                        </div>
                        <div
                            className="card-icon-text"
                            onClick={handleCopyClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyActivate(e, handleCopyClick)}
                            aria-label="Copy user email"
                        >
                            <MailIcon />
                            <Tooltip title={copied ? ('Copied') : "Click to copy the email"} arrow placement="right">
                                <p ref={userEmailRef} className="text-to-copy">{appointment.userEmail}</p>
                            </Tooltip>
                        </div>
                        <ArrowUpIcon className="dropdown-icon"/>
                    </div>
                )) : (
                    <div className="card-icon-text">
                            <MailIcon />
                            <p>{appointment.userEmail}</p>
                        </div>
                )
            }

            {isExpanded && (
                <>
                    {appointment.classNumber && 
                        <div className="card-content-group">
                            <p><em>Class number:</em></p>
                            <p>{appointment.classNumber}</p>
                        </div>}
                    {appointment.notes && 
                        <div className="card-content-group">
                            <p><em>Additional details:</em></p>
                            <p>{appointment.notes}</p>
                        </div>}
                </>
            )}

            <div className="card-button-group">
                <button 
                    onClick={() => (openModal(contactDialogRef), setIsContactDialogOpen(true))}
                    aria-expanded={isContactDialogOpen}
                    aria-controls="contact-dialog"
                    aria-haspopup="dialog"
                    disabled={appointmentStatus === 'cancelled'}
                    >
                        Contact User
                </button>
                <ContactDialogAdmin
                    ref={contactDialogRef}
                    dialogId={`contact-${appointment._id}`}
                    handleDialogClick={handleDialogClick}
                    closeModal={closeModal}
                    onClose={() => setIsContactDialogOpen(false)}
                    appointment={appointment}
                    />
                <button 
                    onClick={() => (openModal(cancelDialogRef), setIsCancelDialogOpen(true))}
                    aria-expanded={isCancelDialogOpen}
                    aria-controls="cancel-dialog"
                    aria-haspopup="dialog"
                    disabled={appointmentStatus === 'cancelled'}
                    >
                        {appointmentStatus !== 'cancelled' ? 'Cancel' : 'Cancelled'}
                </button>
                <CancelDialogAdmin
                    ref={cancelDialogRef}
                    dialogId={`cancel-${appointment._id}`}
                    handleDialogClick={handleDialogClick}
                    closeModal={closeModal}
                    onClose={() => setIsCancelDialogOpen(false)}
                    appointment={appointment}
                    setAppointmentStatus={setAppointmentStatus}
                    fetchAppointment={fetchAppointment}
                />
            </div>
        </div>
    )
}
