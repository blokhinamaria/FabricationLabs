import { useRef, useState } from "react";
import DeleteBlockoutDialog from "./DeleteBlockoutDialog";
import EditBlockoutDialog from "./EditBlockoutDialog";

export default function BlockoutDateCard({
        date,
        blockoutDates,
        setBlockoutDates,
        setSuccess,
        fetchBlockoutDates,
        onUpdate,
    }) {
    const editDialogRef = useRef(null);
    const deleteDialogRef = useRef(null);

    const [openDialog, setOpenDialog] = useState(null); // "edit" | "delete" | null

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

    function isDatePassed(blockout) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (blockout.date) {
            const checkDate = new Date(blockout.date + "T00:00:00");
            return checkDate < today;
        } else {
            const endDate = new Date(blockout.endDate + "T00:00:00");
            return endDate < today;
        }
    }

    const editDialogId = `edit-blockout-${date._id}`;
    const deleteDialogId = `delete-blockout-${date._id}`;

    return (
        <div className={`card ${isDatePassed(date) ? "deleted" : ""}`}>
            <h3>{date.name}</h3>

            <div className="card-content-group" key={date.date || date.startDate}>
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

            <div className="card-button-group">
                <button
                    onClick={() => openModal(editDialogRef, "edit")}
                    aria-expanded={openDialog === "edit"}
                    aria-controls={editDialogId}
                    aria-haspopup="dialog"
                >
                Edit
                </button>

                <EditBlockoutDialog
                        ref={editDialogRef}
                        dialogId={editDialogId}
                        handleDialogClick={handleDialogClick}
                        closeModal={closeModal}
                        onClose={handleDialogClose}
                        date={date}
                        blockoutDates={blockoutDates}   
                        setBlockoutDates={setBlockoutDates}
                        setSuccess={setSuccess}
                        fetchBlockoutDates={fetchBlockoutDates}
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

                <DeleteBlockoutDialog
                    ref={deleteDialogRef}
                    dialogId={deleteDialogId}
                    handleDialogClick={handleDialogClick}
                    closeModal={closeModal}
                    onClose={handleDialogClose}
                    date={date}
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    );
}
