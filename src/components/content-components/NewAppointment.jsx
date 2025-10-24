import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { ObjectId } from "bson";

import EquipmentSelection from "./NewAppointment-components/EquipmentSelection";
import DateTimeSelection from "./NewAppointment-components/DateTimeSelection";

import './NewAppointment.css'

export default function NewAppointment() {

    const navigate = useNavigate()

    const { user } = useAuth()

    const [ newAppointmentData, setNewAppointmentData ] = useState(
        {
            userId: new ObjectId(user._id),
            equipmentId: null, // Reference only - don't duplicate entire object
            equipmentName: null,
            // Store only the specific selections made at booking time
            materialPreference: false, //boolean, false by default
            materialSelections: [],
            date: null, // Full date: 2025-10-21T09:00:00Z / date
            startTime: null, // "09:00" / string
            endTime: null, // "09:30" or calculate from duration / string
            duration: null, // Number minutes
            
            status: 'scheduled', // 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'no-show'
            
            // Notes and tracking
            notes: '', // User notes about the project
            adminNotes: '', // Staff notes (visible only to admins)
            
            // Timestamps
            createdAt: null, 
            updatedAt: null,
            cancelledAt: null
        }
    )

    const [ isEquipmentSubmitted, setIsEquipmentSubmitted] = useState(false);

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
                    name: material.name, // Store name for historical record
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
        setIsEquipmentSubmitted(true);
    }

    const [isEquipmentConfirmed, setIsEquipmentConfirmed] = useState(false)

    const [appointmentConfirmation, setAppointmentConfirmation] = useState(false)

    function submitDateTime(selectedDate, selectedTime) {
        setNewAppointmentData((prev) => ({
            ...prev,
            date: selectedDate,
            startTime: selectedTime
        }))
        setAppointmentConfirmation(true)

    }


    async function handleSubmit() {
        try {
            const response = await fetch ('/api/new-appointment', {
                method: "POST",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newAppointmentData)
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

    return (
        <main>
            {!isEquipmentConfirmed ? (
                
                    !isEquipmentSubmitted ? (
                        <EquipmentSelection submitEquipment={submitEquipment}/>
                    ) : (
                        <article>
                            <p>{newAppointmentData.equipmentName}</p>
                            {newAppointmentData.materialPreference ? <p>{String(newAppointmentData.materialPreference)}</p> : <p>No Material Selected</p>}
                            <p>{newAppointmentData.materialSelections.map((material => material.name))}</p>
                            <button onClick={() => setIsEquipmentConfirmed(true)}>Confirm & Continue</button>
                        </article>
                    )
                
            ) : (
                <DateTimeSelection equipmentId={newAppointmentData.equipmentId} submitDateTime={submitDateTime}/>
            )}
            { appointmentConfirmation && (
                <div>
                    <p>{newAppointmentData.equipmentName}</p>
                    {newAppointmentData.materialPreference ? <p>{String(newAppointmentData.materialPreference)}</p> : <p>No Material Selected</p>}
                    <p>{newAppointmentData.materialSelections.map((material => material.name))}</p>
                    <p>{newAppointmentData.date}</p>
                    <p>{newAppointmentData.startTime}</p>
                    <button onClick={handleSubmit}>Book</button>
                </div>
            )
            }
            
        
        </main>
    )
}