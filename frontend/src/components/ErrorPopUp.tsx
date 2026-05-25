import appStyles from '~styles/App.module.css';
import styles from './styles/ErrorPopUp.module.css';

import { useMutation } from '@tanstack/react-query';
import { RxCross2 } from 'react-icons/rx';
import css from '~utils/css';
import Loading from './Loading';
import { IoMdAlert } from 'react-icons/io';

type ErrorPopUpProps = {
  message: string;
  setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ErrorPopUp({ message, setShowPopUp }: ErrorPopUpProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.closeBtn} onClick={() => setShowPopUp(false)}>
          <RxCross2 />
        </div>
        <div className={styles.content}>
          <IoMdAlert className={styles.icon} />
          <div className={styles.message}>{message}</div>
        </div>
      </div>
    </div>
  );
}
