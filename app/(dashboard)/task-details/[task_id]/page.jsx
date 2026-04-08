'use client'

import TaskDetails from '@/components/tasks/TaskDetails';
import { useParams } from 'next/navigation';
import React from 'react';

const page = () => {
    const params = useParams();
    return (
        <div>
            {/* {params.task_id} */}
            <TaskDetails task_id={params?.task_id}/>
        </div>
    );
};

export default page;