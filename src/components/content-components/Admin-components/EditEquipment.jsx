import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EquipmentAvailability from './equipment-components/EquipmentAvailability.jsx';
import EquipmentMaterials from './equipment-components/EquipmentMaterials.jsx';

export default function EditEquipment() {
    const location = useLocation()
    const equipment = location.state;

    function handleCancel() {
        navigate('/admin-dashboard')
    }

    return (
        <main> 
            <h2>Edit Equipment</h2>
            
            <article className="edit-appointment appointment-card">
                <h2>{equipment.name}</h2>
                <EquipmentAvailability
                    passedEquipment={equipment}
                    />
                {/* <EquipmentMaterials/> */}
                
            </article>
        </main>  
    )
}