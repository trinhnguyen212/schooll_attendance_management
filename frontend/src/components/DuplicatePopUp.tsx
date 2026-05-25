import styles from './styles/ErrorPopUp.module.css';
import { RxCross2 } from 'react-icons/rx';
import { IoMdAlert } from 'react-icons/io';

type DuplicatePopUpProps = {
  duplicates: {
    emails: string[];
    phones: string[];
  };
  setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DuplicatePopUp({ duplicates, setShowPopUp }: DuplicatePopUpProps) {
  const { emails = [], phones = [] } = duplicates;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.closeBtn} onClick={() => setShowPopUp(false)}>
          <RxCross2 />
        </div>
        <div className={styles.content}>
          <IoMdAlert className={styles.icon} />
          <div className={styles.message}>
            <h3>Duplicate Entries Found:</h3>
            {emails.length > 0 && (
              <div>
                <strong>Emails:</strong>
                <ul>{emails.map((email, i) => <li key={i}>{email}</li>)}</ul>
              </div>
            )}
            {phones.length > 0 && (
              <div>
                <strong>Phones:</strong>
                <ul>{phones.map((phone, i) => <li key={i}>{phone}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
