import appStyles from '~styles/App.module.css';
import styles from './styles/Attendance.module.css';

import { useQuery } from '@tanstack/react-query';
import { useState, ChangeEvent } from 'react';
//import { BiExport } from 'react-icons/bi';
//import { ImCancelCircle } from 'react-icons/im';
//import { LuAlarmClock, LuRefreshCw } from 'react-icons/lu';
import { Link, Navigate, useParams } from 'react-router-dom';
//import { apiGetAttendanceById, apiGetAttendanceResults, apiUpdateAttendanceStatus} from '~api/attendance';
import { apiGetAttendanceById, apiGetAttendanceResults} from '~api/attendance';
import {  apiUpdateAttendanceResult} from '~api/attendance-result';
import Loading from '~components/Loading';
//import StatusBadge from '~components/StatusBadge';
//import YesNoPopUp from '~components/YesNoPopUp';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useLanguage from '~hooks/useLanguage';
import NotFound from '~pages/Errors/NotFound';
//import caculateScore from '~utils/caculateScore';
import css from '~utils/css';
import languageUtils from '~utils/languageUtils';
//import createFormUtils from '~utils/createFormUtils';
//import { saveBlob } from '~utils/saveBlob';
import { AttendanceResult } from '~models/attendance-result';
import { UserDetail } from '~models/user';

export default function Attendance() {
    const { user, appLanguage, permissions } = useAppContext();
   
    const language = useLanguage('page.attendance');
    const { id } = useParams();

    
    const handleUpdateAttendanceResult = async (id: string |number, event: ChangeEvent<HTMLSelectElement>) => {
        const updatedValue = event.target.value;
        await apiUpdateAttendanceResult(updatedValue, id);
    };
    const AttendanceSelect = ({ item }: { item: { user: UserDetail; result: AttendanceResult | null } }) => {
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
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.ATTENDANCE, { id: id }],
        queryFn: () => apiGetAttendanceById(String(id)),
        refetchOnWindowFocus: false,
        enabled: permissions.has('attendance_view'),
        retry: false,
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

 //   const onMutateSuccess = () => { queryData.refetch(); };


  
 

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const durationFormat = new Intl.DurationFormat(appLanguage.language, {
        style: 'long'
    });
    if (!permissions.has('attendance_view')) return <Navigate to='/' />;
    if (queryData.error) return (
        <main className={css(appStyles.dashboard, styles.pageContent)}>
            <NotFound />
        </main>
    );
    return (
        <>

            <main className={css(appStyles.dashboard, styles.pageContent)}>
                {
                    queryData.isLoading ? <Loading /> : null
                }
                {
                    queryData.data ?
                        <>
                            <section className={styles.attendanceInfoContainer}>
                                <div className={styles.header}>
                                    <h2 className={styles.title}>{language?.attendance}</h2>
                                </div>
                                <div className={styles.attendaceInfo}>
                                    <div className={styles.groupInfos}>
                                        <div className={styles.wrapItem}>
                                            <label>{language?.name}: </label>
                                            <p>{queryData.data.name}</p>
                                        </div>
                                        <div className={styles.wrapItem}>
                                            <label>{language?.attendanceDate}: </label>
                                            <p>{new Date(queryData.data.attendanceDate).toLocaleString(appLanguage.language)}</p>
                                        </div>
   
                                    </div>
                                </div>
                                {
                                    permissions.hasAnyFormList(['attendance_update']) ?
                                        <div className={styles.actionItems}>
                                            


                                            {
                                                permissions.has('attendance_update') ?
                                                    <>


                                                    </> : null
                                            }
                                        </div>
                                        : null
                                }
                            </section>
                            <section className={styles.resultContainer}>
                                <div className={styles.header}>
                                    <h2 className={styles.title}>{language?.result}</h2>
                                </div>
                                <div className={appStyles.actionBar}>


                                </div>
                                <div className={styles.tableContainer}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                resultsQueryData.data?.map(item => {
                                                     // Add console.log here to check the value
  console.log("item.result?.attendanceStatus:", item.result?.attendanceStatus);
                                                    return (
                                                        <tr key={`attendance-result-${item.user.id}`}>
                                                            <td className={css(styles.column, styles.superLarge)}>
                                                                {languageUtils.getFullName(item.user.firstName, item.user.lastName)}
                                                            </td>

                                                            <td className={css(styles.column, styles.small, styles.columnSelect)} >

                                                            

                                                            <AttendanceSelect item={item} />                                      
                                                            </td>                                                           
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </table>
                           
                
                                </div>
                            </section>
                        </> : null
                }
            </main>
        </>
    );
}
