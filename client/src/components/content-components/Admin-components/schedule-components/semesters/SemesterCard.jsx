import { useState,useRef } from "react"
import SemesterDeleteDialog from "./SemesterDeleteDialog";

export default function SemesterCard({semester, handleEdit, onUpdate}) {

    const editDialogRef = useRef(null)
    const deleteDialogRef = useRef(null)

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    function convertDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    
    const openModal = (ref) => {
        console.log(ref)
        ref.current.showModal()
        setIsDialogOpen(true)
    }

    const closeModal = (ref) => {
        console.log(ref)
        if (ref?.current) {
            ref.current.close();
            setIsDialogOpen(false);
    }}

    const handleDialogClick = (e, ref) => {
        console.log(ref)
        if (e.target === ref.current) {
            closeModal(ref);
        }
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
                <SemesterDeleteDialog
                    ref={deleteDialogRef}
                    handleDialogClick={handleDialogClick}
                    closeModal={closeModal}
                    semester={semester}
                    onUpdate={onUpdate}
                />
            </div>
        </section>
    )
}