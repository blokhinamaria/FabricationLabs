import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EquipmentAvailability from './equipment-components/EquipmentAvailability.jsx';
import EquipmentMaterials from './equipment-components/EquipmentMaterials.jsx';
import EquipmentFileReq from './equipment-components/EquipmentFileReq.jsx';
import { useAuth } from '../../../AuthContext.jsx';
import './Equipment.css'


export default function EditEquipment() {
    const { userRole } = useAuth();
    
    const navigate = useNavigate()
    const location = useLocation()
    const equipmentId = location.state

    const [ equipment, setEquipment] = useState({})

    const [ loading, setLoading ] = useState(false);
    const [ success, setSuccess ] = useState(false);
    const timeoutRef = useRef(null);
    
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
            openAndAutoClose();
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
                openAndAutoClose();
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

    const openModal = () => {
        setSuccess(true)
    }

    const closeModal = () => {
        setSuccess(false)
    }

    const openAndAutoClose = () => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        openModal();
        
        // Store the timeout ID
        timeoutRef.current = setTimeout(() => {
            closeModal();
            timeoutRef.current = null;
        }, 3000);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            };
    }, []);

    if (loading) return (<main><p>Loading...</p></main>)

    return (
        <main> 
            
            <article className="edit-appointment">
                <div className='edit-equipment-header'>
                    <button className='back-button small' onClick={handleCancel}>Go Back</button>
                    <h2>Edit Equipment</h2>
                </div>
                <section className='appointment-overview edit-equipment-wrapper'>
                    <h1>{equipment.name}</h1>
                    <EquipmentAvailability
                        equipment={equipment}
                        onUpdate={updateEquipment}
                    />
                    <hr></hr>
                    <EquipmentMaterials
                        equipment={equipment}
                        onUpdate={updateEquipment}
                    />
                    <hr></hr>
                    <EquipmentFileReq
                        file={equipment.fileRequirements}
                        onUpdate={updateEquipment}
                    />
                </section>
            </article>
            <div id='success' className={!success && 'hidden'}>
                Changes Saved
            </div>
        </main>  
    )
}