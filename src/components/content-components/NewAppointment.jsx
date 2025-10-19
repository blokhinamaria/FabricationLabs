import { useEffect, useState } from "react"
import EquipmentSelection from "./NewAppointment-components/EquipmentSelection";
import './NewAppointment.css'

export default function NewAppointment() {

    const user = JSON.parse(localStorage.getItem('user'));

    const [ newAppointmentData, setNewAppointmentData ] = useState(
        {
            bookingId: "generate in database?",
            userId: user.userId,
            equipment: {},
            materialPreference: false,
            materialSelection: [],
            date: "",
            timestamp: "",
            status: ""
        }
    )

    const [ isEquipmentSubmitted, setIsEquipmentSubmitted] = useState(false);

    function submitEquipment(equipment, materialSelection = []) {

        if (materialSelection. length > 0) {
            setNewAppointmentData((prev) => ({
            ...prev,
            equipment: equipment,
            materialPreference: true,
            materialSelection: materialSelection,
        }))
        } else {
            setNewAppointmentData((prev) => ({
            ...prev,
            equipment: equipment,
        }))
        }
        setIsEquipmentSubmitted(true);
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
            } else {
                console.error(`Server error: ${response.statusText}`)
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <main>
            {
                !isEquipmentSubmitted ? (
                    <EquipmentSelection submitEquipment={submitEquipment}/>
                ) : (
                    <article>
                        <p>{newAppointmentData.userId}</p>
                        <p>{newAppointmentData.equipment.name}</p>
                        <p>{String(newAppointmentData.materialPreference)}</p>
                        <p>{newAppointmentData.materialSelection.map((material => material.materialName))}</p>
                        <button onClick={handleSubmit}>Submit</button>
                    </article>
                )
            }
        
        </main>
    )
}