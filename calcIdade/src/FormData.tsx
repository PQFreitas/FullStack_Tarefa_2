import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

type FormData = {
  dataNascimento: string;
};

type IdadeDetalhada = {
  anos: number;
  meses: number;
  dias: number;
};

// Hook personalizado useLocalStorage
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
};

// Função para criar data sem problemas de fuso horário
const criarDataLocal = (ano: number, mes: number, dia: number): Date => {
  return new Date(ano, mes, dia);
};

// Função para converter string YYYY-MM-DD para data local
const stringParaDataLocal = (dataString: string): Date => {
  const [ano, mes, dia] = dataString.split('-').map(Number);
  return criarDataLocal(ano, mes - 1, dia);
};

const FormularioDataNascimento = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  const [idadeCalculada, setIdadeCalculada] = useState<IdadeDetalhada | null>(null);
  
  // Usando o hook useLocalStorage para persistir os dados
  const [savedData, setSavedData] = useLocalStorage('formData', {
    dataNascimento: '',
    idadeCalculada: null as IdadeDetalhada | null
  });

  // useRef para focar no input automaticamente
  const inputRef = useRef<HTMLInputElement>(null);

  // Efeito para carregar dados salvos e focar no input
  useEffect(() => {
    if (savedData.dataNascimento) {
      setValue('dataNascimento', savedData.dataNascimento);
    }
    if (savedData.idadeCalculada !== null) {
      setIdadeCalculada(savedData.idadeCalculada);
    }

    // Focar no input quando o componente montar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [savedData, setValue]);

  // Função para calcular idade detalhada
  const calcularIdadeDetalhada = (dataNascString: string): IdadeDetalhada => {
    const hoje = new Date();
    const dataNasc = stringParaDataLocal(dataNascString);
    
    const hojeLocal = criarDataLocal(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const nascimentoLocal = criarDataLocal(dataNasc.getFullYear(), dataNasc.getMonth(), dataNasc.getDate());
    
    let anos = hojeLocal.getFullYear() - nascimentoLocal.getFullYear();
    let meses = hojeLocal.getMonth() - nascimentoLocal.getMonth();
    let dias = hojeLocal.getDate() - nascimentoLocal.getDate();
    
    if (dias < 0) {
      const ultimoDiaMesAnterior = new Date(hojeLocal.getFullYear(), hojeLocal.getMonth(), 0).getDate();
      dias = ultimoDiaMesAnterior - nascimentoLocal.getDate() + hojeLocal.getDate();
      meses--;
    }
    
    if (meses < 0) {
      meses += 12;
      anos--;
    }
    
    return { anos, meses, dias };
  };

  // Função de validação
  const validarDataNascimento = (value: string): true | string => {
    if (!value) return 'A data de nascimento é obrigatória';
    
    const data = stringParaDataLocal(value);
    const hoje = new Date();
    const hojeLocal = criarDataLocal(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    if (data > hojeLocal) {
      return 'A data de nascimento não pode ser no futuro';
    }
    
    return true;
  };

  const onSubmit = (data: FormData) => {
    const idade = calcularIdadeDetalhada(data.dataNascimento);
    setIdadeCalculada(idade);
    
    // Salvar dados no localStorage
    setSavedData({
      dataNascimento: data.dataNascimento,
      idadeCalculada: idade
    });
  };

  // Formatar data para exibição
  const formatarDataExibicao = (dataString: string): string => {
    const data = stringParaDataLocal(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Cabeçalho do formulário */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center justify-center mb-3">
                <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 flex flex-col items-center">
                <img src="src/assets/calendar.svg" alt="Calendário" className="w-12 h-12 mb-1" />
                Calculadora de Idade
                </h1>
            </div>
          </div>
          <p className="text-blue-100 text-center text-sm md:text-base">
            Descubra sua idade exata em anos, meses e dias
          </p>
        </div>

        {/* Corpo do formulário */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo de Data de Nascimento */}
            <div className="space-y-2">
              <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-1">
                Data de Nascimento:
              </label>
              <div className="relative">
                <input
                  id="dataNascimento"
                  type="date"
                  {...register('dataNascimento', {
                    required: 'A data de nascimento é obrigatória',
                    validate: {
                      dataValida: validarDataNascimento
                    }
                  })}
                  ref={(e) => {
                    register('dataNascimento').ref(e);
                    inputRef.current = e;
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors pl-10 ${
                    errors.dataNascimento
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                  }`}
                  autoFocus
                />
              </div>
              
              {errors.dataNascimento && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  {errors.dataNascimento.message}
                </p>
              )}
            </div>

            {/* Botão de Enviar */}
            <div className="pt-6">
              <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              >
              Calcular Minha Idade
              </button>
            </div>
          </form>

          {/* Exibição da idade calculada */}
          {idadeCalculada !== null && (
            <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 text-center mb-3">
                Sua Idade Exata
              </h3>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-green-100">
                  <div className="text-2xl md:text-3xl font-bold text-green-900">{idadeCalculada.anos}</div>
                  <div className="text-xs md:text-sm text-green-700 mt-1">anos</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-green-100">
                  <div className="text-2xl md:text-3xl font-bold text-green-900">{idadeCalculada.meses}</div>
                  <div className="text-xs md:text-sm text-green-700 mt-1">meses</div>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm text-center border border-green-100">
                  <div className="text-2xl md:text-3xl font-bold text-green-900">{idadeCalculada.dias}</div>
                  <div className="text-xs md:text-sm text-green-700 mt-1">dias</div>
                </div>
              </div>
              
              <p className="text-sm text-green-700 text-center bg-white/50 py-2 rounded-lg">
                Data de nascimento: {formatarDataExibicao(watch('dataNascimento'))}
              </p>
            </div>
          )}

          {/* Informações adicionais */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <img src="src/assets/info.svg" alt="Informações" className="w-4 h-4 mr-2" />
              Informações importantes:
            </h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li className="flex items-start">
                Formato: DD/MM/AAAA
              </li>
              <li className="flex items-start">
                Data deve ser anterior à data atual
              </li>
              <li className="flex items-start">
                Campo obrigatório para cálculo
              </li>
              <li className="flex items-start">
                Seus dados são salvos localmente
              </li>
            </ul>
          </div>

          {/* Botão para limpar dados salvos */}
          {savedData.dataNascimento && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  localStorage.removeItem('formData');
                  setValue('dataNascimento', '');
                  setIdadeCalculada(null);
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 underline flex items-center justify-center mx-auto"
              >
                <img src="src/assets/delete.svg" alt="Informações" className="w-4 h-4 mr-2" />
                Limpar todos os dados salvos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormularioDataNascimento;