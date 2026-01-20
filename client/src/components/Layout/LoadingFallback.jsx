import Footer from './Footer.jsx'
import LoadingOrbit from '../Icons/LoadingOrbit.jsx'
import PublicHeader from './PublicHeader.jsx'
import Tooltip from '@mui/material/Tooltip'

export default function LoadingFallback() {
    return (
        <>
            <PublicHeader/>
                <main className='flow-lg'>
                    <Tooltip title={"We are currently using free Render hosting and it might take a while for the dashboard to load."} arrow placement="right">
                        <h2>
                            Loading Your Workspace...
                        </h2>
                        <LoadingOrbit />
                    </Tooltip>
                </main>
            <Footer />
        </>
    )
}