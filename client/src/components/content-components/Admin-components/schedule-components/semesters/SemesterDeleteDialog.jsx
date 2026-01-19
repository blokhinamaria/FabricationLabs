import { useAuth } from "../../../../../AuthContext";
import { API_URL } from "../../../../../config";

export default function SemesterDeleteDialog({ref, handleDialogClick, closeModal, semester, onUpdate}) {
    
    const { userRole } = useAuth();

    function convertDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    async function handleDelete(id) {
        if (userRole === 'demo-admin') {
            closeModal(ref);
            await onUpdate(id)
            return; 
        }

        try {
            const response = await fetch(`${API_URL}/api/semester/${id}`, {
                credentials: 'include',
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete');
            }
            closeModal(ref);
            await onUpdate();
            
        } catch (err) {
            console.log(err);
            alert('Something went wrong, please try again later')
        }
    }

    return (
        <dialog id='delete-dialog' ref={ref} onClick={handleDialogClick}>
            <div className="dialog-close-button-wrapper">
                <button onClick={() => closeModal(ref)} className="dialog-close-button">Close <img src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"/></button>
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
    )
}