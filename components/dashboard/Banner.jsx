"use client"
import { useAuth } from "@/app/providers/AuthProvider"

const Banner = () => {
  const {user} = useAuth();
    return (
      <div className='w-full h-[306px] relative overflow-hidden'>
        {/* Background elements */}
        <div className='absolute inset-0 bg-[#040612] z-0' />
        <div
          className='absolute inset-0 bg-right-bottom bg-no-repeat bg-contain mix-blend-soft-light z-40'
          style={{
            backgroundImage: "url('/login.png')"
          }}
        />
        <div className='absolute top-0 left-0 h-[200px] w-[400px] -translate-x-[30%] -translate-y-[30%] rounded-full bg-primary opacity-50 blur-[110px] z-30 pointer-events-none' />
        <div className='absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-[30%] translate-y-[30%] rounded-full bg-primary opacity-50 blur-[80px] z-30 pointer-events-none' />
        
        <div className='relative z-50 h-full flex flex-col justify-center items-start max-w-[1320px] mx-auto md:mt-[35px] px-2 2xl:px-0'>
          <h1 className='text-primary text-[24px] font-semibold font-poppins leading-[31.68px] tracking-[-0.48px]'>
          Hi {user?.name}
          </h1>
          <h1 className='text-white text-[40px] font-semibold font-poppins leading-[52.8px]'>
            Welcome to Dashboard
          </h1>
        </div>
      </div>
    )
  }
  
  export default Banner