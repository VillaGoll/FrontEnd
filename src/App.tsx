import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CourtPage from './pages/CourtPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GlobalSpinner from './components/layout/GlobalSpinner';

import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function App() {
    return (
        <LoadingProvider>
            <AuthProvider>
                <Router>
                    <ToastContainer />
                    <CssBaseline />
                    <GlobalSpinner />
                    <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/court/:id" element={<CourtPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
        </LoadingProvider>
    );
}

export default App;
