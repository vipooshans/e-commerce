import styles from './Loader.module.css';

const Loader = ({ fullScreen = false, size = 40 }) => {
  return (
    <div className={`${styles.wrapper} ${fullScreen ? styles.fullScreen : ''}`}>
      <div
        className={styles.spinner}
        style={{ width: size, height: size }}
        aria-label="Loading"
      />
    </div>
  );
};

export default Loader;
