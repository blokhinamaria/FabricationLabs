import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../AuthContext";

export default function BlockoutDates() {

    const { user, userRole } = useAuth()

    const [ blockoutDates, setBlockoutDates ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ blackoutType, setBlackoutType] = useState('single');
    const [ assignedLabs, setAssignedLabs ] = useState(user.assignedLabs)
    const [ formData, setFormData ] = useState({
        name: '',
        date: '',
        startDate: '',
        endDate: '',
        type: blackoutType,
        lab: assignedLabs
    })
    const [formError, setFormError] = useState('')

    function resetForm() {
            setFormData({
                name: '',
                date: '',
                startDate: '',
                endDate: '',
                type: blackoutType,
                lab: assignedLabs
        })
        setBlackoutType('single');
    }

    useEffect(() => {
        fetchBlockoutDates();
    },[])
    
    async function fetchBlockoutDates() {
            const response = await fetch('/api/blockoutdates')
            const data = await response.json()

            if (data.blockouts) {
                setBlockoutDates(data.blockouts)
            }
            setLoading(false)
        }
    
    //dialog
    const dialogRef = useRef();

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const openModal = () => {
        dialogRef.current.showModal()
        setIsDialogOpen(true)
    }

    const closeModal = () => {
        dialogRef.current.close()
        setIsDialogOpen(false)
        resetForm();
    }

    //close dialog when clicking outside
    const handleDialogClick = (e) => {
        if (e.target === dialogRef.current) {
            closeModal();
        }
    }

    const [ createNew, setCreateNew ] = useState(false);
    const [ editId, setEditId ] = useState('');

    function handleCreateNew() {
        setCreateNew(true)
        openModal()
    }

    function handleEdit(blockoutDate) {
        setCreateNew(false);
        setEditId(blockoutDate._id)
        setFormData({
            name: blockoutDate.name,
            date: blockoutDate.date || '',
            startDate: blockoutDate.startDate || '',
            endDate: blockoutDate.endDate || '',
            type: blockoutDate.type,
            lab: blockoutDate.lab
            })
        setBlackoutType(blockoutDate.type)
        openModal()
    }

    function handleLabChange(target) {
        console.log(target.value)
        if (target.checked) {
            setAssignedLabs((prev) => [...prev, target.value])
        } else {
            setAssignedLabs(prev => prev.filter(lab => lab !== target.value))
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        // if (!formData.name || (!formData.date || !formData.startDate || !formData.endDate)) {
        //     setFormError('All fields are required')
        //     return 
        // }

        const data = {
            name: formData.name,
            date: formData.date || '',
            startDate: formData.startDate || '',
            endDate: formData.endDate || '',
            type: blackoutType,
            lab: assignedLabs
        };

        if (userRole === 'demo-admin') {
            if (editId) {
                setBlockoutDates(prev => prev.map(blockoutdate => {
                    if (blockoutdate._id === editId) {
                        return data
                    } else {
                        return blockoutdate;
                    }
                }))
                closeModal()
            } else {
                setBlockoutDates(prev => ([
                ...prev,
                data
                ]))
                closeModal()
                return;
            }
        }
        if (userRole === 'admin') {
                    try {
                    if (editId) {
                        const response = await fetch(`/api/blockoutdates?id=${editId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        })
                        if (response.ok) {
                            closeModal();
                            fetchBlockoutDates();
                        }
                    } else {
                            const response = await fetch(`/api/blockoutdates`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        })
                        if (response.ok) {
                            closeModal();
                            fetchBlockoutDates();
                        }
                    }
                    
                } catch (err) {
                    setFormError('Failed to save the semester')
                    console.error(err)
                }
            }
        }
        

    function convertDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    if (loading) return (<p>loading...</p>)

    return (
        <article>
            <h1>Blockout Dates</h1>
            <h2>For {user.assignedLabs.join('&')}</h2>
            {blockoutDates.length === 0 ? (<p>No blockout dates found</p>
                ) : (
                    blockoutDates.map(date => (
                        <div key={date._id}>
                            <h3>{date.name}</h3>
                            <p>From {convertDate(date.startDate).toDateString()}</p>
                            <p>Till {convertDate(date.endDate).toDateString()}</p>
                            <button className="small" onClick={() => handleEdit(date)}>Edit</button>
                        </div>
                        
                    )))}
            <button onClick={handleCreateNew}
                    aria-expanded={isDialogOpen}
                    aria-controls="delete-dialog"
                    aria-haspopup="dialog"
            >
                + Add Blockout Dates</button>
            <dialog id='add-new-blockout' ref={dialogRef} onClick={handleDialogClick}>
                <button onClick={closeModal}
                >Close</button>
                    <h4>{createNew ? 'Add New Blockout Date' : 'Edit Blockout Date'}</h4>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="blockoutDateName">Name</label>
                                <input
                                    type="text"
                                    id="blockoutDatename"
                                    name="blockoutDateName"
                                    placeholder="Spring Break"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required />
                            </div>
                            <div className="type-selector">
                                <input
                                    type="radio"
                                    id="single"
                                    value="single"
                                    checked={blackoutType === 'single'}
                                    onChange={(e) => setBlackoutType(e.target.value)}
                                />
                                <label htmlFor="single">
                                Single Day
                                </label>
                                
                                <input
                                    type="radio"
                                    value="range"
                                    id="range"
                                    checked={blackoutType === 'range'}
                                    onChange={(e) => setBlackoutType(e.target.value)}
                                />
                                <label htmlFor="range">
                                    Date Range
                                </label>
                            </div>
                            {
                                blackoutType === 'single' ? (
                                    <div>
                                        <label htmlFor="startDate">Choose Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={e => setFormData({...formData, date: e.target.value})}
                                            required />
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label htmlFor="startDate">Choose Staring Date</label>
                                            <input
                                                type="date"
                                                id="startDate"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                                required />
                                        </div>
                                        <div>
                                            <label htmlFor="endDate">Choose Ending Date</label>
                                            <input
                                                type="date"
                                                id="endDate"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                                required />
                                        </div>
                                    </>
                                )
                            }
                            {user.assignedLabs.length > 1 && (
                                <div className="lab-selector">
                                    <div>
                                        <input
                                            type="checkbox"
                                            id="fablab"
                                            value="FabLab"
                                            checked={assignedLabs.includes('FabLab')}
                                            onChange={(e) => handleLabChange(e.target)}
                                        />
                                        <label htmlFor="fablab">
                                            FabLab
                                        </label>
                                    </div>
                                    <div>
                                        <input
                                        type="checkbox"
                                        id="woodshop"
                                        value="Woodshop"
                                        checked={assignedLabs.includes('Woodshop')}
                                        onChange={(e) => handleLabChange(e.target)}
                                    />
                                    <label htmlFor="woodshop">
                                        Woodshop
                                    </label>
                                    </div>
                                    
                                    
                                </div>
                            )}
                            {formError && <p>{formError}</p>}
                            <button type='submit'>{createNew ? 'Create' : 'Save Changes'}</button>
                        </form>
                </dialog>
        </article>

    )
}