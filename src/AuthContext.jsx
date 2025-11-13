import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null)

export function AuthProvider( {children} ) {
    const [ user, setUser ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);


    const checkAuth = async() => {
        try {
            const response = await fetch('/api/check-auth', 
                {
                credentials: 'include'
            }
        )
            const data = await response.json()

            if (data.authenticated) {

                const redirect = data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard'
                                
                setUser(data.user)
                navigate(redirect)
            } else {
                setUser(null)
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
        <AuthContext.Provider value={{ user, loading, checkAuth, updateUser, logout }}>
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
