import appStyles from '~styles/App.module.css';
import styles from '~styles/ViewModel.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SyntheticEvent, useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { RxCross2 } from 'react-icons/rx';
import { apiGetBranchById, apiUpdateBranch } from '~api/branch';
import { apiAutoCompleteUser } from '~api/user';
import CustomDataList from '~components/CustomDataList';
import Loading from '~components/Loading';
import { AUTO_COMPLETE_DEBOUNCE } from '~config/env';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useDebounce from '~hooks/useDebounce';
import useLanguage from '~hooks/useLanguage';
import createFormUtils from '~utils/createFormUtils';
import css from '~utils/css';
import languageUtils from '~utils/languageUtils';

type ViewBranchProps = {
    id: number;
    onMutateSuccess: () => void;
    setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ViewBranch({
    id,
    onMutateSuccess,
    setShowPopUp
}: ViewBranchProps) {
    const language = useLanguage('component.view_branch');
    const { permissions } = useAppContext();
    const [queryUser, setQueryUser] = useState('');
    const debounceQueryUser = useDebounce(queryUser, AUTO_COMPLETE_DEBOUNCE);
    const queryClient = useQueryClient();
    const disabledUpdate = !permissions.has('branch_update');
    const handleClosePopUp = () => {
        setShowPopUp(false);
    };
    const formUtils = createFormUtils(styles);
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.BRANCH_DETAIL, { id: id }],
        queryFn: () => apiGetBranchById(id)
    });
    const userQueryData = useQuery({
        queryKey: [QUERY_KEYS.AUTO_COMPLETE_USER, { search: debounceQueryUser }],
        queryFn: () => apiAutoCompleteUser('teacher', debounceQueryUser),
        enabled: debounceQueryUser && permissions.has('user_view') ? true : false
    });
    const handleUpdateBranch = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        document.querySelector(`.${styles.formData}`)?.querySelectorAll<HTMLInputElement>('input[name]').forEach(node => {
            node.classList.remove('error');
            formUtils.getParentElement(node)?.removeAttribute('data-error');
        });
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        await apiUpdateBranch(formData, id);
    };
    const { mutate, isPending } = useMutation({
        mutationFn: handleUpdateBranch,
        onError: (error) => { formUtils.showFormError(error); },
        onSuccess: onMutateSuccess
    });
    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.BRANCH_DETAIL, { id: id }] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_USER] });
        };
    }, [id, queryClient]);
    return (
        <div
            className={
                css(
                    styles.viewModelContainer,
                )
            }>
            {
                isPending ? <Loading /> : null
            }
            <div
                className={
                    css(
                        styles.viewModelForm,
                    )
                }>
                <div className={styles.header}>
                    <h2 className={styles.title}>Branch Details</h2>
                    <div className={styles.escButton}
                        onClick={handleClosePopUp}
                    >
                        <RxCross2 />
                    </div>
                </div>
                <>
                    {
                        queryData.isLoading ? <Loading /> : null
                    }
                    <div className={styles.formContent}>
                        {
                            queryData.data ? (
                                <form onSubmit={(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
                                    mutate(e);
                                }}
                                    onInput={(e) => { formUtils.handleOnInput(e); }}
                                    className={styles.formData}>
                                    <div className={styles.groupInputs
                                    }>
                                        <div className={styles.wrapItem}>
                                            <label className={appStyles.required} htmlFor='shortcode'>{language?.shortcode}</label>
                                            <input
                                                id='shortcode'
                                                disabled={disabledUpdate}
                                                defaultValue={queryData.data.shortcode}
                                                name='shortcode'
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label className={appStyles.required} htmlFor='name'>{language?.name}</label>
                                            <input
                                                id='name'
                                                disabled={disabledUpdate}
                                                defaultValue={queryData.data.name}
                                                name='name'
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label htmlFor='email'>{language?.email}</label>
                                            <input
                                                id='email'
                                                disabled={disabledUpdate}
                                                defaultValue={queryData.data.email || ''}
                                                name='email'
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label htmlFor='phone_number'>{language?.phoneNumber}</label>
                                            <input
                                                id='phone_number'
                                                disabled={disabledUpdate}
                                                defaultValue={queryData.data.phoneNumber || ''}
                                                name='phone_number'
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label htmlFor='leader_id'>{language?.leader}</label>
                                            <CustomDataList
                                                name='leader_id'
                                                defaultOption={
                                                    {
                                                        label: languageUtils.getFullName(queryData.data.leader?.firstName, queryData.data.leader?.lastName),
                                                        value: queryData.data.leader ? String(queryData.data.leader.id) : ''
                                                    }
                                                }
                                                disabled={disabledUpdate}
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
                                    {
                                        permissions.has('branch_update') ?
                                            <div className={styles.actionItems}>
                                                <button name='save'
                                                    className={
                                                        css(
                                                            appStyles.actionItem,
                                                            isPending ? appStyles.buttonSubmitting : ''
                                                        )
                                                    }
                                                ><FiSave />{language?.save}
                                                </button>
                                            </div>
                                            : null
                                    }
                                </form>
                            ) : null
                        }
                    </div>
                </>
            </div>
        </div>
    );
}
