export function convertTime(time) {
    let hours = time.split(':').shift();
    const minutes = time.split(':').pop();

    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours !== 0 ? hours : 12; //handles 0 as 12am
    
    const formattedTime = `${hours}:${minutes} ${ampm}`
    return formattedTime;
}