import { forwardRef, useState } from "react";
import { useAuth } from "../../../../../AuthContext";
import { API_URL } from "../../../../../config";

const DeleteBlockoutDialog = forwardRef(function DeleteBlockoutDateDialog(
    { dialogId, handleDialogClick, closeModal, onClose, date, onUpdate },
    dialogRef
    ) {
    const { user } = useAuth();
    const [formError, setFormError] = useState('')

    async function handleDelete(id) {
        if (user.role === "demo-admin") {
            closeModal(dialogRef);
            await onUpdate?.(id);
            return;
        }

        try {
            setFormError('')
            const response = await fetch(`${API_URL}/api/blockout-date/${id}`, {
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
            ref={dialogRef}
            onClick={(e) => handleDialogClick(e, dialogRef)}
            onClose={onClose}
            aria-labelledby={`${dialogId}-title`}
            className="flow"
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

        <h4 id={`${dialogId}-title`}>Are you sure you want to delete this blockout date</h4>

        <div>
            <h3>{date.name}</h3>

            {date.date ? (
            <p>{new Date(date.date + "T00:00:00").toDateString()}</p>
            ) : (
            <>
                <p>
                From{" "}
                <strong>
                    {new Date((date.date || date.startDate) + "T00:00:00").toDateString()}
                </strong>
                </p>
                <p>
                Till <strong>{new Date(date.endDate + "T00:00:00").toDateString()}</strong>
                </p>
            </>
            )}
        </div>
        {formError && (
            <p className="error-message" role="alert">
                {formError}
            </p>
            )}

        <button type="button" onClick={() => handleDelete(date._id)}>
            Delete
        </button>
        </dialog>
    );
});

export default DeleteBlockoutDialog;
