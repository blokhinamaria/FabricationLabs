import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from './config'

const AuthContext = createContext(null)

export function AuthProvider( {children} ) {
    const [ user, setUser ] = useState(null);
    const [ redirect, setRedirect ] = useState('/');
    const [ loading, setLoading ] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);


    const checkAuth = async() => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/api/check-auth`, 
                {
                    credentials: 'include'
                } 
            )
            const data = await response.json()

            if (data.authenticated) {                                
                setUser(data.user)
                setRedirect(data.redirect)
                
                if (location.pathname === '/') {
                    navigate(data.redirect)
                }

                return
            } else {
                setUser(null)
                setRedirect('/')
                return
            }
        } catch (err) {
            console.log(`Auth check failed: ${err}`)
            setRedirect('/')
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
            await fetch(`${API_URL}/api/logout`, {
                method: "POST",
                credentials: 'include'
            })
            setUser(null)
            navigate('/')
        } catch (err) {
            console.log(`Logout failed: ${err}`)
        }
    }

    return (
        <AuthContext.Provider value={{ user, redirect, loading, checkAuth, updateUser, logout }}>
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
