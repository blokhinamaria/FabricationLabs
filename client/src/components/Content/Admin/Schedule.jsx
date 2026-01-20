import { useAuth } from "../../../AuthContext.jsx"
import BlockoutDates from "./Schedule/BlockoutDates/BlockoutDates.jsx"
import Semesters from "./Schedule/Semesters/Semesters.jsx"
export default function Schedule() {
    const {user} = useAuth();
    return (
        <main>
            <article>
                <h1>Schedule</h1>
                <section className="wide flow-lg">
                    <h2>Semester Dates</h2>
                    <Semesters/>
                </section>
                <section className="wide flow-lg">
                    <h2>{`${user.assignedLabs.join('&')} Blockout Dates`}</h2>
                    <BlockoutDates/>
                </section>
            </article>
        </main>
        
    )
} 