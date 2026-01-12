import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from './config'

const AuthContext = createContext(null)

export function AuthProvider( {children} ) {
    const [ user, setUser ] = useState(null);
    const [ userRole, setUserRole ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);


    const checkAuth = async() => {
        try {
            const response = await fetch(`${API_URL}/api/check-auth`, 
                {
                credentials: 'include'
            }
        )
            const data = await response.json()

            if (data.authenticated) {                                
                setUser(data.user)
                setUserRole(data.user.role)
                navigate(data.redirect)
            } else {
                setUser(null)
                setUserRole(null)
                navigate('/')
            }
        } catch (err) {
            console.log(`Auth check failed: ${err}`)
            navigate('/')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const updateUser = (updatedFields) => {
        setUser(prev => ({ ...prev, ...updatedFields }));
    };

    const logout = async () => {
        try {
            await fetch('/api/logout', {
                method: "POST",
                credentials: 'include'
            })
            setUser(null)
            window.location.href = '/'
        } catch (err) {
            console.log(`Logout failed: ${err}`)
        }
    }

    return (
        <AuthContext.Provider value={{ user, userRole, loading, checkAuth, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );

};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
