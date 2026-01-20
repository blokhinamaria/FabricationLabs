import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../../AuthContext";
import SemesterCard from "./SemesterCard";
import { API_URL } from "../../../../../config";
import AddNewSemesterDialog from "./AddNewSemesterDialog";

export default function Semesters() {
    
    const { user } = useAuth();

    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [dataError, setDataError] = useState("");

    useEffect(() => {
        fetchSemesters();
    }, []);

    async function fetchSemesters() {
        setLoading(true);
        try {
            setDataError("");
            const response = await fetch(`${API_URL}/api/semester`, {
                credentials: "include",
            });

            if (!response.ok) {
                setDataError("Failed to fetch semesters dates");
                return
            }

            const data = await response.json();

            if (data.semesters) {
                setSemesters(sortDates(data.semesters));
            } else {
                setSemesters([])
                console.warn("No semesters found in response:", data);
            }
        } catch (err) {
            console.error("Fetch semesters error:", err);
            setDataError("Failed to load semesters");
            setSemesters([]);
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

    // dialog
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
        const timeout = setTimeout(() => {
            setSuccess(false);
        }, 3000);
        return () => clearTimeout(timeout);
    }, [success]);

    async function onUpdate(id) {
        if (user.role === "demo-admin") {
            setSemesters((prev) => prev.filter((semester) => semester._id !== id));
            setSuccess(true);
            return;
        }
        setSuccess(true);
        await fetchSemesters();
    }

    if (loading) return <p>loading...</p>;
    if (dataError) return <p>{dataError}</p>;

    return (
        <div className="card-box">
            {semesters.length === 0 ? (
                <p>No semester periods found</p>
            ) : (
                semesters.map((semester) => (
                <SemesterCard
                    key={semester._id}
                    semester={semester}
                    setSemesters={setSemesters}
                    setSuccess={setSuccess}
                    onUpdate={onUpdate}
                    fetchSemesters={fetchSemesters}
                />
                ))
            )}

            <button
                onClick={handleCreateNew}
                aria-expanded={isDialogOpen}
                aria-controls="add-new-semester"
                aria-haspopup="dialog"
            >
                + Add Semester
            </button>

        <AddNewSemesterDialog
            ref={dialogRef}
            setSemesters={setSemesters}
            setSuccess={setSuccess}
            fetchSemesters={fetchSemesters}
            onClose={handleDialogClose}
        />

        <div id="success" className={!success && "hidden"}>
            Changes Saved
        </div>
        </div>
    );
}
