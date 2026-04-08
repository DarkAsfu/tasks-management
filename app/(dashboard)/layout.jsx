import ProtectedRoute from "@/components/auth/ProtectedRoute";


export default function RootLayout ({ children }) {
  return (
    <>
      <ProtectedRoute>{children}</ProtectedRoute>
    </>
  )
}
