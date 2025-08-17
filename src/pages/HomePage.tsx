import { 
    Typography, 
    Container, 
    Box, 
    Grid, 
    Card, 
    CardContent, 
    Button,
    alpha
} from '@mui/material';import { 
    SportsTennis, 
    Schedule, 
    People, 
    TrendingUp,
    Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <SportsTennis sx={{ fontSize: 48, color: '#4CAF50' }} />,
            title: 'Gestión de Canchas',
            description: 'Administra múltiples canchas deportivas con facilidad y eficiencia'
        },
        {
            icon: <Schedule sx={{ fontSize: 48, color: '#2196F3' }} />,
            title: 'Reservas en Tiempo Real',
            description: 'Sistema de reservas instantáneo con disponibilidad en tiempo real'
        },
        {
            icon: <People sx={{ fontSize: 48, color: '#FF9800' }} />,
            title: 'Gestión de Clientes',
            description: 'Base de datos completa de clientes con historial de reservas'
        },
        {
            icon: <TrendingUp sx={{ fontSize: 48, color: '#9C27B0' }} />,
            title: 'Reportes y Análisis',
            description: 'Estadísticas detalladas y reportes de rendimiento del negocio'
        }
    ];

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${alpha('#1976d2', 0.1)} 0%, ${alpha('#4caf50', 0.1)} 100%)`,
            pb: 8
        }}>
            {/* Hero Section */}
            <Container maxWidth="lg">
                <Box sx={{ 
                    pt: { xs: 4, md: 8 }, 
                    pb: { xs: 4, md: 6 }, 
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    {/* Decorative SVG Background */}
                    <Box sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        zIndex: 0
                    }}>
                        <svg width="100%" height="100%" viewBox="0 0 800 600">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1976d2" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            <circle cx="200" cy="150" r="80" fill="#4caf50" opacity="0.3"/>
                            <circle cx="600" cy="300" r="60" fill="#ff9800" opacity="0.3"/>
                            <circle cx="400" cy="450" r="100" fill="#2196f3" opacity="0.3"/>
                        </svg>
                    </Box>

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography 
                            variant="h2" 
                            component="h1" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 700,
                                background: 'linear-gradient(45deg, #1976d2, #4caf50)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 3,
                                fontSize: { xs: '2.5rem', md: '3.75rem' }
                            }}
                        >
                            CanchaSystem
                        </Typography>
                        
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            gutterBottom
                            sx={{ 
                                color: 'text.secondary',
                                mb: 4,
                                maxWidth: '800px',
                                mx: 'auto',
                                fontSize: { xs: '1.2rem', md: '1.5rem' }
                            }}
                        >
                            La plataforma para la gestión profesional de canchas deportivas
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button 
                                variant="contained" 
                                size="large"
                                onClick={() => navigate('/admin')}
                                sx={{ 
                                    px: 4, 
                                    py: 1.5,
                                    borderRadius: 3,
                                    background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Panel de Administración
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Features Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography 
                        variant="h3" 
                        component="h2" 
                        textAlign="center" 
                        gutterBottom
                        sx={{ 
                            fontWeight: 600,
                            mb: 6,
                            color: 'text.primary',
                            fontSize: { xs: '2rem', md: '3rem' }
                        }}
                    >
                        Características Principales
                    </Typography>
                    
                    <Grid container spacing={4}>
                        {features.map((feature) => (
                            <Grid>
                                <Card sx={{ 
                                    p: 4,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                    }
                                }}>
                                    <CardContent sx={{ p: 0 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                            {feature.icon}
                                            <Typography variant="h5" component="h3" sx={{ ml: 2, fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                                {feature.title}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* CTA Section */}
                <Box sx={{ 
                    textAlign: 'center',
                    p: { xs: 4, md: 6 },
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #1976d2 0%, #4caf50 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative elements */}
                    <Box sx={{ 
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 0
                    }} />
                    <Box sx={{ 
                        position: 'absolute',
                        bottom: -30,
                        left: -30,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 0
                    }} />
                    
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Star sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
                        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                            ¿Listo para comenzar?
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        </Typography>
                        <Button 
                            variant="contained" 
                            size="large"
                            onClick={() => navigate('/admin')}
                            sx={{ 
                                px: { xs: 4, md: 6 }, 
                                py: { xs: 1.5, md: 2 },
                                borderRadius: 3,
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.3)',
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Comenzar Ahora
                        </Button>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default HomePage;
