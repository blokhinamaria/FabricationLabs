import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EquipmentAvailability from './EditEquipment/EquipmentAvailability.jsx';
import EquipmentMaterials from './EditEquipment/EquipmentMaterials.jsx';
import EquipmentFileReq from './EditEquipment/EquipmentFileReq.jsx';
import { useAuth } from '../../../AuthContext.jsx';
import './Equipment.css'
import { API_URL } from '../../../config.js';


export default function EditEquipment() {
    const { user } = useAuth();
    
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
                const response = await fetch(`${API_URL}/api/equipment/${id}`, { credentials: 'include'})
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
        if (user.role === 'demo-admin') {
            setEquipment(prev => ({
                ...prev,
                ...differences
            }))
            openAndAutoClose();
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/equipment/${equipment._id}`, {
                credentials: 'include',
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
            <article className='flow'>
                <section className='flow'>
                    <button className='back-button small' onClick={handleCancel}>Go Back</button>
                    <div className='flow-sm'>
                        <h2>Edit Equipment</h2>
                        <h1>{equipment.name}</h1>
                    </div>
                </section>
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
            </article>
            <div id='success' className={!success && 'hidden'}>
                Changes Saved
            </div>
        </main>  
    )
}