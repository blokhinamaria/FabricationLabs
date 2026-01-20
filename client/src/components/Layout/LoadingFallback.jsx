import Footer from './Footer.jsx'
import LoadingOrbit from '../Icons/LoadingOrbit.jsx'
import PublicHeader from './PublicHeader.jsx'

export default function LoadingFallback() {
    return (
        <>
            <PublicHeader/>
                <main className='flow-lg'>
                    <h2>
                        Loading Your Workspace...
                    </h2>
                    <LoadingOrbit />
                </main>
            <Footer />
        </>
    )
}