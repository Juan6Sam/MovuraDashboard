import { rest, HttpResponse } from 'msw';

const allComercios = [
  { id: 1, nombre: "Tienda de Abarrotes de Ana", estado: "activo" },
  { id: 2, nombre: "Supermercado La Confianza", estado: "activo" },
  { id: 3, nombre: "Farmacia Bienestar", estado: "inactivo" },
  { id: 4, nombre: "Librería El Saber", estado: "activo" },
];

export const handlers = [
  // Handler for login
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email } = await req.json() as { email: string };

    if (email === 'error@test.com') {
      return res(ctx.status(401), ctx.json({ message: 'Credenciales inválidas' }));
    }

    return res(ctx.json({
      token: 'fake-jwt-token-12345',
      user: {
        id: 'user-1',
        nombre: 'Juan Pérez',
        email: email,
        firstLogin: email === 'first@test.com',
      },
    }));
  }),

  // Handler for getting comercios
  rest.get('/api/comercios', (req, res, ctx) => {
    return res(ctx.json(allComercios));
  }),
  
  // Handler for forgot password
  rest.post('/api/auth/forgot-password', (req, res, ctx) => {
    return res(ctx.json({ success: true, message: 'Se ha enviado un correo de recuperación.' }));
  }),
  
  // Handler for change first password
  rest.post('/api/auth/change-password', (req, res, ctx) => {
    return res(ctx.json({ success: true, message: 'Contraseña actualizada correctamente.' }));
  }),

  rest.post('/api/parkings/checkout', async (req, res, ctx) => {
    const { patente } = await req.json() as { patente: string };

    if (patente.toUpperCase() === 'ERROR') {
      return res(ctx.status(400), ctx.json({ message: 'Patente no encontrada' }));
    }

    return res(ctx.json({
      patente,
      ingreso: '2024-05-20T14:30:00Z',
      salida: '2024-05-20T15:30:00Z',
      total: 10,
    }));
  }),
];