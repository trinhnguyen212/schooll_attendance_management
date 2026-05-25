import appStyles from '~styles/App.module.css';
import styles from '../styles/ChangePassword.module.css';

import { useRef, useState } from 'react';
import { RxCross2, RxEyeOpen, RxEyeClosed } from 'react-icons/rx';
import { useNavigate } from 'react-router';
import { apiChangePassword } from '~api/auth';
import useLanguage from '~hooks/useLanguage';
import css from '~utils/css';

type ChangePasswordProps = {
    setShowPopup: React.Dispatch<React.SetStateAction<boolean>>;
};

type PasswordField = 'current_password' | 'password' | 'password_confirmation';

export default function ChangePassword({ setShowPopup }: ChangePasswordProps) {
    const language = useLanguage('component.change_password');
    const [blockSubmit, setBlockSubmit] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordVisibility, setPasswordVisibility] = useState<Record<PasswordField, boolean>>({
        current_password: false,
        password: false,
        password_confirmation: false,
    });

    // State for password validation
    const [passwordStrength, setPasswordStrength] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();

    const handleClosePopUp = () => {
        setShowPopup(false);
    };

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
        let error = null;
    
        if (!hasUpperCase) {
            error = 'Password must contain at least one uppercase letter.';
        } else if (!hasLowerCase) {
            error = 'Password must contain at least one lowercase letter.';
        } else if (!hasNumber) {
            error = 'Password must contain at least one number.';
        } else if (!hasSpecialChar) {
            error = 'Password must contain at least one special character.';
        } else if (password.length < minLength) {
            error = `Password must be at least ${minLength} characters.`;
        }
    
        setPasswordError(error);
    
        // Only calculate strength if password has no error
        if (!error && password.length >= 12) {
            setPasswordStrength('Strong');
        } else if (!error && password.length >= 8) {
            setPasswordStrength('Medium');
        } else {
            setPasswordStrength('Weak');
        }
    };
    
    
    const handlePreventSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        for (const pair of formData.entries()) {
            const value = pair[1] as string;
            if (!value.trim()) {
                return setBlockSubmit(true);
            }
        }
        setBlockSubmit(false);
    };

    const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (blockSubmit || passwordError) return;
        
        setBlockSubmit(true);
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        buttonRef.current?.classList.add(styles.submitting);
        
        apiChangePassword(formData)
            .then(() => navigate(0))
            .catch(() => {
                setBlockSubmit(false);
                setIsSubmitting(false);
            })
            .finally(() => {
                buttonRef.current?.classList.remove(styles.submitting);
            });
    };

    const togglePasswordVisibility = (field: PasswordField) => {
        setPasswordVisibility((prevState) => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };

    return (
        <div className={css(styles.changePasswordContainer)}>
            <div className={css(styles.changePasswordForm)}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{language?.title}</h2>
                    <div className={styles.escButton} onClick={handleClosePopUp}>
                        <RxCross2 />
                    </div>
                </div>
                <form
                    onSubmit={handleChangePassword}
                    onInput={handlePreventSubmit}
                    className={styles.formData}
                >
                    <div className={styles.groupInputs}>
                        {[
                            { name: 'current_password', label: language?.password },
                            { name: 'password', label: language?.newPassword },
                            { name: 'password_confirmation', label: language?.confirmPassword },
                        ].map((input) => (
                            <div key={input.name} className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor={input.name}>
                                    {input.label}
                                </label>
                                <div className={styles.passwordInputContainer}>
                                    <input
                                        id={input.name}
                                        name={input.name}
                                        className={css(appStyles.input, styles.inputItem)}
                                        type={passwordVisibility[input.name as PasswordField] ? 'text' : 'password'}
                                        onChange={(e) => {
                                            if (input.name === 'password') {
                                                validatePassword(e.target.value);
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className={styles.showPasswordButton}
                                        onClick={() => togglePasswordVisibility(input.name as PasswordField)}
                                    >
                                        {passwordVisibility[input.name as PasswordField] ? <RxEyeOpen /> : <RxEyeClosed />}
                                    </button>
                                </div>

                                {/* Password Validation Messages */}
                                {input.name === 'password' && (
                                    <>
                                        {passwordError && <p className={styles.errorMessage}>{passwordError}</p>}
                                        {passwordStrength && (
                                            <p
                                                className={
                                                    passwordStrength === 'Strong'
                                                        ? styles.passwordStrengthStrong
                                                        : passwordStrength === 'Medium'
                                                        ? styles.passwordStrength
                                                        : styles.passwordStrengthWeak
                                                }
                                            >
                                                Password Strength: {passwordStrength}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                        <div className={styles.wrapItem}>
                            <button
                                ref={buttonRef}
                                className={css(
                                    appStyles.actionItem,
                                    styles.submit,
                                    (blockSubmit || passwordError) &&
                                        !buttonRef.current?.classList.contains(styles.submitting)
                                        ? styles.blocking
                                        : ''
                                )}
                                disabled={blockSubmit || !!passwordError}
                            >
                                {!isSubmitting && language?.title}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
