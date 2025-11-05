import { useEffect, useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom';
import { ObjectId } from "bson";
import AppointmentSummary from "./NewAppointment-components/AppointmentSummary";
import EquipmentSelection from "./NewAppointment-components/EquipmentSelection";
import DateTimeSelection from "./NewAppointment-components/DateTimeSelection";

export default function EditAppointment() {
    const location = useLocation();
    const navigate = useNavigate();
    const appointmentId = location.state;

    const [appointment, setAppointment] = useState(null); 
    const [updatedData, setUpdatedData ] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('')
    const [step, setStep] = useState('overview')

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
        prevMaterialSelections: appointment.materialSelections
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
                    updates.materialSelections = materialSelection.map(material => ({
                        id: material.id,
                        name: material.name,
                        selectedVariations: {
                            size: material.size,
                            color: material.color
                        }
                    }));
                } else {
                    updates.materialPreference = false;
                    updates.materialSelections = null;
                }
            }
            setAppointment(prev => ({ ...prev, ...updates }));
            setUpdatedData(prev => ({ ...prev, ...updates }));
            console.log('updated');
            console.log(updates)
        }
        
        setStep("overview");
}
    
    // STEP 2: date and time

    const dateTimeEditMode = {
        status: 'edit',
        prevDate: appointment.date,
        prevTime: appointment.startTime
    }

    function submitDateTime(selectedDate, selectedTime) {

        const dateChanged = selectedDate !== appointment.date
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
            setUpdatedData(prev => ({...prev, ...updates}))
            console.log('updated')
            console.log(updates)
        }

        setStep("overview");
    }

    //STEP 3: Details

    async function handleSubmit(e) {
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

            // setAppointment(prev => ({...prev, ...updates}))
            // setUpdatedData(prev => ({...prev, ...updates}))
        console.log('updated')
        console.log(differences)

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
            // const data = await response.json();
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                                
                // setStep('confirmation')
                // setAppointmentId(data.appointmentId)
                navigate('/dashboard')

            } else {
                console.error(`Server error: ${response.statusText}`)
            }
        } catch (err) {
            console.log(err)
        }
    }
    

    return (
        <main>
            {step === 'overview' && 
                <article>
                    <AppointmentSummary
                        appointment={appointment}
                        handleClickItem={handleClickItem}
                        mode={'edit'}/>

                        <div>
                            <label htmlFor='classNumber'>Class</label>
                            <input
                                type="text"
                                id="classNumber"
                                name="classNumber"
                                placeholder="ART XXX"
                                value={classNumber}
                                onChange={(e) => setClassNumber(e.target.value)}/>
                        </div>
                        <div>
                            <label htmlFor='details'>Additional details</label>
                            <textarea
                                id="details"
                                name="details"
                                placeholder="Provide details of what you need to do so we can better prepare for your visit"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}/>
                        </div>
                </article>
            }
            {(step === 'equipment' || step === 'materials') && 
                <EquipmentSelection
                    submitEquipment={submitEquipment}
                    mode={equipmentEditMode}
                    />
            }
            {step === 'time' &&
                <div className="appointment-booking-wrapper">
                    <DateTimeSelection 
                    equipmentId={appointment.equipmentId}
                    submitDateTime={submitDateTime}
                    mode={dateTimeEditMode}
                    />
                </div>
            }

            <button onClick={() => setStep('overview')}>Go back</button>  
            <button className="small" onClick={e => handleSubmit(e)}>Submit</button>
            
        </main>
    )
}