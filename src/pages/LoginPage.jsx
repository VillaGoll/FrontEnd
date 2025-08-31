import { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, IconButton, InputAdornment, CircularProgress, Autocomplete } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
//import authService from '../services/auth.service';
import userService from '../services/user.service';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailOptions, setEmailOptions] = useState([]);

    const { email, password } = formData;

    useEffect(() => {
        // Cargar emails registrados para autocompletado
        const fetchEmails = async () => {
            try {
                const response = await userService.getAllEmails();
                setEmailOptions(response.data);
            } catch (error) {
                console.error('Error al cargar emails:', error);
            }
        };
        
        fetchEmails();
    }, []);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailChange = (event, newValue) => {
        setFormData({ ...formData, email: newValue || '' });
    };

    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            //console.log(formData)
            await login(formData);
            toast.success('Login successful!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.msg || 'An error occurred');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterOptions = (options, { inputValue }) => {
        return options.filter(option => 
            option.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <Box component="form" onSubmit={onSubmit} sx={{ mt: 1, width: '100%' }}>
                    <Autocomplete
                        freeSolo
                        options={emailOptions}
                        value={email}
                        onChange={handleEmailChange}
                        filterOptions={filterOptions}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoFocus
                                value={email}
                                onChange={onChange}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                            />
                        )}
                        sx={{ width: '100%' }}
                        ListboxProps={{
                            sx: {
                                '& li': {
                                    padding: '10px 16px',
                                    borderRadius: '4px',
                                    margin: '4px 8px',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                        color: '#1976d2',
                                        transform: 'translateX(5px)',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                        '&::before': {
                                            transform: 'scaleX(1)',
                                        }
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        bottom: 0,
                                        height: '2px',
                                        width: '100%',
                                        backgroundColor: '#1976d2',
                                        transform: 'scaleX(0)',
                                        transformOrigin: 'left',
                                        transition: 'transform 0.3s ease'
                                    }
                                },
                                '& .MuiAutocomplete-option[aria-selected="true"]': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.15)',
                                    '&::before': {
                                        transform: 'scaleX(1)',
                                    }
                                },
                                maxHeight: '250px',
                                padding: '8px 0',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            },
                        }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={onChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                </Box>
            </Box>
            <ToastContainer />
        </Container>
    );
};

export default LoginPage;