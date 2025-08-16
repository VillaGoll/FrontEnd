import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Modal, TextField, useTheme } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import courtService from '../../services/court.service';
import authService from '../../services/auth.service';

interface Court {
    _id: string;
    name: string;
}

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
    const navigate = useNavigate();
    const [courts, setCourts] = useState<Court[]>([]);
    const [originalCourts, setOriginalCourts] = useState<Court[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openReAuth, setOpenReAuth] = useState(false);
    const [password, setPassword] = useState('');
    const open = Boolean(anchorEl);
    console.log(courts)

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const response = await courtService.getAllCourts();
                setCourts(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCourts();
    }, []);

    const handleOpenReAuth = () => {
        setOpenReAuth(true);
    };

    const handleCloseReAuth = () => {
        setOpenReAuth(false);
        setPassword('');
    };

    const handleReAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.reAuth(password);
            const response = await courtService.getOriginalCourts();
            setOriginalCourts(response.data);
            handleCloseReAuth();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AppBar 
            position="static" 
            sx={{ 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
            }}
        >
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component={Link} 
                    to="/" 
                    sx={{ 
                        flexGrow: 1, 
                        color: 'inherit', 
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        letterSpacing: '1px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                            textShadow: '0 0 10px rgba(255,255,255,0.5)'
                        }
                    }}
                >
                    VillaGol
                </Typography>
                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                    {courts.map(court => (
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to={`/court/${court._id}`} 
                            key={court._id}
                            sx={{
                                mx: 0.5,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            {court.name}
                        </Button>
                    ))}
                    {originalCourts.map(court => (
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to={`/court/${court._id}`} 
                            key={court._id}
                            sx={{
                                mx: 0.5,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            {court.name}
                        </Button>
                    ))}
                    {isAuthenticated && user?.role === 'admin' && (
                        <>
                            <Button 
                                color="inherit" 
                                component={Link} 
                                to="/admin"
                                sx={{
                                    mx: 0.5,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Admin
                            </Button>
                            <Button 
                                color="inherit" 
                                onClick={handleOpenReAuth}
                                sx={{
                                    mx: 0.5,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Originales
                            </Button>
                        </>
                    )}
                    {isAuthenticated ? (
                        <Button 
                            color="inherit" 
                            onClick={handleLogout}
                            sx={{
                                ml: 2,
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                borderRadius: '20px',
                                px: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }
                            }}
                        >
                            Logout
                        </Button>
                    ) : (
                        <Button 
                            color="inherit" 
                            component={Link} 
                            to="/login"
                            sx={{
                                ml: 2,
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                borderRadius: '20px',
                                px: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }
                            }}
                        >
                            Login
                        </Button>
                    )}
                </Box>
                <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenu}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={open}
                        onClose={handleClose}
                    >
                                                {courts.map(court => (
                            <MenuItem onClick={handleClose} component={Link} to={`/court/${court._id}`} key={court._id}>{court.name}</MenuItem>
                        ))}
                                                {isAuthenticated && user?.role === 'admin' && (
                            <MenuItem onClick={handleClose} component={Link} to="/admin">Admin</MenuItem>
                        )}
                        {isAuthenticated ? (
                            <MenuItem 
                                onClick={() => { handleClose(); handleLogout(); }}
                                sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(33, 150, 243, 0.1)'
                                    }
                                }}
                            >
                                Logout
                            </MenuItem>
                        ) : (
                            <MenuItem 
                                onClick={handleClose} 
                                component={Link} 
                                to="/login"
                                sx={{
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(33, 150, 243, 0.1)'
                                    }
                                }}
                            >
                                Login
                            </MenuItem>
                        )}
                    </Menu>
                </Box>
            </Toolbar>
            <Modal open={openReAuth} onClose={handleCloseReAuth}>
                <Box sx={{ ...style, width: 400 }} component="form" onSubmit={handleReAuth}>
                    <Typography variant="h6" component="h2">
                        Re-autenticación
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Para acceder a las canchas originales, por favor ingrese su contraseña nuevamente.
                    </Typography>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Acceder
                    </Button>
                </Box>
            </Modal>
        </AppBar>
    );
};

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default Navbar;