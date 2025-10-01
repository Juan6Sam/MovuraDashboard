
import { useState, ChangeEvent, FormEvent } from 'react';

export const useForm = <T extends object>(
  initialState: T,
  onSubmit: (values: T) => void
) => {
  const [values, setValues] = useState<T>(initialState);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(values);
  };

  return {
    values,
    handleChange,
    handleSubmit,
  };
};
