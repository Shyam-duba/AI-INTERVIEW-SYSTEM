import {Navigate} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import api from '../api'
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants';
import { useState, useEffect } from 'react';

function ProtectedRoute({children}) {
    const [isAuthorized, setIsAuthorized]  = useState(null);

    useEffect(() =>{
        accessToken().catch(() => setIsAuthorized(false))
    }, [])

    
    const accessToken = async () => {
        const accessToken = localStorage.getItem('token');
    
        if (!accessToken) {
            console.error("No refresh token found!");
            setIsAuthorized(false);
            return;
        }
        else{setIsAuthorized(true)} 
        
    };
    

    

    if (isAuthorized === null) {
        return <div>Loading..</div>
    }

    return isAuthorized ? children : <Navigate to="/login" />
}

export default ProtectedRoute; 