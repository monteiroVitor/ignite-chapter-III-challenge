import Link from 'next/link';
import styles from './styles.module.scss';

export default function ExitPreview() {
  return (
    <button type="button" className={styles.customButton}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </button>
  );
}
