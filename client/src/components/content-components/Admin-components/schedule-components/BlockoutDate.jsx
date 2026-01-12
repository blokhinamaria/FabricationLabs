import { useState,useRef } from "react"
import { useAuth } from "../../../../AuthContext"
import { API_URL } from "../../../../config";

export default function BlockoutDate({date, handleEdit, onUpdate}) {

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
            const response = await fetch(`${API_URL}/api/blockoutdates?id=${id}`, {
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
        <section className={`appointment-overview ${isDatePassed(date) ? ('deleted') : ''}`} key={date._id}>
            <h3>{date.name}</h3>
            <div className='appointment-overview-group' key={date.date || date.startDate}>
                {date.date ? (
                    <p>{new Date(date.date + 'T00:00:00').toDateString()}</p>
                ) : (
                    <>
                        <p>From <strong>{new Date((date.date || date.startDate) + 'T00:00:00').toDateString()}</strong></p>
                        <p>Till <strong>{new Date(date.endDate + 'T00:00:00').toDateString()}</strong></p>
                    </>
                )}
            </div>
            <div className="appointment-button-container">
                <button onClick={() => handleEdit(date)}>Edit</button>
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
                    <h4>Are you sure you want to delete this blockout date</h4>
                    <div>
                        <h3>{date.name}</h3>
                        
                            {date.date ? (
                                <p>{new Date(date.date + 'T00:00:00').toDateString()}</p>
                            ) : (
                                <>
                                    <p>From <strong>{new Date((date.date || date.startDate) + 'T00:00:00').toDateString()}</strong></p>
                                    <p>Till <strong>{new Date(date.endDate + 'T00:00:00').toDateString()}</strong></p>
                                </>
                            )}
                    </div>       
                    <button onClick={() => handleDelete(date._id)}>Delete</button>
                </dialog>
            </div>
        </section>
    )
}