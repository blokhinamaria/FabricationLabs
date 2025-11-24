import { AuthProvider } from './AuthContext.jsx';
import { AvailabilityProvider } from './AvailabilityContext.jsx';

export function AppProviders({ children }) {
    return (
        <AuthProvider>
            <AvailabilityProvider>
                {children}
            </AvailabilityProvider>
        </AuthProvider>
    );
}