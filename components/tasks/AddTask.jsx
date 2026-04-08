'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useAuth } from '@/app/providers/AuthProvider'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AddTask() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedUserId: '',
    status: 'PENDING'
  })

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true)
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          throw new Error('Missing access token. Please login again.')
        }

        const res = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load users')
        }

        setUsers(Array.isArray(data) ? data : [])

        // Default to first non-admin user if available, else first user.
        const preferred =
          (Array.isArray(data) && data.find(u => u?.role !== 'ADMIN')) ||
          (Array.isArray(data) ? data[0] : null)

        if (preferred?.id) {
          setFormData(prev => ({ ...prev, assignedUserId: preferred.id }))
        }
      } catch (error) {
        toast.error(error.message || 'Failed to load users')
      } finally {
        setUsersLoading(false)
      }
    }

    if (user?.role === 'ADMIN') {
      fetchUsers()
    }
  }, [user?.role])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) {
        throw new Error('You must be logged in to create a task')
      }

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Missing access token. Please login again.')
      }

      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
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
        throw new Error(data.message || 'Failed to create task')
      }

      toast.success('Task created successfully!')
      router.push('/')
    } catch (error) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-[1320px] p-5 md:p-[30px] relative -top-14 z-100 rounded-[15px] shadow mx-auto bg-white'>
        <div className=''>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <h1 className='text-[24px] font-poppins font-semibold text-heading'>
              Add Your New Task
            </h1>
            <Link href="/">
              <Button className='w-[167px] h-[50px] cursor-pointer bg-primary text-heading text-[16px] font-semibold'>
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
                    onChange={handleChange}
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

                {/* Description */}
                <div>
                  <Label
                    htmlFor='description'
                    className='text-[16px] font-poppins font-semibold text-heading leading-[21.12px] tracking-[-0.32px] block mb-3'
                  >
                    Description
                  </Label>
                  <textarea
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

            <div className='mt-[216px]'>
              <Button
                type="submit"
                disabled={loading}
                style={{
                  background:
                    'linear-gradient(102deg, #05E389 3.72%, #009A62 80.82%)'
                }}
                className='text-heading cursor-pointer text-[18px] font-semibold w-[270px] h-[62px] px-8 py-3 rounded-lg flex items-center gap-2 capitalize'
              >
                {loading ? 'Creating Task...' : 'Add New Task'}
                {!loading && <ArrowRight
                  className='shrink-0'
                  style={{ width: '26px', height: '26px' }}
                />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}