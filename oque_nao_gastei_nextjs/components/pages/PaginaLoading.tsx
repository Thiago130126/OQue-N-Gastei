import styles from './PaginaLoading.module.css';

export default function PaginaLoading() {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.spinnerContainer}>
        <div className={styles.ringOuter} />
        <div className={styles.ringInner} />
        <div className={styles.glow} />
      </div>
      <p className={styles.text}>Sincronizando seus dados financeiros...</p>
    </div>
  );
}
