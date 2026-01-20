import { forwardRef, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../../AuthContext";
import { API_URL } from "../../../../../config";

const EditBlockoutDialog = forwardRef(function EditBlockoutDialog(
    {
        dialogId,
        handleDialogClick,
        closeModal,
        onClose,
        date, 
        blockoutDates, 
        setBlockoutDates, 
        fetchBlockoutDates,
        onUpdate,
    },
    dialogRef
    ) {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: date.name || "",
        date: date.date || "",
        startDate: date.startDate || "",
        endDate: date.endDate || "",
    });
    const [formError, setFormError] = useState("");
    const [blackoutType, setBlackoutType] = useState(date.type || "single");
    const [assignedLabs, setAssignedLabs] = useState(date.lab || user.assignedLabs);

    useEffect(() => {
        setFormError("");
        setBlackoutType(date.type || "single");
        setAssignedLabs(date.lab || user.assignedLabs);
        setFormData({
            name: date.name || "",
            date: date.date || "",
            startDate: date.startDate || "",
            endDate: date.endDate || "",
        });
    }, [date, user.assignedLabs]);

    const today = useMemo(() => new Date(), []);
    const minDate = useMemo(() => {
        return `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    }, [today]);

    function handleLabChange(target) {
        if (target.checked) {
            setAssignedLabs((prev) => [...prev, target.value]);
        } else {
            setAssignedLabs((prev) => prev.filter((lab) => lab !== target.value));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        const currentBlockoutDates = Array.isArray(blockoutDates)
            ? blockoutDates.filter((d) => d._id !== date._id)
            : [];

        if (!formData.name) {
            setFormError("Blockout Date Name Required");
        return;
        }

        if (blackoutType === "single") {
            if (!formData.date) {
                setFormError("Must provide the date");
                return;
            }

            const alreadySet = currentBlockoutDates.some((d) => d.date === formData.date);
            if (alreadySet) {
                setFormError("The provided date is already set as unavailable");
                return;
            }

            const fallsInRange = currentBlockoutDates.some((d) => {
                if (d.startDate && d.endDate) {
                const checkDate = new Date(formData.date);
                const startDate = new Date(d.startDate);
                const endDate = new Date(d.endDate);
                return checkDate >= startDate && checkDate <= endDate;
                }
                return false;
            });

            if (fallsInRange) {
                setFormError("The provided date falls within an already blocked date range");
                return;
            }
        } else if (blackoutType === "range") {
            if (!formData.startDate || !formData.endDate) {
                setFormError("Must provide both dates");
                return;
            }

            const isInvalidOrder = new Date(formData.startDate).getTime() > new Date(formData.endDate).getTime();
            if (isInvalidOrder) {
                setFormError("End date must be after the start date");
                return;
            }

            const exactRangeMatch = currentBlockoutDates.some((d) => d.startDate === formData.startDate && d.endDate === formData.endDate
            );
            if (exactRangeMatch) {
                setFormError("This date range is already set as unavailable");
                return;
            }

            const containsSingleDate = currentBlockoutDates.some((d) => {
                if (d.date) {
                    const checkDate = new Date(d.date);
                    const newStart = new Date(formData.startDate);
                    const newEnd = new Date(formData.endDate);
                    return checkDate >= newStart && checkDate <= newEnd;
                }
                return false;
            });

            if (containsSingleDate) {
                setFormError("This range includes dates already marked as unavailable");
                return;
            }

            const overlapsRange = currentBlockoutDates.some((d) => {
                if (d.startDate && d.endDate) {
                    const existingStart = new Date(d.startDate);
                    const existingEnd = new Date(d.endDate);
                    const newStart = new Date(formData.startDate);
                    const newEnd = new Date(formData.endDate);
                    return newStart <= existingEnd && newEnd >= existingStart;
                }
                return false;
            });

            if (overlapsRange) {
                setFormError("This range overlaps with an existing date range");
                return;
            }
        }

        const payload = {
            name: formData.name,
            date: blackoutType === "single" ? formData.date : "",
            startDate: blackoutType === "range" ? formData.startDate : "",
            endDate: blackoutType === "range" ? formData.endDate : "",
            type: blackoutType,
            lab: assignedLabs,
        };

        // Demo user
        if (user.role === "demo-admin") {
            setBlockoutDates?.((prev) =>
                prev.map((b) => (b._id === date._id ? { ...b, ...payload } : b))
            );
            closeModal(dialogRef);
            onUpdate?.();
            return;
        }

        // Admin
        if (user.role === "admin") {
            try {
                const response = await fetch(`${API_URL}/api/blockout-date/${date._id}`, {
                    credentials: "include",
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const responseData = await response.json();

                if (!response.ok) {
                    setFormError(responseData?.error || "Failed to save blockout date");
                    return;
                }

                closeModal(dialogRef);
                await fetchBlockoutDates?.();
                onUpdate?.();
                return;
            } catch (err) {
                console.error(err);
                setFormError("Failed to save blockout date");
                return;
            }
        }

        setFormError("Failed to save blockout date");
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
                    alt="close"
                    src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"
                />
                </button>
            </div>

        <h3 id={`${dialogId}-title`}>Edit Blockout Date</h3>

        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor={`${dialogId}-blockoutDateName`}>Name</label>
                <input
                    type="text"
                    id={`${dialogId}-blockoutDateName`}
                    name="blockoutDateName"
                    placeholder="Spring Break"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div>  
                <div className="input-group-wrapper">
                    <input
                        type="radio"
                        id={`${dialogId}-single`}
                        value="single"
                        checked={blackoutType === "single"}
                        onChange={(e) => setBlackoutType(e.target.value)}
                    />
                    <label htmlFor={`${dialogId}-single`}>Single Day</label>
                </div>
                <div className="input-group-wrapper">
                    <input
                        type="radio"
                        id={`${dialogId}-range`}
                        value="range"
                        checked={blackoutType === "range"}
                        onChange={(e) => setBlackoutType(e.target.value)}
                    />
                    <label htmlFor={`${dialogId}-range`}>Date Range</label>
                </div>
            </div>

            {blackoutType === "single" ? (
                <div>
                    <label htmlFor={`${dialogId}-date`}>Choose Date</label>
                    <input
                        type="date"
                        id={`${dialogId}-date`}
                        name="date"
                        min={minDate}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
            ) : (
            <div className="flow">
                <div className="input-group-wrapper column">
                    <label htmlFor={`${dialogId}-startDate`}>Choose Staring Date</label>
                    <input
                        type="date"
                        id={`${dialogId}-startDate`}
                        name="startDate"
                        min={minDate}
                        value={formData.startDate}
                        onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                        }
                    />
                </div>

                <div className="input-group-wrapper column">
                    <label htmlFor={`${dialogId}-endDate`}>Choose Ending Date</label>
                    <input
                        type="date"
                        id={`${dialogId}-endDate`}
                        name="endDate"
                        min={formData.startDate || minDate}
                        value={formData.endDate}
                        onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                        }
                    />
                </div>
            </div>
            )}

            {user.assignedLabs.length > 1 && (
            <div>
                <p>Applies to:</p>
                <div className="input-group-wrapper">
                <input
                    type="checkbox"
                    id={`${dialogId}-fablab`}
                    value="FabLab"
                    checked={assignedLabs.includes("FabLab")}
                    onChange={(e) => handleLabChange(e.target)}
                />
                <label htmlFor={`${dialogId}-fablab`}>FabLab</label>
                </div>

                <div className="input-group-wrapper">
                <input
                    type="checkbox"
                    id={`${dialogId}-woodshop`}
                    value="Woodshop"
                    checked={assignedLabs.includes("Woodshop")}
                    onChange={(e) => handleLabChange(e.target)}
                />
                <label htmlFor={`${dialogId}-woodshop`}>Woodshop</label>
                </div>
            </div>
            )}

            {formError && (
            <p className="error-message" role="alert">
                {formError}
            </p>
            )}

            <button type="submit">Save</button>
        </form>
        </dialog>
    );
    });

export default EditBlockoutDialog;
