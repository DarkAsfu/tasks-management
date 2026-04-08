import Banner from '@/components/dashboard/Banner';
import Navbar from '@/components/dashboard/Navbar';
import TaskLists from '@/components/tasks/TaskLists';
import React from 'react';

const page = () => {
    return (
        <div>
            <TaskLists/>
        </div>
    );
};

export default page;