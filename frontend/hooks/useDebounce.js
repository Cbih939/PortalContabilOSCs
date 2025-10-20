// src/hooks/useDebounce.js

import { useState, useEffect } from 'react';

/**
 * Hook customizado que aplica "debounce" a um valor.
 *
 * Ele atrasa a atualização de um valor até que um tempo
 * específico (delay) tenha passado desde a última vez
 * que o valor foi alterado.
 *
 * @param {*} value O valor que você quer "atrasar" (ex: o texto de um input).
 * @param {number} delay O tempo em milissegundos a esperar (ex: 500ms).
 * @returns {*} O valor "atrasado" (debounced value).
 */
export default function useDebounce(value, delay) {
  // Estado interno para armazenar o valor "atrasado"
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // 1. Inicia um timer (timeout) sempre que o 'value' ou 'delay' mudar
      const handler = setTimeout(() => {
        // 2. Após o 'delay', atualiza o estado interno com o novo 'value'
        setDebouncedValue(value);
      }, delay);

      // 3. Função de limpeza (Cleanup)
      //    Se o 'value' mudar (usuário digitou de novo) ANTES do 'delay'
      //    terminar, este 'return' é chamado, cancelando o timer anterior.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Dependências: re-executa o efeito se o 'value' ou 'delay' mudar
  );

  // Retorna o último valor que "sobreviveu" ao delay
  return debouncedValue;
}

/**
 * --- Como Usar (em um componente de busca) ---
 *
 * import React, { useState, useEffect } from 'react';
 * import useDebounce from '../../hooks/useDebounce';
 * import Input from '../../components/common/Input';
 *
 * function OSCFilterComponent() {
 * // 1. Estado do input (atualiza a cada tecla)
 * const [searchTerm, setSearchTerm] = useState('');
 *
 * // 2. Estado "atrasado" (só atualiza 500ms após o usuário parar de digitar)
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * // 3. Efeito que busca na API
 * useEffect(() => {
 * // Só executa se 'debouncedSearchTerm' tiver valor
 * if (debouncedSearchTerm) {
 * console.log('Fazendo busca na API por:', debouncedSearchTerm);
 * // fetchApi(`/oscs?search=${debouncedSearchTerm}`);
 * } else {
 * console.log('Limpando busca.');
 * // fetchApi('/oscs'); // Busca todos
 * }
 *
 * // Este efeito só roda quando o valor "atrasado" muda
 * }, [debouncedSearchTerm]);
 *
 * return (
 * <Input
 * type="text"
 * placeholder="Buscar OSC..."
 * // O input controla o 'searchTerm' (o valor rápido)
 * onChange={(e) => setSearchTerm(e.target.value)}
 * value={searchTerm}
 * />
 * );
 * }
 */