import { forwardRef, useEffect, useState } from "react";
import { useAuth } from "../../../../../AuthContext";
import { API_URL } from "../../../../../config";

const EditSemesterDialog = forwardRef(function EditSemesterDialog(
    {
        dialogId,
        handleDialogClick,
        closeModal,
        onClose,
        semester,
        setSemesters,
        fetchSemesters,
        onUpdate,
    },
    dialogRef
    ) {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: semester.name,
        startDate: semester.startDate,
        endDate: semester.endDate,
        isActive: semester.isActive,
    });

    const [formError, setFormError] = useState("");

    // If the component stays mounted and semester changes, keep the form in sync
    useEffect(() => {
        setFormData({
            name: semester.name,
            startDate: semester.startDate,
            endDate: semester.endDate,
            isActive: semester.isActive,
        });
        setFormError("");
    }, [semester]);

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        if (!formData.name || !formData.startDate || !formData.endDate) {
            setFormError("All fields are required");
            return;
        }

        const data = {
            name: formData.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: formData.isActive,
        };

        // Demo mode
        if (user.role === "demo-admin") {
            setSemesters((prev) =>
                prev.map((s) => (s._id === semester._id ? { ...s, ...data } : s))
            );
            closeModal(dialogRef);
            onUpdate?.();
            return;
        }

        // Admin
        if (user.role === "admin") {
            try {
                const response = await fetch(`${API_URL}/api/semester/${semester._id}`, {
                    credentials: "include",
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                const responseData = await response.json();

                if (!response.ok) {
                    setFormError(responseData?.error || "Failed to save the semester");
                    return;
                }

                closeModal(dialogRef);
                await fetchSemesters();
                onUpdate?.();
                return;
            } catch (err) {
                console.error(err);
                setFormError("Failed to save the semester");
                return;
            }
        }

        setFormError("Failed to save the semester");
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

            <h3 id={`${dialogId}-title`}>Edit Semester</h3>

        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor={`${dialogId}-semesterName`}>Name</label>
                <input
                    type="text"
                    id={`${dialogId}-semesterName`}
                    name="semesterName"
                    placeholder="Fall 2027"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div>
                <label htmlFor={`${dialogId}-startDate`}>Choose Starting Date</label>
                <input
                    type="date"
                    id={`${dialogId}-startDate`}
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                />
            </div>

            <div>
            <label htmlFor={`${dialogId}-endDate`}>Choose Ending Date</label>
            <input
                type="date"
                id={`${dialogId}-endDate`}
                name="endDate"
                value={formData.endDate}
                onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
                }
                required
            />
            </div>

            <div className="input-group-wrapper">
            <input
                type="checkbox"
                id={`${dialogId}-active`}
                name="active"
                checked={formData.isActive}
                onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
                }
            />
            <label htmlFor={`${dialogId}-active`}>Active Semester</label>
            </div>

            {formError && <p role="alert">{formError}</p>}

            <button type="submit">Save</button>
        </form>
        </dialog>
    );
    });

export default EditSemesterDialog;
