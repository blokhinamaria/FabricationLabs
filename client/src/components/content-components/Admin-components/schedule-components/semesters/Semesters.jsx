import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../../../AuthContext";
import SemesterCard from "./SemesterCard";
import { API_URL } from "../../../../../config";

export default function Semesters() {
    const { user } = useAuth()
    const [ semesters, setSemesters ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ formData, setFormData ] = useState({
        name: '',
        startDate: '',
        endDate: '',
        isActive: true
    })
    
    const [formError, setFormError] = useState('')
    const [success, setSuccess] = useState(false);

    function resetForm() {
            setFormData({
                name: '',
                startDate: '',
                endDate: '',
                isActive: true
        })
    }

    useEffect(() => {
        fetchSemesters();
    },[])
    
    async function fetchSemesters() {

        try {
            const response = await fetch(`${API_URL}/api/semester`, {credentials:'include'})
            
            if (!response.ok) {
                throw new Error('Failed to fetch semesters dates');
            }
            
            const data = await response.json();
            
            if (data.semesters) {
                setSemesters(sortDates(data.semesters));
            } else {
                console.warn('No semesters found in response:', data); 
            }
            
        } catch (err) {
            console.error('Fetch semesters error:', err);
            setFormError('Failed to load semesters');
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
            closeModal(dialogRef);
        }
    }

    const [ createNew, setCreateNew ] = useState(false);
    const [ editId, setEditId ] = useState('');

    function handleCreateNew() {
        setCreateNew(true)
        openModal(dialogRef)
    }

    function handleEdit(semester) {
        setCreateNew(false);
        setEditId(semester._id);
        setFormData({
            name: semester.name,
            startDate: semester.startDate,
            endDate: semester.endDate,
            isActive: semester.isActive
            })
        openModal(dialogRef)
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!formData.name || !formData.startDate || !formData.endDate) {
            setFormError('All fields are required')
            return 
        }

        const data = {
            name: formData.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: formData.isActive
        };

        if (user.role === 'demo-admin') {
            if (editId) {
                setSemesters(prev => prev.map(semester => {
                    if (semester._id === editId) {
                        return data
                    } else {
                        return semester;
                    }
                }))
                closeModal(dialogRef)
            } else {
                setSemesters(prev => ([
                ...prev,
                data
                ]))
                closeModal(dialogRef)
                return;
            }
        }
        if (user.role === 'admin') {
            try {
                if (editId) {
                    const response = await fetch(`${API_URL}/api/semester/${editId}`, {
                        credentials: 'include',
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    })
                    const responseData = await response.json();
                    if (!response.ok) {
                        setFormError(responseData.error)
                        return 
                    }
                } else {
                        const response = await fetch(`${API_URL}/api/semester`, {
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    })
                    const responseData = await response.json();
                    if (!response.ok) {
                        setFormError(responseData.error)
                        return 
                    }
                }
                closeModal(dialogRef);
                setSuccess(true);
                fetchSemesters();
                    
                } catch (err) {
                    setFormError('Failed to save the semester')
                    console.error(err)
                } finally {
                    setLoading(false);
                }
            }
            setFormError('Failed to save the semester')
            return
        }

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSuccess(false)
        }, 3000);
        return () => clearTimeout(timeout);
    }, [success]);

    async function onUpdate(id) {
        if (user.role === 'demo-admin') {
            setSemesters(prev => prev.filter(date => date._id !== id))
            setSuccess(true);
            return; 
        }
        setSuccess(true);
        await fetchSemesters();
    }

    if (loading) return (<p>loading...</p>)

    return (
        <section className="appointment-list"> 
            {semesters.length === 0 ? (<p>No semester periods found</p>
                ) : (
                    semesters.map(semester => (
                        <SemesterCard 
                            key={semester._id}
                            semester={semester}
                            handleEdit={handleEdit}
                            onUpdate={onUpdate}
                        />
                    
                    )))}
            <button onClick={handleCreateNew}
                    aria-expanded={isDialogOpen}
                    aria-controls="delete-dialog"
                    aria-haspopup="dialog"
            > + Add Semester</button>
            <dialog id='add-new-semester' ref={dialogRef} onClick={handleDialogClick}>
                <div className="dialog-close-button-wrapper">
                    <button onClick={() => closeModal(dialogRef)} className="dialog-close-button">Close <img src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"/></button>
                </div>
                    <h3>{createNew ? 'Add New Semester' : 'Edit Semester'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="semesterName">Name</label>
                                <input
                                    type="text"
                                    id="semesterName"
                                    name="semesterName"
                                    placeholder="Fall 2027"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required />
                            </div>
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
                            <div className="input-group-wrapper">
                                <input
                                    type="checkbox"
                                    id="active"
                                    name="active"
                                    value={formData.isActive}
                                    checked={formData.isActive}
                                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    <label htmlFor="active">Active Semester</label>
                            </div>
                            {formError && <p>{formError}</p>}
                            <button type='submit'>{createNew ? 'Create' : 'Save Changes'}</button>
                        </form>
                </dialog>
                <div id='success' className={!success && 'hidden'}>
                    Changes Saved
                </div>
        </section>

    )
}