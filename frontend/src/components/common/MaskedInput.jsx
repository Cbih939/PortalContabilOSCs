// src/components/common/MaskedInput.jsx
import React from 'react';
import InputMask from 'react-input-mask';
import Input from './Input.jsx'; // Importa o nosso Input base

/**
 * Componente que combina o nosso Input.jsx com o react-input-mask.
 */
const MaskedInput = ({ mask, maskPlaceholder = null, ...props }) => {
  // O InputMask precisa de receber o componente <input> diretamente
  // Vamos passar as props do nosso <Input> (label, error, etc.) para ele
  // Esta abordagem é complexa porque o Input.jsx é um wrapper.

  // Abordagem Mais Simples: Replicar o estilo do Input.jsx
  // (Vamos usar esta por enquanto para evitar complexidade)

  const { label, id, name, icon: IconComponent, error, className = '', inputClassName = '' } = props;

  // Importa estilos do Input.module.css para reutilizar
  // NOTA: Isto pode ser frágil se o Input.module.css mudar.
  // A melhor solução seria refatorar Input.jsx para ser mais componível.
  const styles = {
      container: 'input-module-container', // Placeholder - idealmente importar
      label: 'input-module-label',
      inputBase: 'input-module-inputBase',
      inputDefault: 'input-module-inputDefault',
      inputError: 'input-module-inputError',
      inputWithIcon: 'input-module-inputWithIcon',
      iconContainer: 'input-module-iconContainer',
      icon: 'input-module-icon',
      errorMessage: 'input-module-errorMessage'
  };
  // Como não podemos importar o .module.css aqui facilmente, vamos
  // apenas focar na funcionalidade da máscara por agora.

  return (
    <InputMask
      mask={mask}
      maskPlaceholder={maskPlaceholder}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      disabled={props.disabled}
    >
      {/* O InputMask passa as props (como onChange, value) para o filho.
        O filho DEVE ser um <input> ou um componente que passa
        as props diretamente para um <input>. O nosso Input.jsx é um wrapper.
        Vamos usar o Input.jsx, mas isto pode não funcionar como esperado
        dependendo da versão do react-input-mask.
      */}
      {(inputProps) => (
        <Input
          {...props} // Passa label, error, etc.
          {...inputProps} // Passa value, onChange, onBlur da máscara
          type={props.type || 'text'} // Garante que o tipo é passado
        />
      )}
    </InputMask>
  );
};

export default MaskedInput;