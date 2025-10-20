// src/pages/contador/components/NoticesView.js

import React, { useState } from 'react';
import { clsx } from 'clsx';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Spinner from '../../../components/common/Spinner';
import { SendIcon } from '../../../components/common/Icons';

/**
 * Componente de Apresentação para o Canal de Avisos.
 *
 * Contém o formulário de envio e o histórico.
 * Gerencia o estado do formulário, mas delega a ação de
 * envio e os dados (histórico, lista de OSCs) ao componente pai.
 *
 * Props:
 * - oscs (array): Lista de OSCs para popular o dropdown (ex: [{ id, name }]).
 * - sentNotices (array): Lista de avisos já enviados (para o histórico).
 * - onSendNotice (function): Função chamada com (data) ao submeter o formulário.
 * - isLoading (boolean): Indica se o envio está em progresso (mostra spinner).
 */
export default function NoticesView({
  oscs,
  sentNotices,
  onSendNotice,
  isLoading,
}) {
  // --- Estado Interno do Formulário ---
  const [selectedOsc, setSelectedOsc] = useState('all'); // 'all' ou o ID da OSC
  const [noticeType, setNoticeType] = useState('Informativo');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  // --- Handlers ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação simples
    if (!noticeTitle || !noticeMessage) {
      alert('Por favor, preencha o título e a mensagem.'); // No futuro, use o 'useNotification'
      return;
    }

    if (isLoading) return; // Previne duplo clique

    // Chama a função do pai com os dados do formulário
    onSendNotice({
      oscId: selectedOsc === 'all' ? null : parseInt(selectedOsc),
      type: noticeType,
      title: noticeTitle,
      message: noticeMessage,
    });

    // Limpa o formulário após o envio
    // A página pai cuidará de exibir a notificação de sucesso/erro
    setNoticeTitle('');
    setNoticeMessage('');
  };

  // Helper para definir a cor da borda do histórico
  const getBorderColor = (type) => {
    switch (type) {
      case 'Urgente':
        return 'border-red-500';
      case 'Lembrete':
        return 'border-yellow-500';
      case 'Informativo':
      default:
        return 'border-blue-500';
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Canal de Avisos</h2>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* --- Coluna do Formulário --- */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">
              Enviar Novo Aviso
            </h3>

            {/* Dropdown: Enviar para */}
            <div>
              <label
                htmlFor="osc-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enviar para:
              </label>
              <select
                id="osc-select"
                value={selectedOsc}
                onChange={(e) => setSelectedOsc(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas as OSCs</option>
                {oscs.map((osc) => (
                  <option key={osc.id} value={osc.id}>
                    {osc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown: Tipo de Aviso */}
            <div>
              <label
                htmlFor="type-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de Aviso:
              </label>
              <select
                id="type-select"
                value={noticeType}
                onChange={(e) => setNoticeType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Informativo</option>
                <option>Lembrete</option>
                <option>Urgente</option>
              </select>
            </div>

            {/* Input: Título */}
            <Input
              label="Título:"
              id="notice-title"
              type="text"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              required
            />

            {/* Textarea: Mensagem */}
            <div>
              <label
                htmlFor="notice-message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mensagem:
              </label>
              <textarea
                id="notice-message"
                rows="5"
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            {/* Botão de Envio */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <SendIcon className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Enviando...' : 'Enviar Aviso'}
            </Button>
          </form>
        </div>

        {/* --- Coluna do Histórico --- */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
              Histórico de Envios
            </h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {sentNotices.length > 0 ? (
                sentNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className={clsx(
                      'p-4 rounded-md bg-gray-50 border-l-4',
                      getBorderColor(
                        notice.type || // Usa o 'type' se existir
                          (notice.title.includes('Urgente')
                            ? 'Urgente'
                            : 'Informativo') // Fallback do seu mock
                      )
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-800">{notice.title}</p>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(notice.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notice.message}
                    </p>
                    <p className="text-xs text-right font-semibold text-gray-500 mt-2">
                      Para: {notice.oscName}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 pt-8">
                  Nenhum aviso enviado ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}