import { useForm } from 'react-hook-form';

type FormData = {
  dataNascimento: string;
};

const FormularioDataNascimento = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>();

  const dataNascimento = watch('dataNascimento');

  const onSubmit = (data: FormData) => {
    console.log('Dados do formulário:', data);
    alert(`Data de nascimento enviada: ${data.dataNascimento}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Calculadora de Idade
        </h1>
        <p className="text-gray-600 text-center mb-6">Informe sua data de nascimento</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo de Data de Nascimento */}
          <div>
            <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento *
            </label>
            <input
              id="dataNascimento"
              type="date"
              {...register('dataNascimento', {
                required: 'A data de nascimento é obrigatória',
                validate: {
                  dataValida: (value) => {
                    const data = new Date(value);
                    const hoje = new Date();
                    
                    if (isNaN(data.getTime())) {
                      return 'Data inválida';
                    }
                    
                    if (data > hoje) {
                      return 'A data de nascimento não pode ser no futuro';
                    }
                    
                    return true;
                  }
                }
              })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                errors.dataNascimento
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
            />
            
            {errors.dataNascimento && (
              <p className="mt-2 text-sm text-red-600">
                {errors.dataNascimento.message}
              </p>
            )}
            
            {/* Preview em tempo real */}
            {dataNascimento && !errors.dataNascimento && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-1 w-1 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Data informada: {new Date(dataNascimento).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          {/* Botão de Enviar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!!errors.dataNascimento}
              className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                errors.dataNascimento
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-105'
              }`}
            >
              Enviar Data de Nascimento
            </button>
          </div>
        </form>

        {/* Informações adicionais */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Informações:
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Formato: DD/MM/AAAA</li>
            <li>• Data deve ser anterior à data atual</li>
            <li>• Campo obrigatório</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormularioDataNascimento;