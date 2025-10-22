// src/components/common/Spinner.jsx
import React from 'react';
export default function Spinner({ fullscreen, text }) {
  if (fullscreen) return <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>{text || 'Carregando...'}</div>;
  return <span>{text || 'Carregando...'}</span>;
}