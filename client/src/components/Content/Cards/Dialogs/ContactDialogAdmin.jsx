import { useEffect, useMemo, useState, forwardRef } from "react";
import { useAuth } from "../../../../AuthContext.jsx";
import { API_URL } from "../../../../config.js";
import { CloseSmallIcon } from "../../../Icons/Icons.jsx";

const ContactDialogAdmin = forwardRef(function ContactDialogAdmin(
    { dialogId = "contact-dialog", handleDialogClick, closeModal, onClose, appointment },
    dialogRef
    ) {
    const { user } = useAuth();

    const [emailFormError, setEmailFormError] = useState("");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");

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
        setEmailFormError("");
        setMessage("");
        setSubject("");
    }, [appointment?._id]);

    async function sendEmail(subjectValue, messageValue) {
        setEmailFormError("");

        try {
        const response = await fetch(
            `${API_URL}/api/admin/user/${appointment.userId}/contact`,
            {
            credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject: subjectValue, message: messageValue }),
            }
        );

        if (!response.ok) throw new Error("Failed to send email");

        window.alert("Email sent");
        } catch (err) {
        console.log(err);
        setEmailFormError("Something went wrong. Please try again.");
        }
    }

    async function handleSendMessage(e) {
        e.preventDefault();
        setEmailFormError("");

        const trimmedSubject = subject.trim();
        const trimmedMessage = message.trim();

        if (!trimmedSubject) {
        setEmailFormError("Email Subject is required");
        return;
        }

        if (!trimmedMessage) {
        setEmailFormError("Email Message is required");
        return;
        }

        const email = appointment?.userEmail;
        if (!email) {
        setEmailFormError("User email is required");
        return;
        }

        if (user.role === "demo-admin") {
        window.alert("Email sent");
        closeModal(dialogRef);
        return;
        }

        await sendEmail(trimmedSubject, trimmedMessage);
        closeModal(dialogRef);
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
            <h2 id={`${dialogId}-title`}>Contact User</h2>

            {appointment?.userName ? (
            <h3>
                {appointment.userName}
                <br />
                {appointment.userEmail}
            </h3>
            ) : (
            <h3>{appointment?.userEmail}</h3>
            )}

            <p>
            about {appointmentType} for {appointment?.equipmentName}
            </p>
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

        <form onSubmit={handleSendMessage}>
            <div>
            <label htmlFor={`${dialogId}-subject`}>Email Subject</label>
            <input
                type="text"
                id={`${dialogId}-subject`}
                name="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />
            </div>

            <div>
            <label htmlFor={`${dialogId}-message`}>Email Message</label>
            <textarea
                id={`${dialogId}-message`}
                name="message"
                placeholder="Message to the user"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            </div>

            <p>The user will be notified via email</p>

            {emailFormError && (
            <p className="error-message" role="alert">
                {emailFormError}
            </p>
            )}

            <button type="submit">Send Email</button>
        </form>
        </dialog>
    );
});

export default ContactDialogAdmin;
