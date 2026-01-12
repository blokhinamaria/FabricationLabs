import { useState } from "react"
import { Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { ObjectId } from "bson";

import EquipmentSelection from "./Appointment-components/EquipmentSelection.jsx";
import AppointmentCardSummary from "./Appointment-cards/AppointmentCardSummary.jsx";
import DateTimeSelection from "./Appointment-components/DateTimeSelection.jsx";
import Details from "./Appointment-components/Details.jsx";
import AppointmentCard from "./Appointment-cards/AppointmentCard.jsx";

import './NewAppointment.css'

export default function NewAppointment() {

    const { user } = useAuth()

    const [ newAppointmentData, setNewAppointmentData ] = useState(
        {
            type: 'individual-appointment',
            userId: new ObjectId(user._id),
            userName: user.fullName,
            userEmail: user.email,
            equipmentId: null, // Reference only - don't duplicate entire object
            equipmentName: null,
            location: null,
            
            // Store only the specific selections made at booking time
            materialPreference: false, //boolean, false by default
            materialSelections: [],
            date: null, // .toDateString() Thu Nov 20 2025
            startTime: null, // "09:00" / string
            endTime: null, // "09:30" or calculate from duration / string
            duration: 30, // Number minutes
            
            status: 'scheduled', // 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no-show'
            
            // Notes and tracking
            classNumber: '',
            notes: '', // User notes about the project
            adminNotes: '', // Staff notes (visible only to admins)
            
            // Timestamps
            createdAt: null, 
            updatedAt: null,
            cancelledAt: null
        }
    )

    //Navigation between steps

    const [ step, setStep ] = useState('equipment')

    const [appointmentCreateMode, setAppointmentCreateMode] = useState({
        status: 'create',
    }) 


    function handleNext(step) {
        setStep(step)
    }

    function handleClickItem(step) {
        setStep(step)
        if (step === 'equipment' || step === 'materials') {
            setAppointmentCreateMode({
            status: 'create',
            prevEquipmentId: newAppointmentData.equipmentId.toString(),
            prevMaterialSelections: newAppointmentData.materialSelections,
        })
        } else if (step === 'time') {
            setAppointmentCreateMode({
            status: 'edit',
            prevDate: newAppointmentData.date,
            prevTime: newAppointmentData.startTime,
        })
            setNewAppointmentData((prev) => ({
                ...prev,
                date: null,
                startTime: null, 
                endTime: null, 
            }))
        }
        
    }

    //STEP 1 : Equipment

    function submitEquipment(equipment, materialSelection = []) {

        if (materialSelection.length > 0) {
            setNewAppointmentData((prev) => ({
            ...prev,
            equipmentId: new ObjectId(equipment._id),
            equipmentName: equipment.name,
            location: equipment.location,
            materialPreference: true,
            materialSelections: materialSelection,
            date: null,
            startTime: null, 
            endTime: null, 
        }))
        
    } else {
            setNewAppointmentData((prev) => ({
            ...prev,
            equipmentId: new ObjectId(equipment._id),
            equipmentName: equipment.name,
            location: equipment.location,
            materialPreference: false,
            materialSelections: null,
            date: null,
            startTime: null, 
            endTime: null, 
        }))
        }
        //Move to the next step
        handleNext("time");
    }

    // STEP 2: date and time

    function submitDateTime(selectedDate, selectedTime) {
        console.log(selectedDate)
        setNewAppointmentData((prev) => ({
            ...prev,
            date: selectedDate,
            startTime: selectedTime.startTime,
            endTime: selectedTime.endTime, // or calculate from duration / string
        }))
        handleNext("details");
    }

    //STEP 3: Details

    async function submitDetails (fullName = user.fullName, classNumber, details ) {
        const updatedData = {
            ...newAppointmentData,
            userName: fullName,
            classNumber: classNumber,
            notes: details
        }
        setNewAppointmentData(updatedData)
        await bookAppointment(updatedData)
    }

    //STEP 4: Submit apppointment data and show confirmation

    const [ appointmentId, setAppointmentId] = useState(null)

    async function bookAppointment(appointmentData = newAppointmentData) {
    
        try {
            const response = await fetch('/api/appointments', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(appointmentData)
            })
            const data = await response.json();
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                                
                setStep('confirmation')
                setAppointmentId(data.appointmentId)

            } else {
                console.error(`Server error: ${response.statusText}`)
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <main>
            <h1>New Appointment</h1>
            {(step === 'equipment' || step === 'materials')  && 
                <EquipmentSelection
                    submitEquipment={submitEquipment}
                    mode={appointmentCreateMode}
                />}
            {step === 'time' && 
                (   
                    <div className="appointment-booking-grid">  
                        <div className="appointment-sidebar">
                            <AppointmentCardSummary appointment={newAppointmentData} mode={'create'} handleClickItem={handleClickItem}/>
                        </div>
                        <DateTimeSelection
                            equipmentId={newAppointmentData.equipmentId}
                            lab={newAppointmentData.location}
                            submitDateTime={submitDateTime}
                            mode={appointmentCreateMode}
                            />
                    </div>
                    
                )}
                
            {step === 'details' && 
                (   
                    <div className="appointment-booking-grid">  
                        <div className="appointment-sidebar">
                            <AppointmentCardSummary appointment={newAppointmentData} mode={'create'} handleClickItem={handleClickItem}/>
                        </div>
                        <Details submitDetails={submitDetails}/>
                    </div>
                )
            }
            {step === 'confirmation' &&
                <section>
                    <h2>Appointment created</h2>
                    <AppointmentCard id={appointmentId} />
                    <Link to='/dashboard'><button style={{ marginTop: '50px'}}>Back to dashboard</button></Link>
                </section>
            }
        </main>
    )
}