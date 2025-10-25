import { useState } from "react"
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { ObjectId } from "bson";

import EquipmentSelection from "./NewAppointment-components/EquipmentSelection";
import DateTimeSelection from "./NewAppointment-components/DateTimeSelection";
import Details from "./NewAppointment-components/Details";
import Appointment from "./appointments/Appointment";

import './NewAppointment.css'

export default function NewAppointment() {

    const navigate = useNavigate()

    const { user } = useAuth()

    const [ newAppointmentData, setNewAppointmentData ] = useState(
        {
            userId: new ObjectId(user._id),
            userName: user.fullName,
            userEmail: user.email,
            equipmentId: null, // Reference only - don't duplicate entire object
            equipmentName: null,
            // Store only the specific selections made at booking time
            materialPreference: false, //boolean, false by default
            materialSelections: [],
            date: null, // Full date: 2025-10-21T09:00:00Z / date
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

    function handleNext(step) {
        setStep(step)
    }

    //STEP 1 : Equipment

    function submitEquipment(equipment, materialSelection = []) {

        if (materialSelection.length > 0) {
            setNewAppointmentData((prev) => ({
            ...prev,
            equipmentId: new ObjectId(equipment._id),
            equipmentName: equipment.name,
            materialPreference: true,
            materialSelections: materialSelection.map(material => (
                {
                    id: material.id,
                    name: material.name,
                    selectedVariations: {
                        size: material.size,
                        color: material.color
                    }
                    }
            )),
        }))
        
    } else {
            setNewAppointmentData((prev) => ({
            ...prev,
            equipmentId: new ObjectId(equipment._id)
        }))
        }
        //Move to the next step
        handleNext("date");
    }

    // STEP 2: date and time

    function submitDateTime(selectedDate, selectedTime) {
        setNewAppointmentData((prev) => ({
            ...prev,
            date: selectedDate,
            startTime: selectedTime.startTime,
            endTime: selectedTime.endTime, // "09:30" or calculate from duration / string
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
            const response = await fetch('/api/new-appointment', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(appointmentData)
            })
            const data = await response.json();
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                
                // navigate('/dashboard')
                
                setStep('confirmation')
                setAppointmentId(data.appointmentId)

            } else {
                console.error(`Server error: ${response.statusText}`)
            }
        } catch (err) {
            console.log(err)
        }
    }

    // const appointmentDetails = (
    //         <div>
    //                 <p>{newAppointmentData.equipmentName}</p>
    //                 {newAppointmentData.materialPreference ? <p>{String(newAppointmentData.materialPreference)}</p> : <p>No Material Selected</p>}
    //                 <p>{newAppointmentData.materialSelections.map((material => material.name))}</p>
    //                 <p>{newAppointmentData.date}</p>
    //                 <p>{newAppointmentData.startTime}</p>
    //                 <button onClick={handleBookAppointment}>Book</button>
    //         </div>
    //     )

    // const appointmentConfirmation = (
    //     <div>
    //         {Object.entries(newAppointmentData).map(([key, value]) => (
    //             <div><p>{key}</p>
    //             <h3>{value}</h3></div>
            
    //         ))}
    //                 {/* <p>{newAppointmentData.equipmentName}</p>
    //                 {newAppointmentData.materialPreference ? <p>{String(newAppointmentData.materialPreference)}</p> : <p>No Material Selected</p>}
    //                 <p>{newAppointmentData.materialSelections.map((material => material.name))}</p>
    //                 <p>{newAppointmentData.date}</p>
    //                 <p>{newAppointmentData.startTime}</p>
    //                 <Link to='/dashboard'><button>Back to dashboard</button></Link> */}
    //     </div>
    // )

    return (
        <main>
            {step === 'equipment' && <EquipmentSelection submitEquipment={submitEquipment}/>}
            {step === 'date' && <DateTimeSelection equipmentId={newAppointmentData.equipmentId} submitDateTime={submitDateTime}/>}
            {step === 'details' && <Details submitDetails={submitDetails}/>}
            {step === 'confirmation' &&
                <div>
                    <p>Appointment created</p>
                    <Appointment id={appointmentId} />
                    <Link to='/dashboard'><button>Back to dashboard</button></Link>
                            {/* <p>{newAppointmentData.equipmentName}</p>
                            {newAppointmentData.materialPreference ? <p>{String(newAppointmentData.materialPreference)}</p> : <p>No Material Selected</p>}
                            <p>{newAppointmentData.materialSelections.map((material => material.name))}</p>
                            <p>{newAppointmentData.date}</p>
                            <p>{newAppointmentData.startTime}</p>
                            <Link to='/dashboard'><button>Back to dashboard</button></Link> */}
                </div>
            }
        </main>
    )
}