import { useState, useEffect} from 'react'
import MaterialSelection from "./MaterialSelection" 

export default function EquipmentSelection({submitEquipment}) {
    
    const [ equipment, setEquipment ] = useState([]);
    const [ isEquipmentSelected, setIsEquipmentSelected ] = useState(false);
    const [ selectedEquipment, setSelectedEquipment ] = useState(null)

    useEffect(() => {
        async function fetchEquipment() {
            const response = await fetch(`/data/equipment.json`);
            const data = await response.json()
            setEquipment(data);
        };
        fetchEquipment();
    }, [])


    function handleEquipmentSelection(equipment) {
        setIsEquipmentSelected(true);
        setSelectedEquipment(equipment);
    }

    function handleSubmitMaterials(selectedMaterials) {
        if (selectedMaterials.length > 0) {
            submitEquipment(selectedEquipment, selectedMaterials)
        } else {
            submitEquipment(selectedEquipment)
        }
    }

    return (
        <article>
            <h1>Schedule an appointment with FabLab Staff</h1>
            <p className="limit-width">Before scheduling an appointment, read through the University of Tampa Fabrication Lab and Woodshop policy and guidelines</p>
            {
                !isEquipmentSelected ? (
                        <section className="equipment-list">
                            <h2>Choose the technology below to start</h2>
                                {equipment.map((item) => (
                                    <button onClick={() => handleEquipmentSelection(item)} key={item.id}>{item.name}</button>
                                ))}
                        </section>
                    ) : (
                        <>  
                            <section className="equipment-list">
                                <button onClick={() => setIsEquipmentSelected(false)}>Go Back</button>
                                <button className="button-selected" onClick={() => setIsEquipmentSelected(false)}>{selectedEquipment.name}</button>
                            </section>
                                <MaterialSelection materials={selectedEquipment.materials} fileRequirements={selectedEquipment.fileRequirements} handleSubmitMaterials={handleSubmitMaterials}/>
                            </>
                        )
            }
        </article>
        
    )
}