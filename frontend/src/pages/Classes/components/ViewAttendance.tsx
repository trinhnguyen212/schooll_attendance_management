import appStyles from '~styles/App.module.css';
import styles from '../styles/CreateViewAttendance.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { RxCross2 } from 'react-icons/rx';
import { apiDeleteAttendance, apiGetAttendanceById, apiUpdateAttendance,apiGetAttendanceResults } from '~api/attendance';
//import { apiGetAllUser } from '~api/user';
import Loading from '~components/Loading';
import YesNoPopUp from '~components/YesNoPopUp';
//import { AUTO_COMPLETE_DEBOUNCE } from '~config/env';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
//import useDebounce from '~hooks/useDebounce';
import useLanguage from '~hooks/useLanguage';
//import { User } from '~models/user';
import createFormUtils from '~utils/createFormUtils';
import css from '~utils/css';
import dateFormat from '~utils/date-format';
import languageUtils from '~utils/languageUtils';
import { UserDetail } from '~models/user';
import { AttendanceResult } from '~models/attendance-result';
import {  apiUpdateAttendanceResult} from '~api/attendance-result';

//import languageUtils from '~utils/languageUtils';

type ViewAttendanceProps = {
    id: number;
    onMutateSuccess: () => void;
    setShowPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function ViewAttendance({
    id,
    onMutateSuccess,
    setShowPopUp
}: ViewAttendanceProps) {
    const { permissions, user } = useAppContext();
   //const [supervisors, setSupervisors] = useState<User[]>([]);
    //const [queryUser, setQueryUser] = useState('');
    const [showDeletePopUp, setShowDeletePopUp] = useState(false);
 //   const debounceQueryUser = useDebounce(queryUser, AUTO_COMPLETE_DEBOUNCE);
    const language = useLanguage('component.view_attendance');
    const queryClient = useQueryClient();
    const handleClosePopUp = () => {
        setShowPopUp(false);
    };
    const disabledUpdatee = !permissions.has('attendance_update');
    const formUtils = createFormUtils(styles);
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.ATTENDANCE, { id: id }],
        queryFn: () => apiGetAttendanceById(id),
    });

    const resultsQueryData = useQuery({
        queryKey: [QUERY_KEYS.ATTENDANCE_RESULTS, { attendanceId: id }],
        queryFn: () => apiGetAttendanceResults(String(id)),
        refetchOnWindowFocus: false,
        enabled: permissions.has('attendance_view'),
        retry: false,
    });
    const statusOptions = [
        { value: '1', label: language?.attendanceStatus.true },
        { value: '0', label: language?.attendanceStatus.false },
    ];
/*     const userQueryData = useQuery({
        queryKey: [QUERY_KEYS.ALL_TEACHER, { search: debounceQueryUser }],
        queryFn: () => apiGetAllUser('teacher', debounceQueryUser),
        enabled: permissions.has('user_view') ? true : false
    }); */
    const handleUpdateAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        document.querySelector(`.${styles.formData}`)?.querySelectorAll<HTMLInputElement>('input[name]').forEach(node => {
            node.classList.remove('error');
            formUtils.getParentElement(node)?.removeAttribute('data-error');
        });
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        /* supervisors.forEach(supervisor => {
            formData.append('supervisor_ids[]', String(supervisor.id));
        }); */
        await apiUpdateAttendance(formData, id);
       // handleClosePopUp();
    };
    const handleDeleteAttendance = async () => {
        await apiDeleteAttendance(id);
    };
        const handleUpdateAttendanceResult = async (id: string |number, event: ChangeEvent<HTMLSelectElement>) => {
            const updatedValue = event.target.value;
           // setSelectedValue(updatedValue);
            await apiUpdateAttendanceResult(updatedValue, id);
        };
    const AttendanceSelect = ({ item }: { item: { user: UserDetail; result: AttendanceResult | null } }) => {
          // Initialize state with the selected value based on attendanceStatus
  const initialValue = item.result?.attendanceStatus ? statusOptions[0].value : statusOptions[1].value;
  const [selectedValue, setSelectedValue] = useState(initialValue)
      
        const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
          const updatedValue = event.target.value;
          setSelectedValue(updatedValue);
          handleUpdateAttendanceResult(String(item.result?.id), event);
          queryData.refetch();
          resultsQueryData.refetch();
        };
      
        return (
          <select value={selectedValue} onChange={handleChange} >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      };
    

    const { mutate, isPending } = useMutation({
        mutationFn: handleUpdateAttendance,
        onError: (error) => { formUtils.showFormError(error); },
        onSuccess: onMutateSuccess
    });

    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.ATTENDANCE, { id: id }] });
            queryClient.removeQueries({ queryKey: [QUERY_KEYS.ALL_TEACHER] });
        };
    }, [id, queryClient]);
    return (
        <>
            {showDeletePopUp === true ?
                <YesNoPopUp
                    message={language?.deleteMessage || ''}
                    mutateFunction={handleDeleteAttendance}
                    setShowPopUp={setShowDeletePopUp}
                    onMutateSuccess={() => { onMutateSuccess(); handleClosePopUp(); }}
                    langYes={language?.langYes}
                    langNo={language?.langNo}
                /> : null}
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
                        <h2 className={styles.title}>{language?.attendance}</h2>
                        <div className={styles.escButton}
                            onClick={handleClosePopUp}
                        >
                            <RxCross2 />
                        </div>
                    </div>
                    <div className={styles.formContent}>
                        {
                            queryData.data ?
                                <form
                                    onSubmit={e => { mutate(e); }}
                                    className={styles.formData}>
                                    <div className={styles.groupInputs}>
                                        <div className={styles.wrapItem}>
                                            <label className={appStyles.required} htmlFor='name'>{language?.name}</label>
                                            <input
                                                id='name'
                                                name='name'
                                                defaultValue={queryData.data.name}
                                                disabled={disabledUpdatee}
                                                className={css(appStyles.input, styles.inputItem)}
                                                type='text' />
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label className={appStyles.required} htmlFor='attendance_date'>{language?.attendanceDate}</label>
                                            <input
                                                defaultValue={dateFormat.toDateTimeMinuteString(new Date(queryData.data.attendanceDate))}
                                                type='datetime-local'
                                                name='attendance_date'
                                                id='attendance_date'
                                                disabled={disabledUpdatee}
                                                className={css(appStyles.input, styles.inputItem)}
                                            />
                                        </div>
                                        {
                                        permissions.hasAnyFormList(['attendance_update', 'attendance_delete'])?
                                            <div className={styles.actionItems}>
                                                {
                                                    permissions.has('attendance_update')?
                                                        <button name='save'
                                                            className={
                                                                css(
                                                                    appStyles.actionItem,
                                                                    isPending ? appStyles.buttonSubmitting : ''
                                                                )
                                                            }
                                                        ><FiSave />{language?.save}
                                                        </button> : null
                                                }
                                                {
                                                    permissions.has('attendance_delete') ?
                                                        <button
                                                            type='button'
                                                            onClick={() => {
                                                                setShowDeletePopUp(true);
                                                            }}
                                                            className={appStyles.actionItemWhiteBorderRed}>
                                                            <MdDeleteOutline /> {language?.delete}
                                                        </button> : null
                                                }
  

                                            </div>
                                            : null
                                            
                                    }

{permissions.has('attendance_view') && (
    <div className={styles.tableContainer}>
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Full Name</th>
                    <th>Attendance Status</th>
                </tr>
            </thead>
            <tbody>
  {resultsQueryData.data?.map(item => (
    <tr key={`attendance-result-${item.user.id}`}>
      <td className={css(styles.column, styles.superLarge)}>
        {languageUtils.getFullName(item.user.firstName, item.user.lastName)}
      </td>
      <td className={css(styles.column, styles.small, styles.columnSelect)}>
        {permissions.has('attendance_update') ? (
          <AttendanceSelect item={item} />
        ) : (
          <span>{item.result?.attendanceStatus ? 'Present' : 'Absent'}</span>
        )}
      </td>
    </tr>
  ))}
</tbody>


        </table>
    </div>
)}


                                    </div>

                                    {/*  */}



                                    {/*  */}

                                </form>
                                : null
                        }
                    </div>
                </div>
            </div>
        </>
    );
}
