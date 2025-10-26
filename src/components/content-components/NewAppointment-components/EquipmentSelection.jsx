import { useState, useEffect} from 'react'
import MaterialSelection from "./MaterialSelection" 

import './EquipmentSelection.css'

export default function EquipmentSelection({submitEquipment}) {
    
    const [ equipment, setEquipment ] = useState([]);

    const [ selectedEquipment, setSelectedEquipment ] = useState(null)

    //fetch equipment
        useEffect(() => {
            async function fetchEquipment() {
                const response = await fetch(`/api/equipment`);
                const data = await response.json()
                if (data.success) {
                    const availableEquipment = data.equipment.filter((item => item.available === true))
                    setEquipment(availableEquipment);
                }
                
            };
            fetchEquipment();
        }, [])

    //select equipment
        const [ isEquipmentSelected, setIsEquipmentSelected ] = useState(false);

        function handleEquipmentSelection(equipment) {
            setIsEquipmentSelected(true);
            setSelectedEquipment(equipment);
        }
    
    // select materials and submit equipment (from Material Selection Component)
        function handleSubmitMaterials(selectedMaterials) {
            if (selectedMaterials.length > 0) {
                submitEquipment(selectedEquipment, selectedMaterials)
            } else {
                submitEquipment(selectedEquipment)
            }
        }

    return (
        <article>
            <h1>Schedule an appointment with FabLabs Staff</h1>
            <p className="limit-width">Before scheduling an appointment, read through the University of Tampa Fabrication Lab and Woodshop policy and guidelines</p>
            
            { !isEquipmentSelected ?
                <section className="equipment-list">
                    {/* Step 1: Select equipment */}
                    <h2>Choose the technology or activity below to start</h2>
                        {equipment.map((item) => (
                            <button onClick={() => handleEquipmentSelection(item)} key={item._id}>{item.name}</button>
                        ))}
                </section>
                :
                <section className="equipment-list">
                    {/* Step 2: Select materials and agree to terms */}
                    <div className='equipment-selection-button-group'>
                        <button className='back-button' onClick={() => setIsEquipmentSelected(false)}>Go Back</button>
                        <button className="equipment-button button-selected" onClick={() => setIsEquipmentSelected(false)}>{selectedEquipment.name}</button>
                    </div>
                    <MaterialSelection materials={selectedEquipment.materials} fileRequirements={selectedEquipment.fileRequirements} handleSubmitMaterials={handleSubmitMaterials}/>
                </section>
            }
        </article>
        
    )
}