import './loadingOrbit.css'

export default function LoadingOrbit() {
    return (
        <div className='loader-wrap'>
            <div className="loader-orbit" aria-label="Loading" role="status">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
        
    )
}