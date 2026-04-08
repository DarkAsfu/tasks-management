import React from 'react'
import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute'
import AuditLogs from '@/components/audit/AuditLogs'

const page = () => {
  return (
    <AdminProtectedRoute redirectTo='/'>
      <div>
        <AuditLogs />
      </div>
    </AdminProtectedRoute>
  )
}

export default page
