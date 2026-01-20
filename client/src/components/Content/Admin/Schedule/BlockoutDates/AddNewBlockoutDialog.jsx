import { forwardRef, useMemo, useState } from "react";
import { useAuth } from "../../../../../AuthContext";
import { API_URL } from "../../../../../config";

const AddNewBlockoutDialog = forwardRef(function AddNewBlockoutDialog(
    {
        dialogId,
        blockoutDates,
        setBlockoutDates,
        setSuccess,
        fetchBlockoutDates,
        onClose,
    },
        dialogRef
    ) {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        date: "",
        startDate: "",
        endDate: "",
    });
    const [formError, setFormError] = useState("");
    const [blackoutType, setBlackoutType] = useState("single");
    const [assignedLabs, setAssignedLabs] = useState(user.assignedLabs);

    function resetForm() {
        setFormData({ 
            name: "", 
            date: "", 
            startDate: "", 
            endDate: "" 
        });
        setBlackoutType("single");
        setAssignedLabs(user.assignedLabs);
        setFormError("");
    }

    const internalClose = () => {
        if (!dialogRef?.current) return;
        if (dialogRef.current.open) dialogRef.current.close();
        onClose();
        resetForm();
    };

    // close dialog when clicking outside
    const handleDialogClick = (e) => {
        if (e.target === dialogRef.current) {
            internalClose();
        }
    };

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

        if (!formData.name) {
            setFormError("Blockout Date Name Required");
        return;
        }

        if (blackoutType === "single") {
            if (!formData.date) {
                setFormError("Must provide the date");
            return;
            }

            const alreadySet = blockoutDates.some((d) => d.date === formData.date);
            if (alreadySet) {
                setFormError("The provided date is already set as unavailable");
                return;
            }

            const fallsInRange = blockoutDates.some((d) => {
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
        }

        if (blackoutType === "range") {
            if (!formData.startDate || !formData.endDate) {
                setFormError("Must provide both dates");
                return;
            }

            const isInvalidOrder = new Date(formData.startDate).getTime() > new Date(formData.endDate).getTime();
            if (isInvalidOrder) {
                setFormError("End date must be after the start date");
                return;
            }

            const exactRangeMatch = blockoutDates.some((d) => 
                d.startDate === formData.startDate && 
                d.endDate === formData.endDate
            );
            
            if (exactRangeMatch) {
                setFormError("This date range is already set as unavailable");
                return;
            }

            const containsSingleDate = blockoutDates.some((d) => {
            if (!d.date) return false;
                const checkDate = new Date(d.date);
                const newStart = new Date(formData.startDate);
                const newEnd = new Date(formData.endDate);
                return checkDate >= newStart && checkDate <= newEnd;
            });

            if (containsSingleDate) {
                setFormError("This range includes dates already marked as unavailable");
                return;
            }

            const overlapsRange = blockoutDates.some((d) => {
                if (!(d.startDate && d.endDate)) return false;
                const existingStart = new Date(d.startDate);
                const existingEnd = new Date(d.endDate);
                const newStart = new Date(formData.startDate);
                const newEnd = new Date(formData.endDate);
                return newStart <= existingEnd && newEnd >= existingStart;
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

        // Demo admin
        if (user.role === "demo-admin") {
            const _id = crypto?.randomUUID?.() ?? Date.now().toString();
            setBlockoutDates((prev) => [...prev, { ...payload, _id }]);
            setSuccess(true);
            internalClose();
            return;
        }

        // Admin
        if (user.role === "admin") {
            try {
                const response = await fetch(`${API_URL}/api/blockout-date`, {
                    credentials: "include",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const responseData = await response.json();

                if (!response.ok) {
                    setFormError(responseData?.error || "Failed to save the blockout date");
                    return;
                }

                setSuccess(true);
                internalClose();
                await fetchBlockoutDates();
                return;
            } catch (err) {
                console.error(err);
                setFormError("Failed to save the blockout date");
                return;
            }
        }

        setFormError("Failed to save the blockout date");
    }

    return (
        <dialog
            id={dialogId}
            className="flow"
            ref={dialogRef}
            onClick={handleDialogClick}
            onClose={() => {
                onClose?.();
                resetForm();
            }}
            aria-labelledby={`${dialogId}-title`}
        >
            <div className="dialog-close-button-wrapper">
                <button onClick={internalClose} className="dialog-close-button" type="button">
                    Close{" "}
                    <img
                        alt="close"
                        src="/icons/close_small_24dp_1F1F1F_FILL1_wght400_GRAD0_opsz24.svg"
                    />
                </button>
            </div>

            <h3 id={`${dialogId}-title`}>
                Add New Blockout Date
            </h3>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="blockoutDateName">Name</label>
                    <input
                        type="text"
                        id="blockoutDateName"
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
                            id="single"
                            value="single"
                            checked={blackoutType === "single"}
                            onChange={(e) => setBlackoutType(e.target.value)}
                        />
                        <label htmlFor="single">Single Day</label>
                    </div>

                    <div className="input-group-wrapper">
                        <input
                            type="radio"
                            id="range"
                            value="range"
                            checked={blackoutType === "range"}
                            onChange={(e) => setBlackoutType(e.target.value)}
                        />
                        <label htmlFor="range">Date Range</label>
                    </div>

                </div>
                

                {blackoutType === "single" ? (
                <div>
                    <label htmlFor="date">Choose Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        min={minDate}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                ) : (
                <div className="flow">
                    <div className="input-group-wrapper column">
                        <label htmlFor="startDate">Choose Staring Date</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            min={minDate}
                            value={formData.startDate}
                            onChange={(e) =>
                            setFormData({ ...formData, startDate: e.target.value })
                            }
                        />
                    </div>

                    <div className="input-group-wrapper column">
                        <label htmlFor="endDate">Choose Ending Date</label>
                        <input
                            type="date"
                            id="endDate"
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
                            id="fablab"
                            value="FabLab"
                            checked={assignedLabs.includes("FabLab")}
                            onChange={(e) => handleLabChange(e.target)}
                        />
                        <label htmlFor="fablab">FabLab</label>
                    </div>

                    <div className="input-group-wrapper">
                    <input
                        type="checkbox"
                        id="woodshop"
                        value="Woodshop"
                        checked={assignedLabs.includes("Woodshop")}
                        onChange={(e) => handleLabChange(e.target)}
                    />
                    <label htmlFor="woodshop">Woodshop</label>
                    </div>
                </div>
                )}

                {formError && (
                    <p className="error-message" role="alert">
                        {formError}
                    </p>
                )}

                <button type="submit">Create</button>
            </form>
        </dialog>
    );
});

export default AddNewBlockoutDialog;
