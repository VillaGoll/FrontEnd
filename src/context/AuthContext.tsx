import { createContext, useReducer, type ReactNode, useEffect } from 'react';
import authService from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';
import { checkTokenExpiration } from '../utils/auth';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'regular' | 'admin';
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
}

interface AuthContextProps extends AuthState {
    login: (credentials: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const authReducer = (state: AuthState, action: any) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: true,
    });

    useEffect(() => {
        if (checkTokenExpiration()) {
            dispatch({ type: 'LOGOUT' });
        } else {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decodedToken: any = jwtDecode(token);
                    const user = { id: decodedToken.user.id, name: decodedToken.user.name, email: decodedToken.user.email, role: decodedToken.user.role };
                    dispatch({ type: 'LOGIN', payload: { token, user } });
                } catch (error) {
                    console.error('Invalid token');
                    localStorage.removeItem('token');
                    dispatch({ type: 'LOGOUT' });
                }
            } else {
                dispatch({ type: 'LOGOUT' });
            }
        }
    }, []);

    const login = async (credentials: any) => {
        const response = await authService.login(credentials);
        const { token } = response.data;
        localStorage.setItem('token', token);
        const decodedToken: any = jwtDecode(token);
        const user = { id: decodedToken.user.id, name: decodedToken.user.name, email: decodedToken.user.email, role: decodedToken.user.role };
        dispatch({ type: 'LOGIN', payload: { token, user } });
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;