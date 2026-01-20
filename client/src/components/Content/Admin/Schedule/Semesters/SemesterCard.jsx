import { useRef, useState } from "react";
import DeleteSemesterDialog from "./DeleteSemesterDialog";
import EditSemesterDialog from "./EditSemesterDialog";

export default function SemesterCard({
    semester,
    setSemesters,
    setSuccess,
    onUpdate,
    fetchSemesters,
    }) {
    const editDialogRef = useRef(null);
    const deleteDialogRef = useRef(null);

    const [openDialog, setOpenDialog] = useState(null); // "edit" | "delete" | null

    function convertDate(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    function isDatePassed(semesterObj) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(semesterObj.endDate + "T00:00:00");
        return endDate < today;
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

    const editDialogId = `edit-semester-${semester._id}`;
    const deleteDialogId = `delete-semester-${semester._id}`;

    return (
        <div className={`card ${isDatePassed(semester) ? "deleted" : ""}`}>
            <h3>{semester.name}</h3>

            <div className="card-content-group">
                <p>
                From <strong>{convertDate(semester.startDate).toDateString()}</strong>
                </p>
                <p>
                Till <strong>{convertDate(semester.endDate).toDateString()}</strong>
                </p>
                <p>
                <em>Status </em> {semester.isActive ? "Active" : "Blocked"} /{" "}
                {semester.isActive
                    ? "Users can schedule appointments"
                    : "Users can NOT schedule appointments"}
                </p>
            </div>

        <div className="card-button-group">
            <button
                onClick={() => openModal(editDialogRef, "edit")}
                aria-expanded={openDialog === "edit"}
                aria-controls={editDialogId}
                aria-haspopup="dialog"
            >
            Edit
            </button>

            <EditSemesterDialog
                ref={editDialogRef}
                dialogId={editDialogId}
                handleDialogClick={handleDialogClick}
                closeModal={closeModal}
                onClose={handleDialogClose}
                semester={semester}
                setSemesters={setSemesters}
                setSuccess={setSuccess}
                fetchSemesters={fetchSemesters}
                onUpdate={onUpdate}
            />

            <button
                onClick={() => openModal(deleteDialogRef, "delete")}
                aria-expanded={openDialog === "delete"}
                aria-controls={deleteDialogId}
                aria-haspopup="dialog"
            >
            Delete
            </button>

            <DeleteSemesterDialog
                ref={deleteDialogRef}
                dialogId={deleteDialogId}
                handleDialogClick={handleDialogClick}
                closeModal={closeModal}
                onClose={handleDialogClose}
                semester={semester}
                onUpdate={onUpdate}
            />
        </div>
        </div>
    );
}
