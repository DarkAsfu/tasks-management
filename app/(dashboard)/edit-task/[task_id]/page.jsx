import EditTask from '@/components/tasks/EditTask';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import React from 'react';

const page = () => {
    return (
        <AdminProtectedRoute redirectTo='/'>
            <div>
                <EditTask/>
            </div>
        </AdminProtectedRoute>
    );
};

export default page;