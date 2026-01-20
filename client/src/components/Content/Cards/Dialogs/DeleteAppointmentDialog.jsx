import { forwardRef, useMemo, useState } from "react";
import { API_URL } from "../../../../config";

const DeleteAppointmentDialog = forwardRef(function DeleteAppointmentDialog(
    {
        dialogId,
        handleDialogClick,
        closeModal,
        onClose,
        appointment,
        setAppointmentStatus,
        onModify,
    },
    dialogRef
    ) {
    const [deleteError, setDeleteError] = useState("");

    const isClassReservation = appointment?.type === "class-reservation";
    const appointmentType = isClassReservation ? "Class Reservation" : "Appointment";

    const appointmentDate = useMemo(() => new Date(appointment?.date), [appointment?.date]);
    const reservationEnd = useMemo(() => {
        return isClassReservation && appointment?.endTime ? new Date(appointment.endTime) : null;
    }, [isClassReservation, appointment?.endTime]);

    async function handleDelete(appointmentId) {
        try {
        setDeleteError("");

        const response = await fetch(`${API_URL}/api/me/appointment/${appointmentId}`, {
            credentials: "include",
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            // Your original code sends `body: JSON.stringify(id)` which is likely a bug.
            // DELETE typically doesn't need a body; keeping it omitted for reliability.
        });

        if (!response.ok) {
            throw new Error("Failed to delete");
        }

        setAppointmentStatus("deleted");
        closeModal(dialogRef);
        } catch (err) {
        console.log(err);
        setDeleteError("Something went wrong, please try again later");
        }
    }

    return (
        <dialog
            id={dialogId}
            className="flow-lg"
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

            <h4 id={`${dialogId}-title`}>Are you sure you want to delete the {appointmentType} for</h4>

            <div>
                <h3>{appointment?.equipmentName}</h3>
                <p>on {appointmentDate.toDateString()}</p>
                <p>
                at{" "}
                {appointmentDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })}
                {isClassReservation &&
                    reservationEnd &&
                    ` to ${reservationEnd.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    })}`}
                </p>
            </div>

            {deleteError && (
                <p className="error-message" role="alert">
                {deleteError}
                </p>
            )}

            {!isClassReservation && appointment?.status !== "cancelled" && (
                <button type="button" onClick={onModify}>
                Modify
                </button>
            )}

            <button type="button" onClick={() => handleDelete(appointment?._id)}>
                Delete
            </button>
        </dialog>
    );
});

export default DeleteAppointmentDialog;
