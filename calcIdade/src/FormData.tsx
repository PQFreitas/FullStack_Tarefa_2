import { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  dataNascimento: string;
};

const FormularioDataNascimento = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const [idadeCalculada, setIdadeCalculada] = useState<number | null>(null);

  // Função para calcular idade a partir da data de nascimento
  const calcularIdade = (dataNasc: string): number => {
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    
    let ano = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    
    const mesNasc = nascimento.getMonth();
    const diaNasc = nascimento.getDate();
    
    // Ajusta a idade se ainda não fez aniversário este ano
    if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
      ano--;
    }
    
    return ano;
  };

  const onSubmit = (data: FormData) => {
    const idade = calcularIdade(data.dataNascimento);
    setIdadeCalculada(idade);
    console.log('Dados do formulário:', data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Formulário de Nascimento
        </h1>
        <p className="text-gray-600 text-center mb-6">Informe sua data de nascimento</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo de Data de Nascimento */}
          <div>
            <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento:
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
          </div>

          {/* Botão de Enviar */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105"
            >
              Calcular Idade
            </button>
          </div>
        </form>

        {/* Exibição da idade calculada */}
        {idadeCalculada !== null && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 text-center mb-2">
              Idade Calculada
            </h3>
            <p className="text-4xl font-bold text-blue-900 text-center">
              {idadeCalculada} anos
            </p>
            <p className="text-sm text-blue-700 text-center mt-2">
              Data de nascimento: {new Date(idadeCalculada ? watch('dataNascimento') : '').toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Informações:
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Formato: DD/MM/AAAA</li>
            <li>• Data deve ser anterior à data atual</li>
            <li>• Campo obrigatório</li>
            <li>• Clique em "Calcular Idade" para ver seu resultado</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormularioDataNascimento;