import { useEffect, useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom';
import { ObjectId } from "bson";
import AppointmentCardSummary from "../Cards/AppointmentCardSummary.jsx";
import EquipmentSelection from "../User/AppointmentFlow/EquipmentSelection.jsx";
import DateTimeSelection from "../User/AppointmentFlow/DateTimeSelection.jsx";
import { API_URL } from "../../../config.js";
import './NewAppointment.css'

export default function EditAppointment() {
    const location = useLocation();
    const navigate = useNavigate();
    const appointmentId = location.state;

    const [appointment, setAppointment] = useState(null); 
    const [updatedData, setUpdatedData ] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('')
    const [step, setStep] = useState('overview')
    const [isUpdated, setIsUpdated ] = useState(false)

    //appointment data
    const [appointmentType, setAppointmentType] = useState(appointment?.type === 'class-reservation' ? 'Class Reservation' : 'Appointment');
    const [isClassReservation, setIsClassReservation] = useState(appointment?.type === 'class-reservation');
    const [appointmentDate, setAppointmentDate] = useState(new Date(appointment?.date))
    const [reservationEnd, setReservationEnd] = useState(appointment?.type === 'class-reservation' && appointment.endTime ? appointment.endTime : null)

    //populate the form with appointment data
    const [classNumber, setClassNumber] = useState('')
    const [notes, setNotes] = useState('')
    
    //Get appointment data
    useEffect(() => {
        fetchAppointment(appointmentId)
    }, [appointmentId])

    async function fetchAppointment(appointmentId) {
        try {
            setError('')
            setLoading(true);
            const response = await fetch(`${API_URL}/api/me/appointment/${appointmentId}`, {credentials:'include'});
            const data = await response.json();
            if (response.ok) {
                setAppointment(data.appointment)
                setAppointmentType(data.appointment.type === 'class-reservation' ? 'Class Reservation' : 'Appointment')
                setIsClassReservation(data.appointment.type === 'class-reservation')
                setAppointmentDate(new Date(data.appointment.date))
                setReservationEnd(appointment?.type === 'class-reservation' && appointment.endTime ? appointment.endTime : null)
                setClassNumber(data.appointment.classNumber)
                setNotes(data.appointment.notes)
                return
            } else {
                setError(data.error)
            }
        } catch {
            setError(`Error loading appointment data. Try again later`)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <main>Loading...</main>
    if (error) return <main>Error: {error}</main>
    if (!appointment) return <main>No appointment found</main>

    //function to change steps
    function handleClickItem(step) {
        setStep(step)
    }

    //STEP: Equipment
    const equipmentEditMode = {
        status: 'edit',
        prevEquipmentId: appointment.equipmentId.toString(),
        prevMaterialSelections: appointment.materialSelections,
        prevDate: appointment.date
    }

    function submitEquipment(equipment, materialSelection = []) {

        const equipmentChanged = equipment._id !== appointment.equipmentId.toString();
    
        // Check if materials changed (only relevant if equipment is the same)
        let materialsChanged = false;
        if (!equipmentChanged && appointment.materialSelections?.length > 0) {
            const currentIds = materialSelection.map(m => m.id).sort().join(',');
            const previousIds = appointment.materialSelections.map(m => m.id).sort().join(',');
            materialsChanged = currentIds !== previousIds;
        } else if (!equipmentChanged && materialSelection.length > 0 && !appointment.materialSelections?.length) {
            materialsChanged = true; // Materials added when there were none before
        }
    
        // Only update if something changed
        if (equipmentChanged || materialsChanged) {
            
            const updates = {};
            
            // If equipment changed, update all equipment fields
            if (equipmentChanged) {
                updates.equipmentId = new ObjectId(equipment._id);
                updates.equipmentName = equipment.name;
                updates.location = equipment.location;
            }
        
            // Update material selections if equipment changed OR materials changed
            if (equipmentChanged || materialsChanged) {
                if (materialSelection.length > 0) {
                    updates.materialPreference = true;
                    updates.materialSelections = materialSelection;
                } else {
                    updates.materialPreference = false;
                    updates.materialSelections = null;
                }
            }
            setAppointment(prev => ({ ...prev, ...updates }));
            setUpdatedData(prev => ({ ...prev, ...updates }));
            setIsUpdated(true);
        }
        
        setStep("overview");
}
    
    // STEP 2: date and time

    const dateTimeEditMode = {
        status: 'edit',
        prevDate: appointment.date,
        prevTime: appointment.startTime,
        appointmentId: appointment._id
    }

    function submitDateTime(selectedDate, selectedTime) {
        const prevAppointementDate = new Date(appointment.date)

        const dateChanged = selectedDate.getTime() !== prevAppointementDate.getTime()

        const timeChanged = selectedTime.startTime !== appointment.startTime

        if (dateChanged || timeChanged) {
            const updates = {}

            if (dateChanged) {
                updates.date = selectedDate;
                updates.startTime = selectedTime.startTime
                updates.endTime = selectedTime.endTime
            } else if (timeChanged) {
                updates.startTime = selectedTime.startTime
                updates.endTime = selectedTime.endTime
            }
            setAppointment(prev => ({...prev, ...updates}))
            setAppointmentDate(new Date(selectedDate))
            setUpdatedData(prev => ({...prev, ...updates}))
            setIsUpdated(true);
            
        }

        setStep("overview");
    }

    console.log(appointmentDate)

    //STEP 3: Details

    async function handleSubmit(e) {
        setIsUpdated(true);
        e.preventDefault();
        const classChanged = classNumber.toLowerCase().trim() !== appointment.classNumber.toLowerCase().trim()
        const notesChanged = notes.trim() !== appointment.notes.trim()

        const updates = {}

        if ( classChanged || notesChanged ) {
            
            if ( classChanged ) {
                updates.classNumber = classNumber.trim()
            }

            if ( notesChanged ) {
                updates.notes = notes.trim()
            }
        }
        
        const differences = {
                ...updates,
                ...updatedData
            }

        await updateAppointment(differences)
    }

    //STEP 4: Submit apppointment data and show confirmation

    async function updateAppointment(differences) {
        try {
            setError('')
            const response = await fetch(`${API_URL}/api/me/appointment/${appointmentId}`, {
                credentials: 'include',
                method: "PUT",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(differences)
            })
            if (response.ok) {
                navigate('/dashboard')

            } else {
                setError('Something went wrong during the update. Please try again later')
            }
        } catch (err) {
            console.log(err)
        }
    }
    
    function handleCancel() {
        navigate('/dashboard')
    }

    function handleKeyActivate(e, callback) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback();
        }
    }

    return (
        <main className="flow">
            <article>

                
                <h1>Modify Appointment</h1>
                {step === 'overview' && 
                    <article className="edit-appointment">
                        <section className="card edit-appointment">
                            {/* Equipment+Materials section */}
                            <div
                                className="card-content-group hover"
                                onClick={() => handleClickItem('equipment')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => handleKeyActivate(e, () => handleClickItem('equipment'))}
                                aria-label="Edit equipment selection"
                            >
                                <div>
                                    <p>{appointmentType} for</p>
                                    <h3>{appointment?.equipmentName}</h3>           
                                </div>                     
                                { appointment.materialPreference ? (
                                    <div> 
                                        <p>Preferred  Materials</p>
                                            {appointment.materialSelections.map(material => (
                                                <p key={material.id}><strong>{material.material} {material.size} {material.color}</strong></p>
                                            ))}
                                    </div>
                                    ) : null}
                            </div>
                            
                            {/* Date+Time name */}
                            {appointment?.date && (
                                <div
                                    className='card-content-group hover'
                                    onClick={() => handleClickItem('time')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => handleKeyActivate(e, () => handleClickItem('time'))}
                                    aria-label="Edit date and time selection"
                                >
                                        <div>   
                                            <p>{appointmentType} at</p>
                                            <div className="card-icon-text">
                                                <img src="/icons/calendar_month_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Calendar" width="24" height="24" />
                                                <p>{appointmentDate.toDateString()}</p>
                                            </div>
                                            <div className="card-icon-text">
                                                <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                                                <p>{appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}{isClassReservation && `–${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                            )}
                            <form onSubmit={e => handleSubmit(e)}>
                                <div>
                                    <label htmlFor='classNumber'>Class</label>
                                    <input
                                        type="text"
                                        id="classNumber"
                                        name="classNumber"
                                        placeholder="ART XXX"
                                        value={classNumber}
                                        onChange={(e) => {
                                            setClassNumber(e.target.value);
                                            setIsUpdated(true);
                                        }}/>
                                </div>
                                <div> 
                                    <label htmlFor='details'>Additional details</label>
                                    <textarea
                                        id="details"
                                        name="details"
                                        placeholder="Provide details of what you need to do so we can better prepare for your visit"
                                        value={notes}
                                        onChange={(e) => {
                                            setNotes(e.target.value);
                                            setIsUpdated(true);
                                        }}
                                        />
                                </div>
                            </form>
                            <div className='card-button-group column'>
                                <button disabled={!isUpdated} onClick={e => handleSubmit(e)}>Submit</button>
                                <button onClick={handleCancel}>Cancel</button>
                            </div>
                        </section>
                        
                    </article>
                }
                {(step === 'equipment' || step === 'materials') && 
                    <section className="appointment-booking-grid">
                        <div className="appointment-sidebar flow">
                            <button className='back-button' onClick={() => setStep('overview')}>Go back</button>
                            <AppointmentCardSummary
                                appointment={appointment}
                                handleClickItem={handleClickItem}
                                mode={'edit'}/>
                            
                        </div>
                        <div className="grid-main grid-main-centered">
                            <EquipmentSelection
                                submitEquipment={submitEquipment}
                                mode={equipmentEditMode}
                                />
                        </div>
                    </section>
                }
                {step === 'time' &&
                    <section className="appointment-booking-grid">
                        <div className="appointment-sidebar flow">
                            <button className='back-button' onClick={() => setStep('overview')}>Go back</button>
                            <AppointmentCardSummary
                                appointment={appointment}
                                handleClickItem={handleClickItem}
                                mode={'edit'}/>
                        </div>
                        <div className="grid-main">
                            <DateTimeSelection 
                                equipmentId={appointment.equipmentId}
                                submitDateTime={submitDateTime}
                                mode={dateTimeEditMode}
                                />
                        </div>
                    </section>
                }
            </article>
        </main>
    )
}
