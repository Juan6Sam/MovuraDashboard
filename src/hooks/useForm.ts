import { useState, useCallback } from 'react';

// Hook genérico para manejar el estado de formularios, incluyendo validación básica.

// T es el tipo del objeto del formulario (p. ej., { campo1: string, campo2: number })
type Validator<T> = (form: T) => Partial<Record<keyof T, boolean>>;

export function useForm<T>(initialState: T, validator?: Validator<T>) {
  // Estado para almacenar los valores del formulario
  const [form, setForm] = useState<T>(initialState);

  // Estado para almacenar el resultado de la validación
  const [validation, setValidation] = useState<Partial<Record<keyof T, boolean>>>(() => {
    return validator ? validator(initialState) : {};
  });

  // Función para actualizar un campo del formulario.
  // Usamos useCallback para que esta función no se recree en cada render.
  const update = useCallback((field: keyof T, value: any) => {
    setForm(prevForm => {
      const newForm = { ...prevForm, [field]: value };

      // Si hay una función de validación, la ejecutamos con el nuevo estado
      if (validator) {
        setValidation(validator(newForm));
      }

      return newForm;
    });
  }, [validator]);

  // Función para reemplazar todo el estado del formulario de golpe.
  // Útil para resetear el formulario o cargarlo con datos de una API.
  const setFormData = useCallback((newData: T) => {
    setForm(newData);
    if (validator) {
      setValidation(validator(newData));
    }
  }, [validator]);

  return {
    form,       // El estado actual del formulario
    setForm: setFormData, // Función para setear todo el formulario
    update,     // Función para actualizar un campo específico
    v: validation // El objeto con los resultados de la validación
  };
}
