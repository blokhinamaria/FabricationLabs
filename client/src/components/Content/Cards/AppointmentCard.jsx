import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import DeleteAppointmentDialog from "./Dialogs/DeleteAppointmentDialog.jsx";

export default function AppointmentCard({ id, data }) {
    const [appointment, setAppointment] = useState(data || null);
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(null);

    const [appointmentStatus, setAppointmentStatus] = useState(data?.status);
    const navigate = useNavigate();

    // dialog (SemesterCard-style)
    const deleteDialogRef = useRef(null);
    const [openDialog, setOpenDialog] = useState(null); // "delete" | null

    useEffect(() => {
        if (!data && id) {
        fetchAppointment(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, data]);

    // keep derived status in sync when appointment arrives/changes
    useEffect(() => {
        if (appointment?.status) setAppointmentStatus(appointment.status);
    }, [appointment?.status]);

    async function fetchAppointment(appointmentId) {
        try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/me/appointment/${appointmentId}`, {
            credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
            setAppointment(result.appointment);
        } else {
            setError("Failed to load appointment");
        }
        } catch (err) {
        console.log(`Error fetching appointment data: ${err}`);
        setError("Failed to load appointment");
        } finally {
        setLoading(false);
        }
    }

    function address() {
        if (appointment?.location === "FabLab") {
        return (
            <p>
            R.K. Bailey Art Studios
            <br />
            310 N Blvd, Tampa, FL 33606
            </p>
        );
        }
        if (appointment?.location === "Woodshop") {
        return (
            <p>
            Ferman Center for the Arts
            <br />
            214 N Blvd, Tampa, FL 33606
            </p>
        );
        }
        return null;
    }

    const appointmentDate = new Date(appointment?.date);

    function daysLeft() {
        const today = new Date();

        if (
        appointmentDate.getDate() === today.getDate() &&
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getFullYear() === today.getFullYear()
        ) {
        const differenceInMs = appointmentDate.getTime() - today.getTime();
        const oneHourInMs = 1000 * 60 * 60;
        const differenceInHours = Math.ceil(differenceInMs / oneHourInMs);

        if (differenceInHours > 1) return `in ${differenceInHours} hours`;
        if (differenceInHours === 1) return `in ${differenceInHours} hour`;

        const oneMinuteInMs = 1000 * 60;
        const differenceInMinutes = Math.ceil(differenceInMs / oneMinuteInMs);

        if (differenceInMinutes > 1) return `in ${differenceInMinutes} minutes`;
        if (differenceInMinutes === 1) return `in ${differenceInMinutes} minute`;
        return "passed";
        }

        if (appointmentDate > today) {
        const differenceInMs = appointmentDate.getTime() - today.getTime();
        const oneDayInMs = 1000 * 60 * 60 * 24;
        const differenceInDays = Math.ceil(differenceInMs / oneDayInMs);

        if (differenceInDays > 1) return `in ${differenceInDays} days`;
        if (differenceInDays === 1) return `in ${differenceInDays} day`;
        }

        return "passed";
    }

    function handleEdit(appointmentId) {
        navigate("/dashboard/editappointment", { state: appointmentId });
    }

    const openModal = (ref, which) => {
        if (!ref?.current) return;
        if (!ref.current.open) ref.current.showModal();
        setOpenDialog(which);
    };

    const closeModal = (ref) => {
        if (!ref?.current) return;
        if (ref.current.open) ref.current.close();
        setOpenDialog(null);
    };

    const handleDialogClick = (e, ref) => {
        if (e.target === ref.current) closeModal(ref);
    };

    const handleDialogClose = () => {
        setOpenDialog(null);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <div>Error: {error}</div>;
    if (!appointment) return <p>No appointment found</p>;

    const isClassReservation = appointment?.type === "class-reservation";
    const reservationEnd =
        isClassReservation && appointment?.endTime ? new Date(appointment.endTime) : null;

    return (
        <div className={`card ${appointmentStatus === "deleted" ? "deleted" : ""}`}>
        <div className="card-content-group">
            {appointmentStatus === "cancelled" ? (
            <p className="error-message">Cancelled</p>
            ) : (
            <p>{appointmentStatus === "deleted" ? "Deleted" : daysLeft()}</p>
            )}
            <h3>{appointment.equipmentName}</h3>
        </div>

        <div className="card-content-group">
            <div className="card-icon-text">
            <img
                src="/icons/calendar_month_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg"
                alt="Calendar"
                width="24"
                height="24"
            />
            <p>{appointmentDate.toDateString()}</p>
            </div>

            <div className="card-icon-text">
            <img
                src="/icons/alarm_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg"
                alt="Clock"
                width="24"
                height="24"
            />
            <p>
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
        </div>

        <div className="card-content-group">
            <div className="card-icon-text">
            <img
                src="/icons/location_on_24dp_1F1F1F_FILL1_wght400_GRAD-25_opsz24.svg"
                alt="Location Pin"
                width="24"
                height="24"
            />
            <div>
                <p>
                <strong>{appointment.location}</strong>
                </p>
                {address()}
            </div>
            </div>
        </div>

        {appointmentStatus === "deleted" ? null : (
            <div className="card-button-group">
            <button
                onClick={() => handleEdit(appointment._id)}
                disabled={isClassReservation || appointment.status === "cancelled"}
            >
                Modify
            </button>

            <button
                onClick={() => openModal(deleteDialogRef, "delete")}
                aria-expanded={openDialog === "delete"}
                aria-controls={`delete-appointment-${appointment._id}`}
                aria-haspopup="dialog"
            >
                Delete
            </button>

            <DeleteAppointmentDialog
                ref={deleteDialogRef}
                dialogId={`delete-appointment-${appointment._id}`}
                handleDialogClick={handleDialogClick}
                closeModal={closeModal}
                onClose={handleDialogClose}
                appointment={appointment}
                setAppointmentStatus={setAppointmentStatus}
                onModify={() => handleEdit(appointment._id)}
            />
            </div>
        )}
        </div>
    );
}
