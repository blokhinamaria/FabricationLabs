import { CloseSmallIcon } from "../../../Icons/Icons";
import { useEffect, useMemo, useState, forwardRef } from "react";
import { useAuth } from "../../../../AuthContext.jsx";
import { API_URL } from "../../../../config.js";

const CancelDialogAdmin = forwardRef(function CancelDialogAdmin(
    {
        dialogId = "cancel-dialog",
        handleDialogClick,
        closeModal,
        onClose,
        appointment,
        setAppointmentStatus,
        fetchAppointment,
    },
    dialogRef
    ) {
    const { user } = useAuth();

    const [cancellationReason, setCancellationReason] = useState("");

    const appointmentDate = useMemo(
        () => new Date(appointment?.date),
        [appointment?.date]
    );
    const isClassReservation = appointment?.type === "class-reservation";
    const appointmentType = isClassReservation ? "Class Reservation" : "Appointment";
    const reservationEnd = useMemo(() => {
        return isClassReservation && appointment?.endTime
        ? new Date(appointment.endTime)
        : null;
    }, [isClassReservation, appointment?.endTime]);

    // Reset dialog-only state when switching appointments
    useEffect(() => {
        setCancellationReason("");
    }, [appointment?._id]);

    async function handleCancel(appointmentId) {
        if (user.role === "demo-admin") {
            setAppointmentStatus("cancelled");
            window.alert("Cancellation notice sent");
            closeModal(dialogRef);
            return;
        }

        try {
        const response = await fetch(
            `${API_URL}/api/admin/appointment/${appointmentId}/cancel`,
            {
                credentials: "include",
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cancellationReason }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to cancel appointment");
        }

            setAppointmentStatus("cancelled");
            closeModal(dialogRef);
            await fetchAppointment(appointmentId);
        } catch (err) {
            console.log(err);
            window.alert("Something went wrong, please try again later");
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
            Close <CloseSmallIcon />
            </button>
        </div>

        <div>
            <h4 id={`${dialogId}-title`}>
            Are you sure you want to cancel the {appointmentType} for
            </h4>
            <h3>{appointment?.equipmentName}</h3>

            {appointment?.userName ? (
            <p>
                Scheduled by {appointment.userName}
                <br />({appointment.userEmail})
            </p>
            ) : (
            <p>{appointment?.userEmail}</p>
            )}

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

        <form
            onSubmit={(e) => {
            e.preventDefault();
            handleCancel(appointment?._id);
            }}
        >   
            <div>
                <label htmlFor={`${dialogId}-reason`}>Reason</label>
            <input
                type="text"
                id={`${dialogId}-reason`}
                name="reason"
                placeholder="Reason for appointment cancelation"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                />
            </div>
            

            <p>The user will be notified via email</p>

            <button type="submit">Cancel {appointmentType}</button>
        </form>
        </dialog>
    );
});

export default CancelDialogAdmin;
