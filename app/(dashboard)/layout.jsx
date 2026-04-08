import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Banner from "@/components/dashboard/Banner";
import Navbar from "@/components/dashboard/Navbar";


export default function RootLayout({ children }) {
    return (
        <>
            <ProtectedRoute>
                <Navbar />
                <Banner />
                {children}
            </ProtectedRoute>
        </>
    )
}
