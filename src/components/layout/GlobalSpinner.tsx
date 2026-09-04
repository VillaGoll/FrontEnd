import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useLoading } from '../../context/LoadingContext';

const GlobalSpinner = () => {
    const { loading } = useLoading();
    const [visible, setVisible] = useState(false);
    const [phase, setPhase] = useState<'idle' | 'entering' | 'visible' | 'exiting'>('idle');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (loading) {
            if (timerRef.current) clearTimeout(timerRef.current);
            setVisible(true);
            setPhase('entering');
            timerRef.current = setTimeout(() => setPhase('visible'), 400);
        } else if (phase === 'visible' || phase === 'entering') {
            setPhase('exiting');
            timerRef.current = setTimeout(() => {
                setVisible(false);
                setPhase('idle');
            }, 400);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [loading]);

    if (!visible) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                willChange: 'opacity',
                '@keyframes fadeIn': {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                },
                '@keyframes fadeOut': {
                    from: { opacity: 1 },
                    to: { opacity: 0 },
                },
                animation: phase === 'exiting'
                    ? 'fadeOut 0.4s ease-out forwards'
                    : 'fadeIn 0.35s ease-in forwards',
            }}
        >
            {/* Backdrop oscuro - sin blur para 60fps */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                }}
            />

            {/* Contenido centrado */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* Balón de fútbol girando */}
                <Box
                    sx={{
                        '@keyframes roll': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                        },
                        animation: 'roll 1.2s linear infinite',
                        mb: 3,
                    }}
                >
                    <svg
                        width="72"
                        height="72"
                        viewBox="0 0 194 194"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle fill="#1a1a1a" cx="97" cy="97" r="97" />
                        <path fill="#ffffff" d="m 94,9.2 a 88,88 0 0 0 -55,21.8 l 27,0 28,-14.4 0,-7.4 z m 6,0 0,7.4 28,14.4 27,0 a 88,88 0 0 0 -55,-21.8 z m -67.2,27.8 a 88,88 0 0 0 -20,34.2 l 16,27.6 23,-3.6 21,-36.2 -8.4,-22 -31.6,0 z m 96.8,0 -8.4,22 21,36.2 23,3.6 15.8,-27.4 a 88,88 0 0 0 -19.8,-34.4 l -31.6,0 z m -50,26 -20.2,35.2 17.8,30.8 39.6,0 17.8,-30.8 -20.2,-35.2 -34.8,0 z m -68.8,16.6 a 88,88 0 0 0 -1.8,17.4 88,88 0 0 0 10.4,41.4 l 7.4,-4.4 -1.4,-29 -14.6,-25.4 z m 172.4,0.2 -14.6,25.2 -1.4,29 7.4,4.4 a 88,88 0 0 0 10.4,-41.4 88,88 0 0 0 -1.8,-17.2 z m -106,57.2 -15.4,19 L 77.2,182.6 a 88,88 0 0 0 19.8,2.4 88,88 0 0 0 19.8,-2.4 l 15.4,-26.6 -15.4,-19 -39.6,0 z m -47.8,2.6 -7,4 A 88,88 0 0 0 68.8,180.4 l -14,-24.6 -25.4,-16.2 z m 135.2,0 -25.4,16.2 -14,24.4 a 88,88 0 0 0 46.4,-36.6 l -7,-4 z" />
                    </svg>
                </Box>

                {/* Texto "Cargando" */}
                <Typography
                    sx={{
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        opacity: 0.85,
                    }}
                >
                    Cargando
                </Typography>

                {/* Puntos animados */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: '5px',
                        mt: 1.2,
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <Box
                            key={i}
                            sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                '@keyframes dotPulse': {
                                    '0%, 100%': { opacity: 0.3 },
                                    '50%': { opacity: 1 },
                                },
                                animation: 'dotPulse 1.4s ease-in-out infinite',
                                animationDelay: `${i * 0.25}s`,
                            }}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default GlobalSpinner;
