import { http, HttpResponse } from 'msw';

const allComercios = [
  { id: 1, nombre: "Tienda de Abarrotes de Ana", estado: "activo" },
  { id: 2, nombre: "Supermercado La Confianza", estado: "activo" },
  { id: 3, nombre: "Farmacia Bienestar", estado: "inactivo" },
  { id: 4, nombre: "Librería El Saber", estado: "activo" },
];

export const handlers = [
  // Handler for login
  http.post('/api/auth/login', async ({ request }) => {
    const { email } = await request.json() as { email: string };

    if (email === 'error@test.com') {
      return HttpResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
    }

    return HttpResponse.json({
      token: 'fake-jwt-token-12345',
      user: {
        id: 'user-1',
        nombre: 'Juan Pérez',
        email: email,
        firstLogin: email === 'first@test.com',
      },
    });
  }),

  // Handler for getting comercios
  http.get('/api/comercios', () => {
    return HttpResponse.json(allComercios);
  }),
  
  // Handler for forgot password
  http.post('/api/auth/forgot-password', () => {
    return HttpResponse.json({ success: true, message: 'Se ha enviado un correo de recuperación.' });
  }),
  
  // Handler for change first password
  http.post('/api/auth/change-password', () => {
    return HttpResponse.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  }),

  http.post('/api/parkings/checkout', async ({ request }) => {
    const { patente } = await request.json() as { patente: string };

    if (patente.toUpperCase() === 'ERROR') {
      return HttpResponse.json({ message: 'Patente no encontrada' }, { status: 400 });
    }

    return HttpResponse.json({
      patente,
      ingreso: '2024-05-20T14:30:00Z',
      salida: '2024-05-20T15:30:00Z',
      total: 10,
    });
  }),
];