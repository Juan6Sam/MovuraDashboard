
import React from 'react';
import { useParkings } from '../../hooks/useParkings';
import { useAuth } from '../../hooks/useAuth';

const ConsultaDeOcupacion: React.FC = () => {
  const { parkings, isLoading, error } = useParkings();
  const { logout } = useAuth();

  if (isLoading) return <div className="p-4">Cargando parkings...</div>;
  if (error) return <div className="p-4 text-red-500">Error al cargar los datos.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lista de Parkings</h2>
        <button 
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cerrar Sesión
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {parkings.map((parking) => (
          <li key={parking.id} className="py-4">
            <p className="text-lg font-semibold">{parking.nombre}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultaDeOcupacion;
