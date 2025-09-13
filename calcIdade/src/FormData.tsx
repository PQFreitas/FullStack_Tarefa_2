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
  return criarDataLocal(ano, mes - 1, dia); // mês é 0-indexed no JavaScript
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

  // Função para calcular idade detalhada CORRIGIDA
  const calcularIdadeDetalhada = (dataNascString: string): IdadeDetalhada => {
    const hoje = new Date();
    const dataNasc = stringParaDataLocal(dataNascString);
    
    // Criar datas locais sem hora para cálculo preciso
    const hojeLocal = criarDataLocal(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const nascimentoLocal = criarDataLocal(dataNasc.getFullYear(), dataNasc.getMonth(), dataNasc.getDate());
    
    let anos = hojeLocal.getFullYear() - nascimentoLocal.getFullYear();
    let meses = hojeLocal.getMonth() - nascimentoLocal.getMonth();
    let dias = hojeLocal.getDate() - nascimentoLocal.getDate();
    
    // Ajustar se o dia atual é anterior ao dia de nascimento
    if (dias < 0) {
      // Obter o último dia do mês anterior
      const ultimoDiaMesAnterior = new Date(hojeLocal.getFullYear(), hojeLocal.getMonth(), 0).getDate();
      dias = ultimoDiaMesAnterior - nascimentoLocal.getDate() + hojeLocal.getDate();
      meses--;
    }
    
    // Ajustar se o mês atual é anterior ao mês de nascimento
    if (meses < 0) {
      meses += 12;
      anos--;
    }
    
    return { anos, meses, dias };
  };

  // Função de validação corrigida
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

  // Formatar data para exibição sem problemas de fuso horário
  const formatarDataExibicao = (dataString: string): string => {
    const data = stringParaDataLocal(dataString);
    return data.toLocaleDateString('pt-BR');
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
              Data de Nascimento:
            </label>
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
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                errors.dataNascimento
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
              }`}
              autoFocus
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
            <p className="text-2xl font-bold text-blue-900 text-center">
              {idadeCalculada.anos} anos, {idadeCalculada.meses} meses e {idadeCalculada.dias} dias
            </p>
            <p className="text-sm text-blue-700 text-center mt-2">
              Data de nascimento: {formatarDataExibicao(watch('dataNascimento'))}
            </p>
            <p className="text-xs text-blue-600 text-center mt-2">
              ✓ Dados salvos localmente
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
            <li>• Seus dados são salvos localmente no navegador</li>
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
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Limpar dados salvos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormularioDataNascimento;