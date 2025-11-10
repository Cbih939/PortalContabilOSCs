// src/components/layout/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        Copyright 2025. Conta Comigo App. Todos os direitos reservados.
      </p>
      <p>
        Desenvolvido por <a href="https://baygroups.com.br" className={styles.link} target="_blank" rel="noopener noreferrer">
          Agência Bay Groups
        </a>
      </p>
      <p className={styles.version}>
        Versão: 1.0.1
      </p>
    </footer>
  );
}