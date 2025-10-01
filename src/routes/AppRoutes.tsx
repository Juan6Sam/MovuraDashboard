
import { Routes, Route } from 'react-router-dom';
import Login from '../modules/auth/Login';
import ForgotPassword from '../modules/auth/ForgotPassword'; // Importar ForgotPassword
import ConsultaDeOcupacion from '../modules/ocupacion/ConsultaDeOcupacion';
import ProtectedLayout from './ProtectedLayout';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Añadir ruta para forgot-password */}
      <Route path="/" element={<ProtectedLayout />}>
        <Route path="/parkings" element={<ConsultaDeOcupacion />} />
        {/* Aquí se pueden añadir más rutas protegidas */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
