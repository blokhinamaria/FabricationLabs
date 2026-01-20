import Header from './Header.jsx'
import Footer from './Footer.jsx'
import LoadingOrbit from '../Icons/LoadingOrbit.jsx'

export default function LoadingFallback() {
    return (
        <>
            <Header isLoading={true} />
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