import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

export const checkTokenExpiration = () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        // Token has expired
        localStorage.removeItem('token'); // Clear expired token
        toast.warn('Tu sesión ha expirado. Por favor, inicia sesión de nuevo para continuar.');
        return true; // Indicates token was expired
      }
    } catch (error) {
      console.error('Error decodificando el token:', error);
      // If there's an error decoding, treat it as an invalid token
      localStorage.removeItem('token');
      toast.error('Hubo un problema con tu sesión. Por favor, inicia sesión de nuevo.');
      return true; // Indicates token was invalid
    }
  }

  return false; // No token or token is valid
};