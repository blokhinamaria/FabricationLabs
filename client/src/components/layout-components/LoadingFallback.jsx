import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function LoadingFallback() {
    <>
        <Header isLoading={true} />
            <main>
                Loading Your Workspace...
            </main>
        <Footer />
    </>
    
}