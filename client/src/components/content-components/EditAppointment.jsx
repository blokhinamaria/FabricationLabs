import { useEffect, useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom';
import { ObjectId } from "bson";
import AppointmentCardSummary from "./Appointment-cards/AppointmentCardSummary.jsx";
import EquipmentSelection from "./Appointment-components/EquipmentSelection.jsx";
import DateTimeSelection from "./Appointment-components/DateTimeSelection.jsx";

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
            setLoading(true);
            const response = await fetch(`/api/appointments?id=${appointmentId}`);
            const data = await response.json();
            if (response.ok) {
                setAppointment(data.appointment)
                setAppointmentType(data.appointment.type === 'class-reservation' ? 'Class Reservation' : 'Appointment')
                setIsClassReservation(data.appointment.type === 'class-reservation')
                setAppointmentDate(new Date(data.appointment.date))
                setReservationEnd(appointment?.type === 'class-reservation' && appointment.endTime ? appointment.endTime : null)
                setClassNumber(data.appointment.classNumber)
                setNotes(data.appointment.notes)
            } else {
                setError('Failed to load appointment')
            }
        } catch (err) {
            console.log(`Error fetching appointment data: ${err} `)
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
            const response = await fetch(`/api/appointments?id=${appointmentId}`, {
                method: "PUT",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(differences)
            })
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                navigate('/dashboard')

            } else {
                console.error(`Server error: ${response.statusText}`)
            }
        } catch (err) {
            console.log(err)
        }
    }
    
    function handleCancel() {
        navigate('/dashboard')
    }

    return (
        <main>
            <h1>Modify Appointment</h1>
            {step === 'overview' && 
                <article className="edit-appointment">
                    
                    <section className="appointment-overview edit-appointment">
                        {/* Equipment+Materials section */}
                        <div className="appointment-overview-group hover" onClick={() => handleClickItem('equipment')}>
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
                            <div className='appointment-overview-group hover' onClick={() => handleClickItem('time')}>
                                    <p>{appointmentType} at</p>
                                    <div className="appointment-icon-text">
                                        <img src="/icons/calendar_month_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Calendar" width="24" height="24" />
                                        <p>{appointmentDate.toDateString()}</p>
                                    </div>
                                    <div className="appointment-icon-text">
                                        <img src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg" alt="Clock" width="24" height="24" />
                                        <p>{appointmentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}{isClassReservation && `–${reservationEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`}</p>
                                    </div>
                                </div>
                                
                        )}
                        <form className="appointment-overview-group" onSubmit={e => handleSubmit(e)}>
                            <div className="input-group-wrapper column">
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
                            <div className="input-group-wrapper column"> 
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
                        <div className='appointment-button-container column'>
                            <button disabled={!isUpdated} onClick={e => handleSubmit(e)}>Submit</button>
                            <button onClick={handleCancel}>Cancel</button>
                        </div>
                    </section>
                    
                </article>
            }
            {(step === 'equipment' || step === 'materials') && 
            <div className="appointment-booking-grid">
                <div className="appointment-sidebar appointment-card">
                    <button onClick={() => setStep('overview')}>Go back</button>
                    <AppointmentCardSummary
                        appointment={appointment}
                        handleClickItem={handleClickItem}
                        mode={'edit'}/>
                    
                </div>
                <EquipmentSelection
                    submitEquipment={submitEquipment}
                    mode={equipmentEditMode}
                    />
                
            </div>
                
            }
            {step === 'time' &&
                <div className="appointment-booking-grid">
                    <div className="appointment-sidebar appointment-card">
                        <button onClick={() => setStep('overview')}>Go back</button>
                        <AppointmentCardSummary
                            appointment={appointment}
                            handleClickItem={handleClickItem}
                            mode={'edit'}/>
                    </div>
                    <DateTimeSelection 
                    equipmentId={appointment.equipmentId}
                    submitDateTime={submitDateTime}
                    mode={dateTimeEditMode}
                    />
                </div>
            }
            
        </main>
    )
}