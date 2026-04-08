'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function EditTask() {
  const { task_id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedUserId: '',
    status: 'PENDING'
  })

  useEffect(() => {
    const loadData = async () => {
      setFetching(true)
      setUsersLoading(true)

      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          throw new Error('Missing access token. Please login again.')
        }

        const [taskRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tasks/${task_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        const taskData = await taskRes.json()
        const usersData = await usersRes.json()

        if (!taskRes.ok) {
          throw new Error(taskData?.message || 'Failed to fetch task')
        }

        if (!usersRes.ok) {
          throw new Error(usersData?.message || 'Failed to load users')
        }

        const task = taskData?.task || taskData
        const normalizedUsers = Array.isArray(usersData) ? usersData : []

        setUsers(normalizedUsers)
        setFormData({
          title: task?.title || '',
          description: task?.description || '',
          assignedUserId: task?.assignedUserId || task?.assignedUser?.id || '',
          status: task?.status || 'PENDING'
        })
      } catch (error) {
        toast.error(error.message || 'Failed to load task')
        if (error.message?.toLowerCase().includes('token')) {
          router.push('/login')
          return
        }
        router.push('/')
      } finally {
        setFetching(false)
        setUsersLoading(false)
      }
    }

    loadData()
  }, [task_id, router])

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleStatusChange = (value) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }))
  }

  const handleAssignUserChange = (e) => {
    const { value } = e.target
    setFormData(prev => ({
      ...prev,
      assignedUserId: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Missing access token. Please login again.')
      }

      const response = await fetch(`${API_BASE_URL}/tasks/${task_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          assignedUserId: formData.assignedUserId,
          status: formData.status
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task')
      }

      toast.success('Task updated successfully!')
      router.push('/')
    } catch (error) {
      toast.error(error.message || 'An error occurred')
      if (error.message?.toLowerCase().includes('token')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-lg'>Loading task data...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-[1320px] p-5 md:p-[30px] relative -top-14 z-100 rounded-[15px] shadow mx-auto bg-white'>
        <div className=''>
          <div className='flex items-center justify-between mb-8'>
            <h1 className='text-[24px] font-poppins font-semibold text-heading'>
              Edit Task
            </h1>
            <Link href='/'>
              <Button className='w-[167px] h-[50px] bg-primary text-heading text-[16px] font-semibold'>
                Back
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='md:flex gap-8'>
              <div className='md:w-[825px] space-y-[19px]'>
                <div>
                  <Label
                    htmlFor='title'
                    className='text-[16px] font-poppins font-semibold text-heading leading-[21.12px] tracking-[-0.32px] block mb-3'
                  >
                    Task Title
                  </Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={handleChange}
                    placeholder='Enter task title'
                    className='w-full h-12 px-4 border border-gray-200 rounded-lg'
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label
                    htmlFor='assignedUserId'
                    className='text-[16px] font-poppins font-semibold text-heading leading-[21.12px] tracking-[-0.32px] block mb-3'
                  >
                    Assign To
                  </Label>
                  <select
                    id='assignedUserId'
                    value={formData.assignedUserId}
                    onChange={handleAssignUserChange}
                    className='w-full h-12 px-4 border border-gray-200 rounded-lg bg-white'
                    required
                    disabled={usersLoading || users.length === 0}
                  >
                    {usersLoading ? (
                      <option value=''>Loading users...</option>
                    ) : users.length === 0 ? (
                      <option value=''>No users found</option>
                    ) : (
                      users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email}){u.role ? ` - ${u.role}` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor='description'
                    className='text-[16px] font-poppins font-semibold text-heading leading-[21.12px] tracking-[-0.32px] block mb-3'
                  >
                    Description
                  </Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={handleChange}
                    placeholder='Enter your description here...'
                    className='w-full h-36 px-4 py-4 border border-gray-200 rounded-lg'
                    maxLength={500}
                  />
                </div>
              </div>

              <div className='md:w-[413px]'>
                <Label
                  htmlFor='status'
                  className='text-[16px] font-poppins font-semibold text-heading leading-[21.12px] tracking-[-0.32px] block mb-3'
                >
                  Status
                </Label>
                <select
                  id='status'
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className='w-full h-12 px-4 border border-gray-200 rounded-lg bg-white'
                  required
                >
                  <option value='PENDING'>Pending</option>
                  <option value='PROCESSING'>Processing</option>
                  <option value='DONE'>Done</option>
                </select>
              </div>
            </div>

            <div className='mt-[50px]'>
              <Button
                type='submit'
                disabled={loading}
                style={{
                  background:
                    'linear-gradient(102deg, #05E389 3.72%, #009A62 80.82%)'
                }}
                className='text-heading text-[18px] font-semibold w-[270px] h-[62px] px-8 py-3 rounded-lg flex items-center gap-2 capitalize'
              >
                {loading ? 'Updating Task...' : 'Update Task'}
                {!loading && (
                  <ArrowRight
                    className='shrink-0'
                    style={{ width: '26px', height: '26px' }}
                  />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}