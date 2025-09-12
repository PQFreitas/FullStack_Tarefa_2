// import React from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  idade: number;
};

const FormularioIdade = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>();

  const idade = watch('idade'); // Observa o campo idade em tempo real

  const onSubmit = (data: FormData) => {
    console.log('Dados do formulário:', data);
    alert(`Idade enviada: ${data.idade} anos`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Formulário de Idade
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo de Idade */}
          <div>
            <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-2">
              Idade *
            </label>
            <input
              id="idade"
              type="number"
              {...register('idade', {
                required: 'A idade é obrigatória',
                min: {
                  value: 0,
                  message: 'A idade não pode ser negativa'
                },
                max: {
                  value: 150,
                  message: 'Idade máxima permitida é 150 anos'
                },
                pattern: {
                  value: /^[0-9]+$/,
                  message: 'Digite apenas números'
                }
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                errors.idade
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              placeholder="Digite sua idade"
            />
            
            {errors.idade && (
              <p className="mt-1 text-sm text-red-600">{errors.idade.message}</p>
            )}
            
            {/* Preview em tempo real */}
            {idade && !errors.idade && (
              <p className="mt-2 text-sm text-green-600">
                ✅ Idade informada: {idade} anos
              </p>
            )}
          </div>

          {/* Botão de Enviar */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Enviar Idade
            </button>
          </div>
        </form>

        {/* Informações adicionais */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Informações:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Idade deve ser um número entre 0 e 150</li>
            <li>• Apenas números são permitidos</li>
            <li>• Campo obrigatório</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormularioIdade;