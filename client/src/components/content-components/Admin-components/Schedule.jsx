import { useAuth } from "../../../AuthContext.jsx"
import BlockoutDates from "./schedule-components/BlockoutDates.jsx"
import Semesters from "./schedule-components/Semesters.jsx"
export default function Schedule() {
    const {user} = useAuth();
    return (
        <main>
            <h1>Schedule</h1>
            <article className="upcoming-appointments">
                <h2>Semester Dates</h2>
                <Semesters/>
                <h2>{`${user.assignedLabs.join('&')} Blockout Dates`}</h2>
                <BlockoutDates/>
            </article>
        </main>
        
    )
} 