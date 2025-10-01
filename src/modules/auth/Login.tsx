
import React from 'react';
import { Link } from 'react-router-dom'; // Importar Link
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { PrimaryButton } from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';

const Login: React.FC = () => {
  const { login } = useAuth();
  const { values, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    async (formValues) => {
      try {
        await login(formValues);
      } catch (error) {
        console.error('Error de login:', error);
        alert('Credenciales incorrectas');
      }
    }
  );

  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInput
            label="Email"
            type="email"
            value={values.email}
            onChange={(value: string) => handleChange({ target: { name: 'email', value } })}
            placeholder="tu@email.com"
            required
          />
          <TextInput
            label="Contraseña"
            type="password"
            value={values.password}
            onChange={(value: string) => handleChange({ target: { name: 'password', value } })}
            placeholder="Tu contraseña"
            required
          />
          <PrimaryButton type="submit" className="w-full">
            Entrar
          </PrimaryButton>
        </form>
        <div className="text-sm text-center">
          <Link to="/forgot-password" className="font-medium text-sky-600 hover:text-sky-500">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
