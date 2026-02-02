import { forwardRef, useState } from "react";
import { useAuth } from "../../../../../AuthContext";
import { API_URL } from "../../../../../config";

const DeleteSemesterDialog = forwardRef(function DeleteSemesterDialog(
    { dialogId, handleDialogClick, closeModal, semester, onUpdate, onClose },
    dialogRef
    ) {
    const { user } = useAuth();
    const [formError, setFormError] = useState('')

    function convertDate(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    async function handleDelete(id) {
        if (user.role === "demo-admin") {
            closeModal(dialogRef);
            await onUpdate?.(id);
            return;
        }

        try {
            setFormError('')
            const response = await fetch(`${API_URL}/api/semester/${id}`, {
                credentials: "include",
                method: "DELETE",
            });
            if (!response.ok) {
                setFormError("Failed to delete");
            }
            closeModal(dialogRef);
            await onUpdate?.();
        } catch (err) {
            console.log(err);
            setFormError("Something went wrong, please try again later");
        }
    }

    return (
        <dialog
            id={dialogId}
            className="flow"
            ref={dialogRef}
            onClick={(e) => handleDialogClick(e, dialogRef)}
            onClose={onClose}
            aria-labelledby={`${dialogId}-title`}
        >
        <div className="dialog-close-button-wrapper">
            <button
                onClick={() => closeModal(dialogRef)}
                className="dialog-close-button"
                type="button"
            >
            Close{" "}
            <img
                alt=""
                src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"
            />
            </button>
        </div>

        <div className="dialog-content flow">
            <h4 id={`${dialogId}-title`}>Are you sure you want to delete this semester</h4>

            <div>
                <h3>{semester.name}</h3>

                <div className="appointment-overview-group">
                <p>
                    From <strong>{convertDate(semester.startDate).toDateString()}</strong>
                </p>
                <p>
                    Till <strong>{convertDate(semester.endDate).toDateString()}</strong>
                </p>
                <p>
                    <em>Status: </em> {semester.isActive ? "Active" : "Blocked"} /{" "}
                    {semester.isActive
                    ? "Users can schedule appointments"
                    : "Users can NOT schedule appointments"}
                </p>
                </div>
            </div>
            {formError && (
                <p className="error-message" role="alert">
                    {formError}
                </p>
                )}

            <div className="dialog-actions">
                <button type="button" onClick={() => handleDelete(semester._id)}>
                    Delete
                </button>
            </div>
        </div>
        </dialog>
    );
    });

export default DeleteSemesterDialog;
