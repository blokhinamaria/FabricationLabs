import { useState,useRef } from "react"
import { useAuth } from "../../../../AuthContext"

export default function Semester({semester, handleEdit, onUpdate}) {

    const { userRole } = useAuth();

    const deleteDialogRef = useRef(null)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    
    const openModal = (ref) => {
        ref.current.showModal()
        setIsDialogOpen(true)
    }

    const closeModal = (ref) => {
        if (ref?.current) {
            ref.current.close();
            setIsDialogOpen(false);
    }}
    
    //close dialog when clicking outside
    const handleDialogClick = (e, ref) => {
        if (e.target === ref.current) {
            closeModal(ref);
        }
    }

    async function handleDelete(id) {

        if (userRole === 'demo-admin') {
            closeModal(deleteDialogRef);
            await onUpdate(id)
            return; 
        }

        try {
            const response = await fetch(`/api/semesters?id=${id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete');
            }
            closeModal(deleteDialogRef);
            await onUpdate();
            
        } catch (err) {
            console.log(err);
            alert('Something went wrong, please try again later')
        }
    }

    function convertDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    function isDatePassed (date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date.date) {
            const checkDate = new Date(date.date + 'T00:00:00');
            return checkDate < today;
        } else {
            const endDate = new Date(date.endDate + 'T00:00:00');
            return endDate < today;
        }
    };

    return (
        <section className={`appointment-overview ${isDatePassed(semester) ? ('deleted') : ''}`} key={semester._id}>
            <h3>{semester.name}</h3>
            <div className="appointment-overview-group">
                <p>From <strong>{convertDate(semester.startDate).toDateString()}</strong></p>
                <p>Till <strong>{convertDate(semester.endDate).toDateString()}</strong></p>
                <p><em>Status </em> {semester.isActive ? 'Active' : 'Blocked'} / {semester.isActive ? 'Users can schedule appointments' : 'Users can NOT schedule appointments'}
                </p>
            </div>
            <div className="appointment-button-container">
                <button onClick={() => handleEdit(semester)}>Edit</button>
                <button 
                    onClick={() => openModal(deleteDialogRef)}
                    aria-expanded={isDialogOpen}
                    aria-controls="delete-dialog"
                    aria-haspopup="dialog"
                    >
                        Delete
                </button>
                <dialog id='delete-dialog' ref={deleteDialogRef} onClick={(e) => handleDialogClick(e, deleteDialogRef)}>
                    <div className="dialog-close-button-wrapper">
                        <button onClick={() => closeModal(deleteDialogRef)} className="dialog-close-button">Close <img src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"/></button>
                    </div>
                    <h4>Are you sure you want to delete this semester</h4>
                    <div>
                        <h3>{semester.name}</h3>
                        
                            <div className="appointment-overview-group">
                                <p>From <strong>{convertDate(semester.startDate).toDateString()}</strong></p>
                                <p>Till <strong>{convertDate(semester.endDate).toDateString()}</strong></p>
                                <p><em>Status: </em> {semester.isActive ? 'Active' : 'Blocked'} / {semester.isActive ? 'Users can schedule appointments' : 'Users can NOT schedule appointments'}
                                </p>
                            </div>
                    </div>
                        
                    <button onClick={() => handleDelete(semester._id)}>Delete</button>
                </dialog>
            </div>
        </section>
    )
}