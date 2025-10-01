
import axios from 'axios';

// Asumiremos que el token se almacena en localStorage por ahora.
// En una aplicación real, esto podría estar en el estado de la aplicación (Context/Redux).
const getAccessToken = () => localStorage.getItem('accessToken');

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Peticiones: Añade el token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuestas: Manejo de errores globales
apiClient.interceptors.response.use(
  (response) => {
    // Cualquier código de estado que se encuentre dentro del rango de 2xx causa que esta función se active
    return response;
  },
  (error) => {
    // Cualquier código de estado que caiga fuera del rango de 2xx causa que esta función se active
    const { response } = error;

    if (response) {
      switch (response.status) {
        case 401:
          // Lógica para 401: Token expirado/inválido.
          // Por ejemplo: intentar renovar el token o redirigir al login.
          console.error('No autorizado. Redirigiendo al login...');
          // window.location.href = '/login'; // Descomentar para redirigir
          break;
        case 403:
          // Lógica para 403: Sin permisos.
          alert('Acceso denegado: No tienes los permisos necesarios.');
          break;
        case 400:
          // Lógica para 400: Error en la petición.
          // Los errores de validación específicos deberían manejarse en el componente que hace la llamada,
          // pero podemos registrar un mensaje genérico aquí.
          console.error('Petición incorrecta:', response.data);
          break;
        case 500:
          // Lógica para 500: Error del servidor.
          alert('Error interno del servidor. Por favor, inténtelo de nuevo más tarde.');
          break;
        default:
          // Otros errores
          break;
      }
    } else {
      // Errores sin respuesta del servidor (ej. problemas de red)
      console.error('Error de red o sin respuesta del servidor:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
