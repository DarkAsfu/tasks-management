'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trash2, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog' // Import your dialog components

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function TaskLists() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all-tasks')
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Missing access token. Please login again.')
      }

      const res = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setTasks(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Apply status filter
    if (statusFilter !== 'all-tasks') {
      result = result.filter(task => 
        statusFilter === 'pending' ? task.status === 'PENDING' :
        statusFilter === 'processing' ? task.status === 'PROCESSING' :
        statusFilter === 'done' ? task.status === 'DONE' : true
      )
    }

    return result
  }, [tasks, statusFilter])

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-purple-700 text-purple-700 border-purple-200'
      case 'PROCESSING':
        return 'bg-orange-700 text-orange-700 border-orange-200'
      case 'DONE':
        return 'bg-green-700 text-green-700 border-green-200'
      default:
        return 'bg-gray-700 text-gray-700 border-gray-200'
    }
  }

  const handleDeleteClick = (taskId, e) => {
    e.preventDefault()
    e.stopPropagation()
    setTaskToDelete(taskId)
    setShowDeleteModal(true)
  }

  const handleDeleteTask = async () => {
    if (!taskToDelete) return
    
    try {
      setUpdating(true)
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Missing access token. Please login again.')
      }
      await axios.delete(`${API_BASE_URL}/tasks/${taskToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      toast.success('Task deleted successfully')
      fetchTasks() // Refresh the task list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task')
    } finally {
      setUpdating(false)
      setShowDeleteModal(false)
      setTaskToDelete(null)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-[1320px] p-5 md:p-[30px] relative -top-14 z-100 rounded-[15px] shadow mx-auto bg-white'>
        {/* Header */}
        <div className='md:flex items-center justify-between mb-8'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            All Task List
          </h1>

          <div className='grid grid-cols-2 mt-2 md:grid-cols-2 gap-3 space-x-4 h-[50px]'>
            <Select 
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className='w-[200px] text-base h-auto min-h-[50px]'>
                <SelectValue placeholder='All Tasks' />
              </SelectTrigger>
              <SelectContent className='z-200 bg-white'>
                <SelectItem value='all-tasks'>All Statuses</SelectItem>
                <SelectItem value='pending'>PENDING</SelectItem>
                <SelectItem value='processing'>PROCESSING</SelectItem>
                <SelectItem value='done'>DONE</SelectItem>
              </SelectContent>
            </Select>

            <Link className='cursor-pointer' href='/add-task'>
              <Button className='bg-primary cursor-pointer h-[50px] text-heading flex items-center space-x-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='18'
                  height='20'
                  viewBox='0 0 18 20'
                  fill='none'
                >
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M11.236 0.761963H4.584C2.525 0.761963 0.75 2.43096 0.75 4.49096V15.34C0.75 17.516 2.408 19.115 4.584 19.115H12.572C14.632 19.115 16.302 17.4 16.302 15.34V6.03796L11.236 0.761963Z'
                    stroke='#1F1F1F'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M10.9766 0.750244V3.65924C10.9766 5.07924 12.1256 6.23124 13.5456 6.23424C14.8616 6.23724 16.2086 6.23824 16.2996 6.23224'
                    stroke='#1F1F1F'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M10.7994 10.9141H5.89844'
                    stroke='#1F1F1F'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M8.34375 13.3654V8.46436'
                    stroke='#1F1F1F'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <span>Add New Task</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Task Grid */}
        {loading ? (
          <div className='text-center text-gray-500'>Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12'>
            <Image
              src='/notavailable.png'
              width={300}
              height={300}
              alt='No tasks found'
              className='mb-6'
            />

            <p className='text-heading text-[24px] font-poppins font-semibold mb-6'>
              {tasks.length === 0 
                ? "You don't have any tasks yet. Create your first task to get started!"
                : "No tasks match your filters"}
            </p>
            <Link href='/dashboard/add-task'>
              <Button className='bg-primary cursor-pointer hover:bg-primary/90 text-heading'>
                <Plus className='w-4 h-4 mr-2' />
                Create New Task
              </Button>
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredTasks.map(task => (
              <Link key={task.id} href={`/task-details/${task.id}`}>
                <Card className='bg-white shadow-sm hover:shadow-md transition-shadow'>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium text-sm'>
                          <Image
                            src='/ticon.png'
                            width={24}
                            height={24}
                            alt='task-icon'
                          />
                        </div>
                        <h3 className='font-semibold text-[#161616] font-poppins text-[20px]'>
                          {task.title}
                        </h3>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-red-500 hover:text-red-700 hover:bg-red-50'
                        onClick={(e) => handleDeleteClick(task.id, e)}
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>

                    <p className='text-[#667085] font-poppins text-[14px] mb-7 ml-[48px]'>
                      {task.description.slice(0, 100)}...
                    </p>
                    <p className='text-[#667085] font-poppins text-[13px] mb-4 ml-[48px]'>
                      Assigned to: {task.assignedUser?.name || 'Unassigned'}
                    </p>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2 text-[#1F1F1F] text-sm font-poppins'>
                        <Calendar className='w-6 h-6' />
                        <span>{new Date(task.createdAt).toDateString()}</span>
                      </div>
                      <Badge
                        variant='outline'
                        className={`${getStatusColor(
                          task.status
                        )} font-medium border-0 bg-transparent`}
                      >
                        <span
                          className={`${getStatusColor(
                            task.status
                          )} h-2 w-2 rounded-full`}
                        ></span>{' '}
                        {task.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-[100]" />
        <DialogContent className="fixed left-[50%] top-[50%] z-[101] w-full max-w-[425px] translate-x-[-50%] translate-y-[-50%] rounded-lg p-6 bg-white shadow-lg">
          <div className="flex flex-col items-center text-center">
            <Image src="/delete.png" width={350} height={250} alt="Delete confirmation" />
            
            <h3 className="text-[40px] font-poppins font-semibold text-heading mb-2">Are you Sure!!</h3>
            <p className="text-[#737791] text-[18px] font-poppins mb-6">
              Do you want to delete this Task on this app?
            </p>

            <div className="flex gap-5 w-[299px] h-[49px]">
              <Button
                onClick={handleDeleteTask}
                disabled={updating}
                className="flex-1 cursor-pointer h-full bg-primary hover:bg-primary/40 text-white"
              >
                {updating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Yes"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 cursor-pointer h-full border-gray-300 hover:bg-gray-50"
                disabled={updating}
              >
                No
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}