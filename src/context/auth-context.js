import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import LocalStorageService from '../services/localStorageService.ts';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/httpService.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const login = (token, refreshToken) => {
        LocalStorageService.getService().setToken({ accessToken: token, refreshToken });
        setUser({ token });
        navigate('/');
    };

    const logout = useCallback(() => {
        LocalStorageService.getService().clearToken();
        setUser(null);
        navigate('/login');
    }, [navigate]);
    
    const fetchUser = useCallback(async () => {
        const token = LocalStorageService.getService().getAccessToken();
        
        if (!token) 
        {
            setIsLoading(false);
            return;
        }
    
        try {
            const response = await axiosInstance.get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUser(response.data);
        } catch (error) {
            console.log("Token not valid or expires:", error);
            logout();
        } finally { 
            setIsLoading(false);
        }

    }, [logout]);
    
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
