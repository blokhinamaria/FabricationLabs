import { useEffect, useState } from "react"
import { useAuth } from "../../../AuthContext"
import { useNavigate } from "react-router-dom"

export default function Equipment() {

    const { user } = useAuth()
    const userAssignedLabs = user.assignedLabs.join('&')

    const [ equipment, setEquipment ] = useState([]) 
    
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchEquipment() {
            try {
                const response = await fetch(`/api/equipment?role=${user.role}&labs=${user.assignedLabs.join(',')}`)
                const data = await response.json()
                if (response.ok) {
                    setEquipment(data.equipment)
                }
            } catch (err) {
                console.log(`Failed to fetch equipment: ${err}`)
            }
        }

        fetchEquipment()
        
    })

    function handleEdit(item) {
        navigate('/admin-dashboard/equipment/edit', {state: item})
    }

    return (
        <main>
            <h1>{userAssignedLabs} Equipment</h1>
            <article>   
                {equipment.map(item => (
                    <div key={item._id}>
                        <h2>{item.name}</h2>
                        <p>{item.available ? 'Available' : 'Unavailable'}</p>
                        <button onClick={() => handleEdit(item)}>Edit</button>
                    </div>
                ))}
            </article>
        </main>
        
    )
}