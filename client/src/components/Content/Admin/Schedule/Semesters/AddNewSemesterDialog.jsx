import { forwardRef, useState } from "react";
import { useAuth } from "../../../../../AuthContext";
import { API_URL } from "../../../../../config";

const AddNewSemesterDialog = forwardRef(function AddNewSemesterDialog(
    { 
        setSemesters, 
        setSuccess, 
        fetchSemesters, 
        onClose
    },
        dialogRef
    ) {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        isActive: true,
    });
    const [formError, setFormError] = useState("");

    function resetForm() {
        setFormData({
            name: "",
            startDate: "",
            endDate: "",
            isActive: true,
        });
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

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError("");

        if (!formData.name || !formData.startDate || !formData.endDate) {
            setFormError("All fields are required");
        return;
        }

        const payload = {
            name: formData.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: formData.isActive,
        };

        if (user.role === "demo-admin") {
            const _id = crypto?.randomUUID?.() ?? Date.now().toString();
            setSemesters((prev) => [...prev, { ...payload, _id }]);
            internalClose();
            setSuccess(true);
            return;
        }

        if (user.role === "admin") {
            try {
                const response = await fetch(`${API_URL}/api/semester`, {
                    credentials: "include",
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const responseData = await response.json();

                if (!response.ok) {
                    setFormError(responseData?.error || "Failed to save the semester");
                    return;
                }
                setSuccess(true);
                internalClose();
                await fetchSemesters();
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
            id="add-new-semester"
            className="flow"
            ref={dialogRef}
            onClick={handleDialogClick}
            onClose={() => {
                onClose?.();
                resetForm();
            }}
            aria-labelledby="add-new-semester-title"
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

        <h3 id="add-new-semester-title">Add New Semester</h3>

        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="semesterName">Name</label>
                <input
                    type="text"
                    id="semesterName"
                    name="semesterName"
                    placeholder="Fall 2027"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            <div>
                <label htmlFor="startDate">Choose Staring Date</label>
                <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                />
            </div>

            <div>
                <label htmlFor="endDate">Choose Ending Date</label>
                <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                />
            </div>

            <div className="input-group-wrapper">
                <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.isActive}
                    onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                    }
                />
                <label htmlFor="active">Active Semester</label>
            </div>

            {formError && <p className="error-message" role="alert">{formError}</p>}

            <button type="submit">Create</button>
        </form>
        </dialog>
    );
    });

export default AddNewSemesterDialog;
