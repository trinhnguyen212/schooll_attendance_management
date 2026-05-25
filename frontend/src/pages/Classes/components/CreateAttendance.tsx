import appStyles from '~styles/App.module.css';
import styles from '../styles/CreateAttendance.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
//import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { RxCross2 } from 'react-icons/rx';
//import { toast } from 'sonner';
import { apiCreateAttendance } from '~api/attendance';
import { apiGetCourseById } from '~api/course';
// import { apiGetAllUser } from '~api/user';
import Loading from '~components/Loading';
//import { AUTO_COMPLETE_DEBOUNCE } from '~config/env';
import QUERY_KEYS from '~constants/query-keys';
//import useDebounce from '~hooks/useDebounce';
import useLanguage from '~hooks/useLanguage';
import { ClasseDetail } from '~models/classe';
//import { UserDetail } from '~models/user';
import createFormUtils from '~utils/createFormUtils';
import css from '~utils/css';
import dateFormat from '~utils/date-format';
//import languageUtils from '~utils/languageUtils';

type CreateAttendanceProps = {
    classeDetail: ClasseDetail;
    onMutateSuccess: () => void;
    setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function CreateAttendance({
    classeDetail,
    onMutateSuccess,
    setShowPopUp
}: CreateAttendanceProps) {
    //const [totalQuestion, setTotalQuestion] = useState(0);
   // const [supervisors, setSupervisors] = useState<UserDetail[]>([]);
   // const [queryUser, setQueryUser] = useState('');
   // const debounceQueryUser = useDebounce(queryUser, AUTO_COMPLETE_DEBOUNCE);
    const language = useLanguage('component.create_attendance');
    const queryClient = useQueryClient();
    const handleClosePopUp = () => {
        setShowPopUp(false);
    };
    const formUtils = createFormUtils(styles);
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.PAGE_COURSE, { id: classeDetail.courseId }],
        queryFn: () => apiGetCourseById(classeDetail.courseId)
    });
    /* const userQueryData = useQuery({
        queryKey: [QUERY_KEYS.ALL_TEACHER, { search: debounceQueryUser }],
        queryFn: () => apiGetAllUser('teacher', debounceQueryUser),
    }); */
    const handleCreateAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        document.querySelector(`.${styles.formData}`)?.querySelectorAll<HTMLInputElement>('input[name]').forEach(node => {
            node.classList.remove('error');
            formUtils.getParentElement(node)?.removeAttribute('data-error');
        });
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
     /*    supervisors.forEach(supervisor => {
            formData.append('supervisor_ids[]', String(supervisor.id));
        }); */
        await apiCreateAttendance(formData);
        handleClosePopUp();
    };
    const { mutate, isPending } = useMutation({
        mutationFn: handleCreateAttendance,
        onError: (error) => { formUtils.showFormError(error); },
        onSuccess: onMutateSuccess
    });
    /* useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.ALL_TEACHER] });
        };
    }, [queryClient]); */
    return (
        <>
            <div className={
                css(
                    styles.createViewAttendanceContainer,
                )
            }>
                {
                    queryData.isLoading ? <Loading /> : null
                }
                {
                    isPending ? <Loading /> : null
                }
                <div className={
                    css(
                        styles.createViewAttendanceForm,
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
                        <form
                            onSubmit={e => { mutate(e); }}
                            className={styles.formData}>
                            <input hidden readOnly name='classe_id' value={classeDetail.id} />
                            <div className={styles.groupInputs}>
                                <div className={styles.wrapItem}>
                                    <label className={appStyles.required} htmlFor='name'>{language?.name}</label>
                                    <input
                                        id='name'
                                        name='name'
                                        className={css(appStyles.input, styles.inputItem)}
                                        type='text' />
                                </div>
                                <div className={styles.wrapItem}>
                                    <label className={appStyles.required} htmlFor='attendance_date'>{language?.attendanceDate}</label>
                                    <input
                                        defaultValue={dateFormat.toDateTimeMinuteString(new Date())}
                                        type='datetime-local'
                                        name='attendance_date'
                                        id='attendance_date'
                                        className={css(appStyles.input, styles.inputItem)}
                                    />
                                </div>
                                <div className={styles.actionItems}>
                                <button name='save'
                                    className={
                                        css(
                                            appStyles.actionItem,
                                            isPending ? 'button-submitting' : ''
                                        )
                                    }><FiSave />{language?.save}</button>
                            </div>

                             
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
