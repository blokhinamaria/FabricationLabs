import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';


export default function EquipmentAvailability({passedEquipment}) {
    const [ equipment, setEquipment] = useState(passedEquipment)
    console.log(equipment)
    const [ available, setAvailable ] = useState(equipment.available)
    
    const [ unavailableDates, setUnavailableDates ] = useState(equipment.availabilityExceptions || []);
    const [ unavailableDateType, setUnavailableDateType ] = useState('single')

    const [ formError, setFromError ] = useState('');
    
    const today = new Date();
    const [ newUnavailableDate, setNewUnavailableDate ] = useState(`${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`)
    const [ newUnavailableStartDate, setNewUnavailableStartDate ] = useState(`${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`)
    const [ newUnavailableEndDate, setNewUnavailableEndDate ] = useState('')
    
    const navigate = useNavigate();

    function handleAddDate() {
        setFromError('')
        if (unavailableDateType === 'single') {
            if (!newUnavailableDate) {
                setFromError('Must provide the date')
                return
            }
            const alreadySet = unavailableDates.some(date => 
                date.date === newUnavailableDate
                ||
                date.date === newUnavailableDate
                ||
                date.date === newUnavailableDate
            )
            if (alreadySet) {
                setFromError('The provided date is already set as unavailable')
                return
            }

            setUnavailableDates(prev => [...prev, {date: newUnavailableDate}])
            setNewUnavailableDate('')
            
        } else if (unavailableDateType === 'range') {
            if (!newUnavailableStartDate || !newUnavailableEndDate) {
                setFromError('Must provide both dates')
                return
            }

            const alreadySet = unavailableDates.some(date => 
                date.startDate === newUnavailableStartDate && date.endDate === newUnavailableEndDate
                ||
                date.date === newUnavailableStartDate
                ||
                date.date === newUnavailableEndDate
            )
            
            if (alreadySet) {
                setFromError('The provided dates are already set as unavailable')
                return
            }

            const order = new Date(newUnavailableStartDate).getTime() < new Date(newUnavailableEndDate).getTime()
            if (!order) {
                setFromError('End date must be passed the start date')
                return
            }

            setUnavailableDates(prev => [...prev, {startDate: newUnavailableStartDate, endDate: newUnavailableEndDate}])
            setNewUnavailableStartDate('')
            setNewUnavailableEndDate('')
        }
    }

    function handleDelete(dateToDelete) {
        if (dateToDelete.startDate) {
            setUnavailableDates((prev) => prev.filter(date => date.startDate !== dateToDelete.startDate))
        } else {
            setUnavailableDates((prev) => prev.filter(date => date.date !== dateToDelete.date))
        }
    }

    async function handleSubmitAvailability(e) {
        e.preventDefault();

        const equipmentUpdates = {}

        const availabilityChanged = available !== equipment.available;
        if (!availabilityChanged) {
            return
        }

        equipmentUpdates.available = available;
        console.log(equipmentUpdates);
        if(equipmentUpdates) {
            await updateEquipment(equipmentUpdates)
        }
        return;
    }

    async function handleSubmitDates(e) {
        e.preventDefault();
        setFromError('')

        const equipmentUpdates = {}
        
        if (unavailableDates.length !==  equipment.availabilityExceptions.length) {
            equipmentUpdates.availabilityExceptions = unavailableDates;
            if (equipmentUpdates) {
                await updateEquipment(equipmentUpdates);
                return;
            }
        
        }
            
        const currentDates = unavailableDates.map(date => date.date ? date.date : `${date.startDate}-${date.endDate}`).sort().join(',');
        const previousDates = equipment.availabilityExceptions.map(date => date.date ? date.date : `${date.startDate}-${date.endDate}`).sort().join(',');
        const datesChanged = currentDates !== previousDates;
            console.log(currentDates)
            console.log(previousDates)
            console.log(datesChanged)
        if (datesChanged) {
            equipmentUpdates.availabilityExceptions = unavailableDates;
            if (equipmentUpdates) {
                await updateEquipment(equipmentUpdates);
                return;
            }
        }

        setFromError('Unavailable Dates were not changed')

    }

    async function updateEquipment(differences) {
        try {
            const response = await fetch(`/api/equipment?id=${equipment._id}`, {
                method: "PUT",
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(differences)
            })
            if (response.ok) {
                console.log(`success. Response: ${response}`)
                // navigate('/admin-dashboard/equipment')
                await fetchEquipment(equipment._id);
            } else {
                console.error(`Server error: ${response.statusText}`)
            }
        } catch (err) {
            console.log(err)
        }
    }

    async function fetchEquipment(id) {
            try {
                const response = await fetch(`/api/equipment?id=${id}`)
                const data = await response.json()
                if (response.ok) {
                    setEquipment(data.equipment)
                }
            } catch (err) {
                console.log(`Failed to fetch equipment: ${err}`)
            }
        }        

    return (
        <section>
            <form onSubmit={handleSubmitAvailability}>
                <p>Availability</p>
                        <div className='input-group-wrapper'>
                            <input
                                type='radio'
                                id='available'
                                name='availability'
                                value='available'
                                checked={available}
                                onChange={() => setAvailable(true)}/>
                            <label htmlFor='available'>Available</label>
                        </div>
                        <div className='input-group-wrapper'>
                            <input
                                type='radio'
                                id='unavailable'
                                name='availability'
                                value='unavailable'
                                checked={!available}
                                onChange={() => setAvailable(false)}/>
                            <label htmlFor='unavailable'>Permanently Unavailable</label>
                        </div>
                    <button type="submit" disabled={available === equipment.available}>Save</button>
            </form>
            <hr></hr>
            <form onSubmit={handleSubmitDates}>  
                <h2>Unavailable Dates</h2>
                        {unavailableDates && (
                            unavailableDates.map(date => (
                                <div key={date.date || date.startDate}>
                                    <p>{date.date || date.startDate}</p>
                                    <p>{date.endDate}</p>
                                    <span onClick={() => handleDelete(date)}>Delete</span>
                                </div>
                            ))
                            )
                        }
                        
                        <p>+ Add unavailable dates</p>
                            <div className="type-selector">
                                <input
                                    type="radio"
                                    id="single"
                                    value="single"
                                    checked={unavailableDateType === 'single'}
                                    onChange={(e) => setUnavailableDateType(e.target.value)}
                                />
                                <label htmlFor="single">
                                Single Day
                                </label>
                                
                                <input
                                    type="radio"
                                    value="range"
                                    id="range"
                                    checked={unavailableDateType === 'range'}
                                    onChange={(e) => setUnavailableDateType(e.target.value)}
                                />
                                <label htmlFor="range">
                                    Date Range
                                </label>
                            </div>
                            {
                                unavailableDateType === 'single' ? (
                                    <div>
                                        <label htmlFor="startDate">Choose Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            value={newUnavailableDate}
                                            onChange={e => setNewUnavailableDate(e.target.value)}
                                            required />
                                    </div>
                                ) : (
                                    <>
                                        <div className='input-group-wrapper column'>
                                            <label htmlFor='start-date'>Start Date</label>
                                            <input
                                                type='date'
                                                id='start-date'
                                                name='date'
                                                min={today}
                                                value={newUnavailableStartDate}
                                                onChange={e => setNewUnavailableStartDate(e.target.value)}/>
                                            
                                        </div>
                                        <div className='input-group-wrapper column'>
                                            <label htmlFor='start-date'>End Date</label>
                                            <input
                                                type='date'
                                                id='end-date'
                                                name='date'
                                                min={newUnavailableStartDate}
                                                value={newUnavailableEndDate}
                                                onChange={e => setNewUnavailableEndDate(e.target.value)}/>
                                        </div>
                                    </>
                                )
                            }
                            <button type="button" className="small" onClick={handleAddDate}>+ Add Date</button>
                        {formError ? <p className='error-message'>{formError}</p> : null}
                    <button type="submit">Save</button>
                </form>
        </section>
        
    )
}