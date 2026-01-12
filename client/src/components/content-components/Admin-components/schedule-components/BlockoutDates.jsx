import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../AuthContext";
import BlockoutDate from "./BlockoutDate";
import { API_URL } from "../../../../config";

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
    const [success, setSuccess] = useState(false);

    const today = new Date()
    const minDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSuccess(false)
        }, 3000);
        return () => clearTimeout(timeout);
    }, [success]);

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
        
        try {
            const response = await fetch(`${API_URL}/api/blockoutdates`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch blockout dates');
            }
            
            const data = await response.json();
            
            if (data.blockouts) {
                setBlockoutDates(sortDates(data.blockouts));
            } else {
                console.warn('No blockouts in response:', data); 
            }
            
        } catch (err) {
            console.error('Fetch blockout dates error:', err);
            setFormError('Failed to load blockout dates');
        } finally {
            setLoading(false); 
        }
    }

    function sortDates(datesArray) {
        return datesArray.sort((dateA, dateB) => {
            const dateAStart = dateA.date 
                ? new Date(dateA.date).getTime() 
                : new Date(dateA.startDate).getTime();
            const dateBStart = dateB.date 
                ? new Date(dateB.date).getTime() 
                : new Date(dateB.startDate).getTime();
            
            return dateAStart - dateBStart; // ← Return a number, not boolean
        });
    }
    
    //dialog
    const dialogRef = useRef(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const openModal = (ref) => {
        ref.current.showModal()
        setIsDialogOpen(true)
    }

    const closeModal = (ref) => {
        if (ref?.current) {
            ref.current.close();
            setIsDialogOpen(false);
            setEditId(null)
            resetForm();
    }}

    //close dialog when clicking outside
    const handleDialogClick = (e, ref) => {
        if (e.target === ref.current) {
            closeModal(ref);
        }
    }

    const [ createNew, setCreateNew ] = useState(false);
    const [ editId, setEditId ] = useState('');

    function handleCreateNew() {
        resetForm();
        setCreateNew(true)
        openModal(dialogRef)
    }

    function handleEdit(blockoutDate) {
        setFormError('')
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
        openModal(dialogRef)
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
        setFormError(''); 

        const currentBlockoutDates = editId
            ? blockoutDates.filter(date => date._id !== editId)
            : blockoutDates

        if (!formData.name) {
            setFormError('Blockout Date Name Required')
            return
        }

        if (blackoutType === 'single') {
            if (!formData.date) {
                setFormError('Must provide the date')
                return
            }
            const alreadySet = currentBlockoutDates.some(date => 
                date.date === formData.date
            )
            if (alreadySet) {
                setFormError('The provided date is already set as unavailable')
                return
            }

            const fallsInRange = currentBlockoutDates.some(date => {
            if (date.startDate && date.endDate) {
                const checkDate = new Date(formData.date);
                const startDate = new Date(date.startDate);
                const endDate = new Date(date.endDate);
                return checkDate >= startDate && checkDate <= endDate;
                }
                return false;
            });

            if (fallsInRange) {
                setFormError('The provided date falls within an already blocked date range');
                return;
            }
            
        } else if (blackoutType === 'range') {
            if (!formData.startDate || !formData.endDate) {
                setFormError('Must provide both dates')
                return
            }

            const order = new Date(formData.startDate).getTime() > new Date(formData.endDate).getTime()
            if (!order) {
                setFormError('End date must be after the start date')
                return
            }

            const exactRangeMatch = currentBlockoutDates.some(date => 
                date.startDate === formData.startDate && 
                date.endDate === formData.endDate
            );

            if (exactRangeMatch) {
                setFormError('This date range is already set as unavailable');
                return;
            }

            const containsSingleDate = currentBlockoutDates.some(date => {
                if (date.date) {
                    const checkDate = new Date(date.date);
                    const newStart = new Date(formData.startDate);
                    const newEnd = new Date(formData.endDate);
                    return checkDate >= newStart && checkDate <= newEnd;
                }
                return false;
                });

            if (containsSingleDate) {
                setFormError('This range includes dates already marked as unavailable');
                return;
            }

            const overlapsRange = currentBlockoutDates.some(date => {
                if (date.startDate && date.endDate) {
                    const existingStart = new Date(date.startDate);
                    const existingEnd = new Date(date.endDate);
                    const newStart = new Date(formData.startDate);
                    const newEnd = new Date(formData.endDate);
                    
                    return (
                        (newStart <= existingEnd && newEnd >= existingStart)
                    );
                }
                return false;
            });

            if (overlapsRange) {
                setFormError('This range overlaps with an existing date range');
                return;
            }
        }

        const data = {
            name: formData.name,
            date: formData.date || '',
            startDate: formData.startDate || '',
            endDate: formData.endDate || '',
            type: blackoutType,
            lab: assignedLabs
        }; 

        // Demo admin 
        if (userRole === 'demo-admin') {
            if (editId) {
                setBlockoutDates(prev => prev.map(blockoutdate => 
                    blockoutdate._id === editId ? { ...data, _id: editId } : blockoutdate
                ));
            } else {
                setBlockoutDates(prev => [...prev, { ...data, _id: Date.now().toString() }]);
            }
            setSuccess(true);
            closeModal(dialogRef);
            resetForm();
            return; 
        }

    if (userRole === 'admin') {
        setLoading(true); 
        
        try { 
            let response;
            
            if (editId) {
                response = await fetch(`${API_URL}/api/blockoutdates?id=${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch(`${API_URL}/api/blockoutdates`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save blockout date');
            }

            // Success
            setSuccess(true);
            closeModal(dialogRef);
            await fetchBlockoutDates();
            resetForm();
        } catch (err) {
            console.error('Submit error:', err);
            setFormError(err.message || 'Failed to save the blockout date');
        } finally {
            setLoading(false);
        }
    }
}   

    async function onUpdate(id) {
        if (userRole === 'demo-admin') {
            setBlockoutDates(prev => prev.filter(date => date._id !== id))
            setSuccess(true);
            return; 
        }

        setSuccess(true);
        await fetchBlockoutDates();
    }

    // function convertDate(dateString) {
    //     const [year, month, day] = dateString.split('-').map(Number);
    //     return new Date(year, month - 1, day);
    // }

    if (loading) return (<p>loading...</p>)

    return (
        <section className="appointment-list">
            {blockoutDates.length === 0 ? (<p>No blockout dates found</p>
                ) : (
                    blockoutDates.map(date => (
                        <BlockoutDate 
                            key={date._id}
                            date={date}
                            handleEdit={handleEdit}
                            onUpdate={onUpdate}
                        />
                        
                    )))}
            <button onClick={handleCreateNew}
                    aria-expanded={isDialogOpen}
                    aria-controls="add-new-blockout"
                    aria-haspopup="dialog"
            >
                + Add Blockout Dates</button>
            <dialog id='add-new-blockout' ref={dialogRef} onClick={(e) => handleDialogClick(e, dialogRef)}>
                <div className="dialog-close-button-wrapper">
                    <button onClick={() => closeModal(dialogRef)} className="dialog-close-button">Close <img src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"/></button>
                </div>
                    <h3>{createNew ? 'Add New Blockout Date' : 'Edit Blockout Date'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group-wrapper column">
                                <label htmlFor="blockoutDateName">Name</label>
                                <input
                                    type="text"
                                    id="blockoutDatename"
                                    name="blockoutDateName"
                                    placeholder="Spring Break"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                            </div>
                            <div className="input-group-wrapper">
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
                            </div>
                            <div className="input-group-wrapper">
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
                                    <div className="input-group-wrapper column">
                                        <label htmlFor="startDate">Choose Date</label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            min={minDate}
                                            value={formData.date}
                                            onChange={e => setFormData({...formData, date: e.target.value})}
                                            />
                                    </div>
                                ) : (
                                    <>
                                        <div className="input-group-wrapper column">
                                            <label htmlFor="startDate">Choose Staring Date</label>
                                            <input
                                                type="date"
                                                id="startDate"
                                                name="startDate"
                                                min={minDate}
                                                value={formData.startDate}
                                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                                />
                                        </div>
                                        <div className="input-group-wrapper column">
                                            <label htmlFor="endDate">Choose Ending Date</label>
                                            <input
                                                type="date"
                                                id="endDate"
                                                name="endDate"
                                                min={formData.startDate || minDate}
                                                value={formData.endDate}
                                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                                                />
                                        </div>
                                    </>
                                )
                            }
                            {user.assignedLabs.length > 1 && (
                                <div className="lab-selector">
                                    <div className="input-group-wrapper">
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
                                    <div className="input-group-wrapper">
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
                            {formError && <p className="error-message">{formError}</p>}
                            <button type='submit'>{createNew ? 'Create' : 'Save Changes'}</button>
                        </form>
                </dialog>
                <div id='success' className={!success && 'hidden'}>
                    Changes Saved
                </div>
                            
        </section>                    
    )
}