import React, { useEffect } from 'react';
import appStyles from '~styles/App.module.css';
import styles from '../styles/RolePermissions.module.css';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { apiGetRolePermissions, apiUpdateRolePermissions } from '~api/role-permission';
import Loading from '~components/Loading';
import QUERY_KEYS from '~constants/query-keys';
import useAppContext from '~hooks/useAppContext';
import useLanguage from '~hooks/useLanguage';
import NotFound from '~pages/Errors/NotFound';
import css from '~utils/css';

import { FiSave } from 'react-icons/fi';

// Define the type for the role prop
interface RolePermissionsProps {
  role: string;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ role }) => {
    const { permissions, appTitle } = useAppContext();
    const language = useLanguage('page.role_permissions');
    const queryClient = useQueryClient();
    
    const queryData = useQuery({
        queryKey: [QUERY_KEYS.PAGE_ROLE_PERMISSIONS, { role }],
        queryFn: () => apiGetRolePermissions(Number(role)),
        enabled: permissions.has('role_permission_view')
    });

    const handleUpdatePermission = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const permissionIds: (string | number)[] = [];
        formData.forEach(value => {
            permissionIds.push(value.toString());
        });
        if (!role) return;
        await apiUpdateRolePermissions(role, permissionIds);
    };

    const { mutate, isPending } = useMutation({
        mutationFn: handleUpdatePermission,
        onSuccess: () => {
            queryData.refetch();
        }
    });

    useEffect(() => {
        if (language) appTitle.setAppTitle(language.permissions);
    }, [appTitle, language]);

    if (!permissions.has('role_permission_view')) return <Navigate to='/' />;
    if (queryData.error) return (
        <main className={css(appStyles.dashboard, styles.rolePermissionContainer)}>
            <NotFound />
        </main>
    );

    return (
        <div className={css(appStyles.dashboard, styles.rolePermissionContainer)}>
            {queryData.isFetching || isPending ? <Loading /> : null}
            {queryData.data ? (
                <form onSubmit={e => { mutate(e); }} className={styles.permissionContainer}>
                    <ul className={styles.permissionList}>
                        {queryData.data.appPermissions.map(item => (
                            <li className={styles.permissionItem} key={`permission-${item.id}`}>
                                <input
                                    id={item.name}
                                    type="checkbox"
                                    name="ids[]"
                                    value={item.id}
                                    disabled={!permissions.has('role_permission_grant')}
                                    defaultChecked={queryData.data.role.permissions.some(p => p.id === item.id)}
                                />
                                <label htmlFor={item.name}>{item.displayName}</label>
                            </li>
                        ))}
                    </ul>
                    {permissions.has('role_permission_grant') && (
                        <div className={styles.actionItems}>
                            <button type="submit" className={appStyles.actionItem}>
                                <FiSave /> {language?.save}
                            </button>
                        </div>
                    )}
                </form>
            ) : null}
        </div>
    );
};

export default RolePermissions;
