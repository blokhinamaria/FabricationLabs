import { useEffect, useRef, useState } from "react"

export default function Semesters() {

    const [ semesters, setSemesters ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ formData, setFormData ] = useState({
        name: '',
        startDate: '',
        endDate: '',
        isActive: true
    })
    const [formError, setFormError] = useState('')

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
            const response = await fetch('/api/semesters')
            const data = await response.json()

            if (data.semesters) {
                setSemesters(data.semesters)
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

    function handleEdit(semester) {
        setCreateNew(false);
        setEditId(semester._id)
        setFormData({
            name: semester.name,
            startDate: semester.startDate,
            endDate: semester.endDate,
            isActive: semester.isActive
            })
        openModal()
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

        try {
            if (editId) {
                const response = await fetch(`/api/semesters?id=${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                if (response.ok) {
                    closeModal();
                    fetchSemesters();
                }
            } else {
                    const response = await fetch(`/api/semesters`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                if (response.ok) {
                    closeModal();
                    fetchSemesters();
                }
            }
            
        } catch (err) {
            setFormError('Failed to save the semester')
            console.error(err)
        }
    }

    function convertDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    if (loading) return (<p>loading...</p>)

    return (
        <article>
            <h1>Semester Dates</h1>
            {semesters.length === 0 ? (<p>No semester periods found</p>
                ) : (
                    semesters.map(semester => (
                        <div key={semester._id}>
                            <h3>{semester.name}</h3>
                            <p>From {convertDate(semester.startDate).toDateString()}</p>
                            <p>Till {convertDate(semester.endDate).toDateString()}</p>
                            <p>Status: {semester.isActive ? 'Active' : 'Blocked'}
                            </p>
                            <p>{semester.isActive ? 'Users can schedule appointments' : 'Users can NOT schedule appointments'}
                                </p>
                            <button className="small" onClick={() => handleEdit(semester)}>Edit</button>
                        </div>
                        
                    )))}
            <button onClick={handleCreateNew}
                    aria-expanded={isDialogOpen}
                    aria-controls="delete-dialog"
                    aria-haspopup="dialog"
            >
                + Add Semester</button>
            <dialog id='add-new-semester' ref={dialogRef} onClick={handleDialogClick}>
                <button onClick={closeModal}
                >Close</button>
                    <h4>{createNew ? 'Add New Semester' : 'Edit Semester'}</h4>
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
                            <div>
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
        </article>

    )
}