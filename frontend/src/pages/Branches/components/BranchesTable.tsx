import appStyles from '~styles/App.module.css';
import styles from '~styles/Table.module.css';

import { useState } from 'react';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
import { SetURLSearchParams } from 'react-router';
import useAppContext from '~hooks/useAppContext';
import useLanguage from '~hooks/useLanguage';
import { BranchDetail } from '~models/branch';
import { Pagination } from '~models/response';
import css from '~utils/css';
import languageUtils from '~utils/languageUtils';
import ViewBranch from './ViewBranch';

type BranchesTableProps = {
    data?: Pagination<BranchDetail>;
    searchParams: URLSearchParams;
    onMutateSuccess: () => void;
    setSearchParams: SetURLSearchParams;
    setSelectedRows: React.Dispatch<React.SetStateAction<Set<string | number>>>;
};

export default function BranchesTable({
    data,
    searchParams,
    onMutateSuccess,
    setSearchParams,
    setSelectedRows
}: BranchesTableProps) {
    const { permissions } = useAppContext();
    const [checkAll, setCheckAll] = useState(false);
    const language = useLanguage('component.branches_table');
    const [showViewPopUp, setShowViewPopUp] = useState(false);
    const [branchId, seBranchId] = useState<number>(0);
    const handleViewBranch = (id: number, e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
        const target = e.target as Element;
        if (target.nodeName === 'INPUT') {
            const checkBox = target as HTMLInputElement;
            const perPage = Number(searchParams.get('per_page')) || 10;
            if (checkBox.checked) setSelectedRows(pre => {
                pre.add(id);
                if (pre.size === perPage) setCheckAll(true);
                return structuredClone(pre);
            });
            else setSelectedRows(pre => {
                pre.delete(id);
                if (pre.size !== perPage) setCheckAll(false);
                return structuredClone(pre);
            });
            return;
        }
        seBranchId(id);
        setShowViewPopUp(true);
    };
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentTarget = e.currentTarget;
        const selector = `.${styles.columnSelect}>input`;
        const allCheckBox = document.querySelectorAll(selector);
        allCheckBox.forEach(node => {
            const element = node as HTMLInputElement;
            element.checked = currentTarget.checked;
        });
        if (currentTarget.checked) {
            setSelectedRows(pre => {
                pre.clear();
                if (data) data.data.forEach(user => {
                    pre.add(user.id);
                });
                return structuredClone(pre);
            });
            setCheckAll(true);
        }
        else {
            setSelectedRows(pre => {
                pre.clear();
                return structuredClone(pre);
            });
            setCheckAll(false);
        }
    };
    return (
        <>
            {showViewPopUp === true ?
                <ViewBranch
                    id={branchId}
                    onMutateSuccess={onMutateSuccess}
                    setShowPopUp={setShowViewPopUp}
                /> : null}
            <div className={styles.tableContent}>
                <table className={styles.main}>
                    <>
                        <thead>
                            <tr>
                                {
                                    permissions.has('branch_delete') ?
                                        <th className={css(styles.columnSelect, styles.column)}>
                                            <input type='checkbox'
                                                checked={checkAll}
                                                onChange={handleSelectAll} />
                                        </th>
                                        : null
                                }

                                <th className={css(styles.column, styles.medium)}>
                                    Branchcode
                                </th>
                                <th className={css(styles.column, styles.medium)}>
                                    {language?.header.name}
                                </th>
                                <th className={css(styles.column, styles.medium)}>
                                    {language?.header.phoneNumber}
                                </th>
                                <th className={css(styles.column, styles.medium)}>
                                    {language?.header.email}
                                </th>
                                <th className={css(styles.column, styles.medium)}>
                                    {language?.header.leader}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data ?
                                    data.data.map(branch => {
                                        return (
                                            <tr key={branch.id}
                                                onClick={(e) => {
                                                    handleViewBranch(branch.id, e);
                                                }}
                                            >
                                                {
                                                    permissions.has('branch_delete') ?
                                                        <td className={css(styles.column, styles.small, styles.columnSelect)}>
                                                            <input type='checkbox' />
                                                        </td>
                                                        : null
                                                }
                                                <td className={css(styles.column, styles.medium)}>
                                                    {branch.shortcode}
                                                </td>
                                                <td className={css(styles.column, styles.medium)}>
                                                    {branch.name}
                                                </td>
                                                <td className={css(styles.column, styles.medium)}>
                                                    {branch.phoneNumber}
                                                </td>
                                                <td className={css(styles.column, styles.medium)}>
                                                    {branch.email}
                                                </td>
                                                <td className={css(styles.column, styles.medium)}>
                                                    {languageUtils.getFullName(branch.leader?.firstName, branch.leader?.lastName)}
                                                </td>
                                            </tr>
                                        );
                                    }) : null
                            }
                        </tbody>
                    </>
                </table>
                {
                    data ?
                        <div className={styles.tableFooter}>
                            <span>
                                {data.from} - {data.to} / {data.total}
                            </span>
                            <div className={styles.tableLinks}>
                                {
                                    <div className={styles.linkContent}>
                                        {data.links.map(link => {
                                            if (isNaN(Number(link.label))) return (
                                                <button key={'branch' + link.label} className={styles.nextPrevious}
                                                    onClick={() => {
                                                        if (!link.url) return;
                                                        const url = new URL(link.url);
                                                        searchParams.set('page', url.searchParams.get('page') || '1');
                                                        setSearchParams(searchParams);
                                                    }}
                                                >
                                                    {link.label === '...' ? '...' : link.label.includes('Next') ? <GrFormNext /> : <GrFormPrevious />}
                                                </button>
                                            );
                                            return (
                                                <button key={'branch' + link.label}
                                                    className={
                                                        css(
                                                            appStyles.button,
                                                            !link.active ? styles.inactive : ''
                                                        )
                                                    }
                                                    onClick={() => {
                                                        if (!link.url) return;
                                                        const url = new URL(link.url);
                                                        searchParams.set('page', url.searchParams.get('page') || '1');
                                                        setSearchParams(searchParams);
                                                    }}
                                                >{link.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                }
                            </div>
                        </div> : null
                }
            </div>
        </>
    );
}
