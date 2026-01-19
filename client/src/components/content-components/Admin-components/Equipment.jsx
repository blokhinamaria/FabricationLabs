import { useEffect, useState } from "react"
import { useAuth } from "../../../AuthContext"
import { useNavigate } from "react-router-dom"
import { CheckCircleIcon, LocationIcon, XCircleIcon } from "../../Icons.jsx"
import { API_URL } from "../../../config.js"

export default function Equipment() {

    const { user } = useAuth()
    const userAssignedLabs = user.assignedLabs.join('&')

    const [ equipment, setEquipment ] = useState([]) 
    
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchAllEquipment() {
            try {
                const response = await fetch(`${API_URL}/api/admin/equipment`, { credentials: 'include' })
                const data = await response.json()
                if (response.ok) {
                    setEquipment(data.equipment)
                }
            } catch (err) {
                console.log(`Failed to fetch equipment: ${err}`)
            }
        }

        fetchAllEquipment()
        
    }, [user])

    function handleEdit(id) {
        navigate('/admin-dashboard/equipment/edit', {state: id})
    }

    return (
        <main>
            <h1>{userAssignedLabs} Equipment</h1>
            <article className="upcoming-appointments">
                <div className="appointment-list">
                    {equipment.map(item => (
                        <section key={item._id} className="appointment-overview">
                            <h3>{item.name}</h3>
                            <div className='appointment-overview-group'>
                                <div className="appointment-icon-text">
                                    {item.available ? <CheckCircleIcon /> : <XCircleIcon />}
                                    <p>Status: {item.available ? 'Available' : 'Unavailable'}</p>
                                </div>
                                <div className="appointment-icon-text">
                                    <LocationIcon />
                                    <p>Location: {item.location}</p>
                                </div>
                            </div>
                            <div className='appointment-button-group'>
                                <button onClick={() => handleEdit(item._id)}>Edit</button>
                            </div>
                        </section>
                    ))}
                </div>
                
            </article>
        </main>
        
    )
}