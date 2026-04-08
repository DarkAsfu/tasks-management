'use client'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useAuth } from "@/app/providers/AuthProvider"


export default function LoginPage() {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login({
        email: formData.email,
        password: formData.password
      })
      
      if (formData.remember) {
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (email, password) => {
    setFormData(prev => ({
      ...prev,
      email,
      password
    }))
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden flex-1 bg-[#040612] md:flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-[200px] w-[400px] -translate-x-1/4 -translate-y-1/4 rounded-full bg-primary opacity-50 blur-[110px]"></div>
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-primary opacity-50 blur-[80px]"></div>
        
        <div className="z-10">
          <Image
            src="/login.png"
            alt="Team collaboration illustration"
            width={500}
            height={477}
            priority
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-[40px] font-semibold text-heading font-poppins leading-[52.8px] tracking-[-0.8px]">
              Login
            </h1>
            <p className="text-[14px] text-subtext font-medium leading-[26.24px] font-poppins">
              Welcome Back, Please Enter your Details to Log In.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-heading">Quick Login Credentials</p>
            <div className="flex items-center justify-between gap-3 rounded-md bg-white border border-gray-100 px-3 py-2">
              <div className="text-sm">
                <p className="font-medium text-heading">Admin</p>
                <p className="text-subtext">admin@test.com / admin123</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3"
                onClick={() => fillCredentials('admin@test.com', 'admin123')}
              >
                Use
              </Button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md bg-white border border-gray-100 px-3 py-2">
              <div className="text-sm">
                <p className="font-medium text-heading">User</p>
                <p className="text-subtext">user@test.com / user123</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3"
                onClick={() => fillCredentials('user@test.com', 'user123')}
              >
                Use
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-heading">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter you email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-heading">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={formData.remember}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    remember: checked
                  }))}
                />
                <Label htmlFor="remember" className="text-[16px] font-normal text-subtext">
                  Remember me
                </Label>
              </div>
              <Link 
                href="/reset-password" 
                className="text-[16px] font-normal text-subtext hover:text-gray-800"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit"
              className="w-full bg-primary hover:bg-primary/50 text-white font-medium rounded-md transition-colors text-[18px] py-6"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-[16px] text-subtext">
                Do not have an account?{" "}
                <Link href="/signup" className="font-medium text-heading hover:text-heading/90">
                  Sign Up
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}