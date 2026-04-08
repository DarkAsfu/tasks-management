'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronDown, ChevronUp, History, RefreshCw } from 'lucide-react'
import Link from 'next/link'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const formatActionLabel = (actionType = '') => {
  return actionType
    .toString()
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getActionBadgeClasses = (actionType = '') => {
  const type = actionType.toUpperCase()
  if (type.includes('CREATE')) return 'text-green-700 border-green-200'
  if (type.includes('UPDATE')) return 'text-orange-700 border-orange-200'
  if (type.includes('DELETE')) return 'text-red-700 border-red-200'
  return 'text-purple-700 border-purple-200'
}

const getActionFilterKey = (actionType = '') => {
  const type = actionType.toUpperCase()
  if (type.includes('CREATE')) return 'create'
  if (type.includes('UPDATE')) return 'update'
  if (type.includes('DELETE')) return 'delete'
  return 'other'
}

const isWithinRange = (dateValue, range) => {
  if (range === 'all') return true
  const created = new Date(dateValue).getTime()
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  if (range === 'today') return now - created <= oneDay
  if (range === '7d') return now - created <= oneDay * 7
  if (range === '30d') return now - created <= oneDay * 30
  return true
}

const getChangedFields = (beforeData, afterData) => {
  if (!beforeData || !afterData) return []
  const keys = Array.from(new Set([...Object.keys(beforeData), ...Object.keys(afterData)]))
  return keys.filter((key) => JSON.stringify(beforeData[key]) !== JSON.stringify(afterData[key]))
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [expandedRows, setExpandedRows] = useState({})

  const fetchLogs = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      else setRefreshing(true)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Missing access token. Please login again.')
      }

      const res = await axios.get(`${API_BASE_URL}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setLogs(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch audit logs')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLogs(true)
  }, [])

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return logs.filter((log) => {
      const actorName = log?.actor?.name?.toLowerCase() || ''
      const actorEmail = log?.actor?.email?.toLowerCase() || ''
      const actionType = log?.actionType?.toLowerCase() || ''
      const targetId = log?.targetId?.toLowerCase() || ''
      const matchesSearch =
        !keyword ||
        actorName.includes(keyword) ||
        actorEmail.includes(keyword) ||
        actionType.includes(keyword) ||
        targetId.includes(keyword)
      const matchesAction =
        actionFilter === 'all' || getActionFilterKey(log?.actionType) === actionFilter
      const matchesDate = isWithinRange(log?.createdAt, dateFilter)

      return matchesSearch && matchesAction && matchesDate
    })
  }, [logs, search, actionFilter, dateFilter])

  const toggleExpanded = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-[1320px] p-5 md:p-[30px] relative -top-14 z-100 rounded-[15px] shadow mx-auto bg-white'>
        <div className='md:flex items-center justify-between mb-8 gap-4'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Audit Logs</h1>
            <p className='text-subtext mt-1'>Track task activity history from backend logs</p>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search actor, action, target id'
              className='w-full md:w-[300px] h-[50px]'
            />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className='w-full sm:w-[150px] h-[50px] px-3 border border-gray-200 rounded-md bg-white text-sm'
            >
              <option value='all'>All Actions</option>
              <option value='create'>Create</option>
              <option value='update'>Update</option>
              <option value='delete'>Delete</option>
              <option value='other'>Other</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className='w-full sm:w-[140px] h-[50px] px-3 border border-gray-200 rounded-md bg-white text-sm'
            >
              <option value='all'>All Time</option>
              <option value='today'>Today</option>
              <option value='7d'>Last 7 Days</option>
              <option value='30d'>Last 30 Days</option>
            </select>

            <Button
              onClick={() => fetchLogs(false)}
              disabled={refreshing}
              className='h-[50px] bg-primary text-heading'
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className='text-center text-gray-500 py-8'>Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className='text-center py-12'>
            <History className='w-12 h-12 mx-auto text-gray-400 mb-4' />
            <p className='text-heading text-[24px] font-poppins font-semibold mb-4'>
              No audit logs found
            </p>
            <Link href='/dashboard'>
              <Button className='bg-primary text-heading'>Back to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {filteredLogs.map((log) => (
              <Card key={log.id} className='bg-white shadow-sm hover:shadow-md transition-shadow'>
                <CardContent className='p-6'>
                  <div className='flex items-start justify-between gap-4 mb-4'>
                    <div>
                      <h3 className='font-semibold text-[#161616] font-poppins text-[18px]'>
                        {log?.actor?.name || 'Unknown Actor'}
                      </h3>
                      <p className='text-subtext text-sm'>{log?.actor?.email || 'No email'}</p>
                    </div>
                    <Badge
                      variant='outline'
                      className={`${getActionBadgeClasses(log?.actionType)} bg-transparent`}
                    >
                      {formatActionLabel(log?.actionType)}
                    </Badge>
                  </div>

                  <div className='space-y-2 mb-4'>
                    <p className='text-[14px] text-subtext'>
                      <span className='font-semibold text-heading'>Role:</span> {log?.actor?.role || 'N/A'}
                    </p>
                    <p className='text-[14px] text-subtext break-all'>
                      <span className='font-semibold text-heading'>Target ID:</span> {log?.targetId || 'N/A'}
                    </p>
                  </div>

                  {getActionFilterKey(log?.actionType) === 'update' &&
                    getChangedFields(log?.beforeData, log?.afterData).length > 0 && (
                      <div className='mb-4 p-3 rounded-lg border border-orange-100 bg-orange-50/40'>
                        <p className='text-xs font-semibold text-heading mb-2'>Changed Fields</p>
                        <div className='flex flex-wrap gap-2'>
                          {getChangedFields(log?.beforeData, log?.afterData).map((field) => (
                            <Badge key={field} variant='outline' className='text-orange-700 border-orange-200'>
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className='mb-4'>
                    <Button
                      variant='outline'
                      onClick={() => toggleExpanded(log.id)}
                      className='h-9 text-xs'
                    >
                      {expandedRows[log.id] ? (
                        <>
                          <ChevronUp className='w-4 h-4 mr-2' />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className='w-4 h-4 mr-2' />
                          Show Details
                        </>
                      )}
                    </Button>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4'>
                    <div className='bg-gray-50 rounded-lg p-3 border border-gray-100'>
                      <p className='text-xs font-semibold text-heading mb-2'>Before Data</p>
                      {expandedRows[log.id] ? (
                        <pre className='text-xs leading-5 text-heading whitespace-pre-wrap break-all max-h-[260px] overflow-auto'>
                          {log?.beforeData ? JSON.stringify(log.beforeData, null, 2) : 'N/A'}
                        </pre>
                      ) : (
                        <p className='text-xs text-subtext'>Hidden - click "Show Details"</p>
                      )}
                    </div>
                    <div className='bg-gray-50 rounded-lg p-3 border border-gray-100'>
                      <p className='text-xs font-semibold text-heading mb-2'>After Data</p>
                      {expandedRows[log.id] ? (
                        <pre className='text-xs leading-5 text-heading whitespace-pre-wrap break-all max-h-[260px] overflow-auto'>
                          {log?.afterData ? JSON.stringify(log.afterData, null, 2) : 'N/A'}
                        </pre>
                      ) : (
                        <p className='text-xs text-subtext'>Hidden - click "Show Details"</p>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-2 text-heading text-sm font-poppins'>
                    <Calendar className='w-4 h-4' />
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
