import { useAuthContext } from '../context/AuthContext';

// Este archivo sirve como un alias conveniente para el hook de contexto.
// Permite a los componentes importar `useAuth` desde una ubicación predecible
// en lugar de tener que conocer la ruta exacta al archivo de contexto.
export const useAuth = useAuthContext;
