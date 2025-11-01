export function convertDate(date) {

    const dateObject = new Date(date);

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric' };
        // "Friday, October 31, 2025"
    return new Intl.DateTimeFormat('en-US', options).format(dateObject); 
}