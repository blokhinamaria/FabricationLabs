import { useState, useEffect} from 'react'
import MaterialSelection from "./MaterialSelection" 

import './EquipmentSelection.css'

export default function EquipmentSelection({submitEquipment, mode}) {
    
    const [ equipment, setEquipment ] = useState([]);
    const [ selectedEquipment, setSelectedEquipment ] = useState(null);
    const [ bookedEquipment, setBookedEquipment] = useState([]);
    const [ loading, setLoading ] = useState(false);
    

    //fetch equipment
        useEffect(() => {
            async function fetchEquipment() {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/equipment`);
                    const data = await response.json()
                    if (data.success) {
                        const allEquipment = data.equipment.filter((item => item.available === true))
                        if (mode?.prevEquipmentId) {
                            const prevEquipment = allEquipment.find(item => item._id === mode.prevEquipmentId)
                            setSelectedEquipment(prevEquipment);
                            
                        }
                        if (mode?.prevDate) {
                                const bookedEquipment = await getBookedEquipment(mode.prevDate)
                                const bookedEquipmentExcludeCurrent = bookedEquipment.filter(equipmentId => equipmentId !== mode.prevEquipmentId)
                                setBookedEquipment(bookedEquipmentExcludeCurrent);
                            }
                        setEquipment(allEquipment);
                    }
                } catch (err) {
                    console.log(err)
                } finally {
                    setLoading(false)
                }
            };
            fetchEquipment();
        }, [])

    async function getBookedEquipment(date) {
        try {
            const response = await fetch(`/api/availability/date?date=${date}`);
            const data = await response.json()
            if (response.ok) {
                return data.bookedEquipmentIds;
            }
        } catch (err) {
            console.log(err)
        }
    }

    //select equipment
        const [ isEquipmentSelected, setIsEquipmentSelected ] = useState(false);
        const [ sameEquipment, setSameEquipment ] = useState(false);

        function handleEquipmentSelection(equipment) {
            setIsEquipmentSelected(true);
            setSelectedEquipment(equipment);
            if (equipment._id === mode.prevEquipmentId) {
                setSameEquipment(true);
            } else {
                setSameEquipment(false);
            }
        }
    
    // select materials and submit equipment (from Material Selection Component)
        function handleSubmitMaterials(selectedMaterials) {
            if (selectedMaterials.length > 0) {
                submitEquipment(selectedEquipment, selectedMaterials)
            } else {
                submitEquipment(selectedEquipment)
            }
        }
        
    if (loading) return <p>Loading...</p>

    const fablabEquipment = equipment.filter(equipment => equipment.location === "FabLab")
    const woodshopEquipment = equipment.filter(equipment => equipment.location === "Woodshop")

    return (
        <article>
            {mode.status === 'create' && (
                <>
                    <h1>Schedule an appointment with FabLabs Staff</h1>
                    <p style={{marginBottom: '50px'}} className="limit-width">Before scheduling an appointment, read through the University of Tampa Fabrication Lab and Woodshop policy and guidelines</p>
                </>
            )}
            { !isEquipmentSelected ?
                <section className="equipment-list">
                    {/* Step 1: Select equipment */}
                    {mode.status === 'create' ? (
                        <h2>Choose the technology or activity below to start</h2>
                    )  : (
                        <>
                            <h2>Choose a new equipment or confirm your equipment selection below</h2>
                        </>
                    )}     
                        <div className='button-group'>
                            <fieldset className='button-group'>
                                <legend>Fabrication Lab</legend>
                                    {fablabEquipment.map((item) => (
                                        <button
                                            onClick={() => handleEquipmentSelection(item)}
                                            key={item._id}
                                            className={item._id === mode.prevEquipmentId ? 'button-selected' : null}
                                            disabled={bookedEquipment.includes(item._id)}
                                            >
                                                {item.name}
                                        </button>
                                    ))}
                            </fieldset>
                            <fieldset className='button-group'>
                                <legend>Woodshop</legend>
                                    {woodshopEquipment.map((item) => (
                                        <button
                                            onClick={() => handleEquipmentSelection(item)}
                                            key={item._id}
                                            className={item._id === mode.prevEquipmentId ? 'button-selected' : null}
                                            disabled={bookedEquipment.includes(item._id)}
                                            >
                                                {item.name}
                                        </button>
                                    ))}
                            </fieldset>
                        </div>
                </section>
                :
                <section className="equipment-list">
                    {/* Step 2: Select materials and agree to terms */}
                    <div className='material-selection-button-group'>
                        <button className='back-button' onClick={() => setIsEquipmentSelected(false)}>Go Back</button>
                        <button className="equipment-button button-selected" onClick={() => setIsEquipmentSelected(false)}>{selectedEquipment.name}</button>
                    </div>
                    <MaterialSelection
                        materials={selectedEquipment.materials}
                        fileRequirements={selectedEquipment.fileRequirements}
                        handleSubmitMaterials={handleSubmitMaterials}
                        prevMaterialSelections={sameEquipment && mode?.prevMaterialSelections?.length > 0 ? mode?.prevMaterialSelections : []}
                    />
                </section>
            }
        </article>
        
    )
}