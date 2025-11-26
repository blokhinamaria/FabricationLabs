import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EquipmentAvailability from './equipment-components/EquipmentAvailability.jsx';
import EquipmentMaterials from './equipment-components/EquipmentMaterials.jsx';
import EquipmentFileReq from './equipment-components/EquipmentFileReq.jsx';
import { useAuth } from '../../../AuthContext.jsx';

export default function EditEquipment() {
    const { userRole } = useAuth();
    
    const navigate = useNavigate()
    const location = useLocation()
    const equipmentId = location.state

    const [ equipment, setEquipment] = useState({})

    const [ loading, setLoading ] = useState(false);
    
    useEffect(() => {
        setLoading(true)
        fetchEquipment(equipmentId)
    }, [equipmentId])

    async function fetchEquipment(id) {
            try {
                const response = await fetch(`/api/equipment?id=${id}`)
                const data = await response.json()
                if (response.ok) {
                    setEquipment(data.equipment)
                    setLoading(false)
                }
            } catch (err) {
                console.log(`Failed to fetch equipment: ${err}`)
            }
        }

    async function updateEquipment(differences) {
        if (userRole === 'demo-admin') {
            setEquipment(prev => ({
                ...prev,
                ...differences
            }))
            return;
        }
        try {
            const response = await fetch(`/api/equipment?id=${equipment._id}`, {
                method: "PUT",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(differences)
            })
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                await fetchEquipment(equipment._id);
            } else {
                console.error(`Server error: ${response.statusText}`)
            }
        } catch (err) {
            console.log(err)
        }
    }

    function handleCancel() {
        navigate('/admin-dashboard/equipment')
    }

    if (loading) return (<main><p>Loading...</p></main>)

    return (
        <main> 
            <h2>Edit Equipment</h2>
            <button onClick={handleCancel}>Go Back</button>
            <article className="edit-appointment appointment-card">
                <h2>{equipment.name}</h2>
                <EquipmentAvailability
                    equipment={equipment}
                    onUpdate={updateEquipment}
                    />

                <EquipmentMaterials
                    equipment={equipment}
                    onUpdate={updateEquipment}
                />

                <EquipmentFileReq
                    file={equipment.fileRequirements}
                    onUpdate={updateEquipment}
                />
            </article>
        </main>  
    )
}