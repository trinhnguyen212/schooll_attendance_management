import appStyles from '~styles/App.module.css';
import styles from '~styles/CreateModel.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SyntheticEvent, useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { RxCross2 } from 'react-icons/rx';
import { apiCreateBranch } from '~api/branch';
import { apiAutoCompleteUser } from '~api/user';
import CustomDataList from '~components/CustomDataList';
import Loading from '~components/Loading';
import { AUTO_COMPLETE_DEBOUNCE } from '~config/env';
import QUERY_KEYS from '~constants/query-keys';
import useDebounce from '~hooks/useDebounce';
import useLanguage from '~hooks/useLanguage';
import createFormUtils from '~utils/createFormUtils';
import css from '~utils/css';
import languageUtils from '~utils/languageUtils';

type CreateBranchProps = {
    onMutateSuccess: () => void;
    setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CreateBranch({
    onMutateSuccess,
    setShowPopUp
}: CreateBranchProps) {
    const language = useLanguage('component.create_branch');
    const [queryUser, setQueryUser] = useState('');
    const [shortcode, setShortcode] = useState('');
    const debounceQueryUser = useDebounce(queryUser, AUTO_COMPLETE_DEBOUNCE);
    const queryClient = useQueryClient();
    const handleClosePopUp = () => {
        setShowPopUp(false);
    };
    const formUtils = createFormUtils(styles);
    const userQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_USER, { search: debounceQueryUser }],
        queryFn: () => apiAutoCompleteUser('teacher', debounceQueryUser),
        enabled: debounceQueryUser ? true : false
    });
    const handleCreateBranch = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        document.querySelector(`.${styles.formData}`)?.querySelectorAll<HTMLInputElement>('input[name]').forEach(node => {
            node.classList.remove('error');
            formUtils.getParentElement(node)?.removeAttribute('data-error');
        });
        const submitter = e.nativeEvent.submitter as HTMLButtonElement;
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        await apiCreateBranch(formData);
        if (submitter.name === 'save') handleClosePopUp();
        else form.reset();
    };

    const handleSetShortcode = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Get the trimmed input value
        const inputValue = event.target.value.trim();

        // Check if input is not empty and handle accordingly
        if (inputValue) {
            // Get the first three letters, convert them to uppercase
            const shortName = inputValue.slice(0, 3).toUpperCase();

            // Optionally add some random value to make it more unique
            const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

            // Combine the short name and random suffix to form the unique identifier
            const name = `${shortName}${uniqueSuffix}`;

            // Update the shortcode state
            setShortcode(name);
        }
    };

    const { mutate, isPending } = useMutation({
        mutationFn: handleCreateBranch,
        onError: (error) => { formUtils.showFormError(error); },
        onSuccess: onMutateSuccess
    });
    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_USER] });
        };
    }, [queryClient]);
    return (
        <div className={
            css(
                styles.createModelContainer,
            )
        }>
            {
                isPending ? <Loading /> : null
            }
            <div className={
                css(
                    styles.createModelForm,
                )
            }>
                <div className={styles.header}>
                    <h2 className={styles.title}>{language?.create}</h2>
                    <div className={styles.escButton}
                        onClick={handleClosePopUp}
                    >
                        <RxCross2 />
                    </div>
                </div>
                <div className={styles.formContent}>
                    <form onSubmit={(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
                        mutate(e);
                    }}
                        onInput={(e) => { formUtils.handleOnInput(e); }}
                        className={styles.formData}>
                        <div className={styles.groupInputs}>
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor='shortcode'>{language?.shortcode}</label>
                                <input
                                    id='shortcode'
                                    name='shortcode'
                                    value={shortcode}

                                    className={css(appStyles.input, styles.inputItem)}
                                    type='text' />
                            </div>
                            <div className={styles.wrapItem}>
                                <label className={appStyles.required} htmlFor='name'>{language?.name}</label>
                                <input
                                    id='name'
                                    name='name'
                                    onChange={handleSetShortcode}

                                    className={css(appStyles.input, styles.inputItem)}
                                    type='text' />
                            </div>
                            <div className={styles.wrapItem}>
                                <label htmlFor='email'>{language?.email}</label>
                                <input
                                    id='email'
                                    name='email'
                                    className={css(appStyles.input, styles.inputItem)}
                                    type='text' />
                            </div>
                            <div className={styles.wrapItem}>
                                <label htmlFor='phone_number'>{language?.phoneNumber}</label>
                                <input
                                    id='phone_number'
                                    name='phone_number'
                                    className={css(appStyles.input, styles.inputItem)}
                                    type='text' />
                            </div>
                            <div className={styles.wrapItem}>
                                <label htmlFor='leader_id'>{language?.leader}</label>
                                <CustomDataList
                                    name='leader_id'
                                    onInput={e => { setQueryUser(e.currentTarget.value); }}
                                    options={userQueryData.data ? userQueryData.data.map(item => {
                                        return {
                                            label: languageUtils.getFullName(item.firstName, item.lastName),
                                            value: String(item.id)
                                        };
                                    }) : []}
                                    className={styles.customSelect}
                                />
                            </div>
                        </div>
                        <div className={styles.actionItems}>
                            <button name='save'
                                className={
                                    css(
                                        appStyles.actionItem,
                                        isPending ? appStyles.buttonSubmitting : ''
                                    )}>
                                <FiSave />{language?.save}
                            </button>
                            {/* <button name='save-more'
                                className={
                                    css(
                                        appStyles.actionItemWhite,
                                        isPending ? appStyles.buttonSubmitting : ''
                                    )
                                }>
                                <FiSave />{language?.saveMore}
                            </button> */}
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
}
