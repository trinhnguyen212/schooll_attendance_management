import appStyles from '~styles/App.module.css';
import styles from '~styles/ViewModel.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SyntheticEvent, useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { RxCross2 } from 'react-icons/rx';
/* import { apiAutoCompleteBranch } from '~api/branch'; */
import { apiGetSchoolOfThoughtById, apiUpdateSchoolOfThought } from '~api/school-of-thought';
/* import CustomDataList from '~components/CustomDataList'; */
import Loading from '~components/Loading';
/* import { AUTO_COMPLETE_DEBOUNCE } from '~config/env'; */
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
/* import useDebounce from '~hooks/useDebounce'; */
import useLanguage from '~hooks/useLanguage';
import createFormUtils from '~utils/createFormUtils';
import css from '~utils/css';

type ViewSchoolOfThoughtProps = {
    id: number;
    onMutateSuccess: () => void;
    setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ViewSchoolOfThought({
    id,
    onMutateSuccess,
    setShowPopUp
}: ViewSchoolOfThoughtProps) {
    const language = useLanguage('component.view_school_of_thought');
    const { permissions } = useAppContext();
/*     const [queryBranch, setQueryBranch] = useState('');
    const debounceQueryBranch = useDebounce(queryBranch, AUTO_COMPLETE_DEBOUNCE); */
    const queryClient = useQueryClient();
    const handleClosePopUp = () => {
        setShowPopUp(false);
    };
    const disabledUpdate = !permissions.has('school_of_thought_update');
    const formUtils = createFormUtils(styles);
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.SCHOOL_OF_THOUGHT_DETAIL, id],
        queryFn: () => apiGetSchoolOfThoughtById(id)
    });

    const handleUpdateSchoolOfThought = async (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        document.querySelector(`.${styles.formData}`)?.querySelectorAll<HTMLInputElement>('input[name]').forEach(node => {
            node.classList.remove('error');
            formUtils.getParentElement(node)?.removeAttribute('data-error');
        });
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        await apiUpdateSchoolOfThought(formData, id);
    };
    const { mutate, isPending } = useMutation({
        mutationFn: handleUpdateSchoolOfThought,
        onError: (error) => { formUtils.showFormError(error); },
        onSuccess: onMutateSuccess
    });
    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.SCHOOL_OF_THOUGHT_DETAIL, { id: id }] });
           /*  queryClient.removeQueries({ queryKey: [QUERY_KEYS.AUTO_COMPLETE_BRANCH] }); */
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
                    <h2 className={styles.title}>{queryData.data?.name}</h2>
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
                                    <div className={styles.groupInputs}>
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

                                    </div>
                                    {
                                        permissions.has('school_of_thought_update') ?
                                            <div className={styles.actionItems}>
                                                <button name='save'
                                                    className={
                                                        css(
                                                            appStyles.actionItem,
                                                            isPending ? appStyles.buttonSubmitting : ''
                                                        )
                                                    }>
                                                    <FiSave />
                                                    {language?.save}
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
