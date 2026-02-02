import { useState, useEffect, useLayoutEffect } from 'react'
import MaterialSelection from "./MaterialSelection" 

import './EquipmentSelection.css'
import { API_URL } from '../../../../config';

export default function EquipmentSelection({submitEquipment, mode}) {

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, []);
    
    const [ equipment, setEquipment ] = useState([]);
    const [ selectedEquipment, setSelectedEquipment ] = useState(null);
    const [ bookedEquipment, setBookedEquipment] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ dataError, setDataError ] = useState('')

    //fetch equipment
        useEffect(() => {
            async function fetchEquipment() {
                try {
                    setDataError('')
                    setLoading(true);
                    const response = await fetch(`${API_URL}/api/equipment`, { credentials: 'include' });
                    const data = await response.json()
                    if(!response.ok) {
                        setDataError(data.error)
                        return
                    }
                    
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
                    return
                    
                } catch {
                    setDataError('Something went wrong when loading equipment data. Please try again later')
                } finally {
                    setLoading(false)
                }
            };
            fetchEquipment();
    }, [])

    async function getBookedEquipment(date) {
        try {
            const response = await fetch(`${API_URL}/api/availability/equipment?date=${date}`, { credentials: 'include' });
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
        if (equipment.materials.length === 0 && equipment.fileRequirements === '') {
            submitEquipment(equipment);
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
            <section>
                {mode.status === 'create' && (
                    <p style={{marginBottom: '50px'}} className="limit-width">Before booking, read through <a href='https://www.ut.edu/academics/college-of-arts-and-letters/department-of-art-and-design-degrees/rk-bailey-art-studios-featuring-the-fab-lab' target="_blank" rel="noopener noreferrer">the University of Tampa Fabrication Lab and Woodshop Policy and Guidelines</a></p>
                )}
            { !isEquipmentSelected ?
                <div className='flow'>
                    {/* Step 1: Select equipment */}
                    {mode.status === 'create' ? (
                        <h3>Choose the technology or activity below to start</h3>
                    )  : (
                        <h3 className='limit-width'>Choose a new equipment or confirm your equipment selection below</h3>
                    )}     
                    {   
                        dataError ? 
                            <p className='limit-width'>{dataError}</p>
                        :
                        <>
                            <fieldset>
                                <legend>Fabrication Lab</legend>
                                <div className='flow'>
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
                                </div>
                                    
                            </fieldset>
                            <fieldset >
                                <legend>Woodshop</legend>
                                <div className='flow'>
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
                                </div>
                                    
                            </fieldset>
                        </>
                    }
                </div>
                :
                <div className='flow-lg'>
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
                </div>
            }
        </section>
        
    )
}
