import React from 'react';
import styles from './Header.module.css';

export default function Header({ leftContent, rightContent }) {
  return (
    <header className={styles.header}>
      <div className={styles.leftContainer}>{leftContent}</div>
      <div className={styles.rightContainer}>{rightContent}</div>
    </header>
  );
}