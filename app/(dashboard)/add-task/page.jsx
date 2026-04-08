import AddTask from '@/components/tasks/AddTask';
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import React from 'react';

const page = () => {
    return (
        <AdminProtectedRoute redirectTo="/">
            <div>
                <AddTask/>
            </div>
        </AdminProtectedRoute>
    );
};

export default page;