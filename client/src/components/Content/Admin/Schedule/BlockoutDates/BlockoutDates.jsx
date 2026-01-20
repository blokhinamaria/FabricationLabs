import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../../AuthContext";
import BlockoutDateCard from "./BlockoutDateCard";
import { API_URL } from "../../../../../config";
import AddNewBlockoutDialog from "./AddNewBlockoutDialog";

export default function BlockoutDates() {
    
    const { user } = useAuth();

    const [blockoutDates, setBlockoutDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dataError, setDataError] = useState("");

    useEffect(() => {
        fetchBlockoutDates();
    }, []);

    async function fetchBlockoutDates() {
        setLoading(true);
        try {
            setDataError("");
            const response = await fetch(`${API_URL}/api/blockout-date`, {
                credentials: "include",
            });

            if (!response.ok) {
                setDataError("Failed to fetch blockout dates");
                return
            }

            const data = await response.json();

            if (data.blockouts) 

            if (data.blockouts) {
                setBlockoutDates(sortDates(data.blockouts));
            } else {
                setBlockoutDates([])
                console.warn("No semesters found in response:", data);
            }
        } catch (err) {
            console.error("Fetch blockout dates error:", err);
            setDataError("Failed to load blockout dates");
            setBlockoutDates([]);
        } finally {
            setLoading(false);
        }
    }

    function sortDates(datesArray) {
        return datesArray.sort((dateA, dateB) => {
        const dateAStart = dateA.date
            ? new Date(dateA.date).getTime()
            : new Date(dateA.startDate).getTime();
        const dateBStart = dateB.date
            ? new Date(dateB.date).getTime()
            : new Date(dateB.startDate).getTime();
        return dateAStart - dateBStart;
        });
    }

    //dialog
    const dialogRef = useRef(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const openModal = () => {
        if (!dialogRef.current) return;
        if (!dialogRef.current.open) dialogRef.current.showModal();
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    //create new
    function handleCreateNew() {
        openModal();
    }

    useEffect(() => {
        const timeout = setTimeout(() => setSuccess(false), 3000);
        return () => clearTimeout(timeout);
    }, [success]);    
    
    async function onUpdate(id) {
        if (user.role === "demo-admin") {
            setBlockoutDates((prev) => prev.filter((date) => date._id !== id));
            setSuccess(true);
            return;
        }
        setSuccess(true);
        await fetchBlockoutDates();
    }

    if (loading) return <p>loading...</p>;
    if (dataError) return <p>{dataError}</p>;

    return (
        <div className="card-box">
            {blockoutDates.length === 0 ? (
                <p>No blockout dates found</p>
            ) : (
                blockoutDates.map((date) => (
                <BlockoutDateCard
                    key={date._id}
                    date={date}
                    setBlockoutDates={setBlockoutDates}
                    setSuccess={setSuccess}
                    fetchBlockoutDates={fetchBlockoutDates}
                    onUpdate={onUpdate}
                />
                ))
            )}

            <button
                onClick={handleCreateNew}
                aria-expanded={isDialogOpen}
                aria-controls="add-new-blockout"
                aria-haspopup="dialog"
            >
                + Add Blockout Dates
            </button>

        <AddNewBlockoutDialog
            ref={dialogRef}
            dialogId="add-new-blockout"
            blockoutDates={blockoutDates}
            setBlockoutDates={setBlockoutDates}
            setSuccess={setSuccess}
            fetchBlockoutDates={fetchBlockoutDates}
            onClose={handleDialogClose}
        />

        <div id="success" className={!success && "hidden"}>
            Changes Saved
        </div>
        </div>
    );
}
