// AvailabilityContext.js
import { createContext, useContext, useState, useEffect } from 'react'
import { API_URL } from './config';

const AvailabilityContext = createContext();

export function AvailabilityProvider({ children }) {
    const [semesters, setSemesters] = useState([]);
    const [blackoutDates, setBlackoutDates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvailabilityData();
    }, []);

    async function fetchAvailabilityData () {
        try {
            setLoading(true);
            const semesterRes = await fetch(`${API_URL}/api/semesters`);
            const blackoutRes = await fetch(`${API_URL}/api/blockoutdates`);

            const semesters = await semesterRes.json();
            const blackouts = await blackoutRes.json();

            const today = new Date();
            setSemesters(semesters.semesters.filter(semester => new Date(semester.endDate) >= today));
            setBlackoutDates(blackouts.blockouts);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setLoading(false);
            }
        };

    //Check if two dates are the same day for blockout dates
    function isSameDay (date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
        };

    //Set time to start/end of day
    function getStartOfDay(date) {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    };

    function getEndOfDay(date) {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999);
        return newDate;
    }
    //convert semester dates
    function convertDate(dateString) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    function isDateAvailable (date, lab) {
        const checkDate = getStartOfDay(date);
        const today = getStartOfDay(new Date());
        
        // Check if date is in the past
        if (checkDate < today) {
            return false;
        }
    
        // Check day of week (closed on saturadays and sundays)
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0|| dayOfWeek === 6) {
            return false;
        }
    
        // Check if ti's within a semester
        const isInSemester = semesters && semesters.length > 0 
            ? semesters.some(semester => {
                const semesterStart = getStartOfDay(convertDate(semester.startDate));
                const semesterEnd = getEndOfDay(convertDate(semester.endDate));
                return checkDate >= semesterStart && checkDate <= semesterEnd;
                
            })
            : false;
        
        if (!isInSemester) {
            return false;
        }

        // Check blackouts

        const labBlockoutDates = blackoutDates.filter(blockout => blockout.lab.includes(lab))

        const isBlackedOut = labBlockoutDates.some(blackout => {
            // Single day blackout
            if (blackout.date) {
                const blackoutDate = getStartOfDay(convertDate(blackout.date));
                return isSameDay(checkDate, blackoutDate);
            }

            // Date range blackout
            if (blackout.startDate && blackout.endDate) {
                const blackoutStart = getStartOfDay(convertDate(blackout.startDate));
                const blackoutEnd = getEndOfDay(convertDate(blackout.endDate));
                return checkDate >= blackoutStart && checkDate <= blackoutEnd;
            }
            return false;
        });
        return !isBlackedOut;
    };

    function shouldDisableDate (date, lab) {
        return !isDateAvailable(date, lab);
    };

    const value = {
        semesters,
        blackoutDates,
        loading,
        isDateAvailable,
        shouldDisableDate,
        refreshAvailability: fetchAvailabilityData
    };

    return (
            <AvailabilityContext.Provider value={value}>
                {children}
            </AvailabilityContext.Provider>
        );
    }

export function useAvailability() {
    const context = useContext(AvailabilityContext);
    if (!context) {
        throw new Error('useAvailability must be used within AvailabilityProvider');
    }
    return context;
}