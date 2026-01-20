import { useEffect, useState } from "react"
import { useAuth } from "../../../AuthContext.jsx"
import { useNavigate } from "react-router-dom"
import { CheckCircleIcon, LocationIcon, XCircleIcon } from "../../Icons/Icons.jsx"
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
            <article>
                <section className="wide flow">
                    <h1>{userAssignedLabs} Equipment</h1>
                    <div className="card-box">
                        {equipment.map(item => (
                            <div key={item._id} className="card">
                                <h3>{item.name}</h3>
                                <div className='card-content-group'>
                                    <div className="card-icon-text">
                                        {item.available ? <CheckCircleIcon /> : <XCircleIcon />}
                                        <p>Status: {item.available ? 'Available' : 'Unavailable'}</p>
                                    </div>
                                    <div className="card-icon-text">
                                        <LocationIcon />
                                        <p>Location: {item.location}</p>
                                    </div>
                                </div>
                                <div className='card-button-group'>
                                    <button onClick={() => handleEdit(item._id)}>Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </article>
        </main>
        
    )
}