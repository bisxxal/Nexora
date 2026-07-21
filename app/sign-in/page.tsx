'use client'
import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowLeft, Shield, Users, Zap, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

const SignInPage = () => {
  const { data, status } = useSession();

  const router = useRouter()
  if (data?.user && status === 'authenticated') {
    router.push('/dashboard');
  }


  return (
    <div className="min-h-screen flex text-[#111827]"  >
 
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            className="flex absolute top-10 left-10   bg-[#ffffff1a] rounded-full p-2   group"
            onClick={() => window.history.back()}
          >
            <ArrowLeft fill='white' size={20} className=" group-hover:-translate-x-1 transition-transform duration-300" />
          </button>

          {/* Logo and Title */}
          <div className="text-center mb-8 appeartext ">
            <div className="flex items-center justify-center ">
              <Link href={'/'} className="  buttonbg  flex items-center justify-center  ">
                <img className=' w-40 h-45  drop-shadow-[-3px_2px_0px_#28362e66] ' src="/logo2.png" alt="" />

              </Link>
            </div>
             
                <h1 className='text-[#17221d]! text-6xl [text-shadow:-3px_2px_1px_#0000004d] whitespace-nowrap'> Welcome back</h1>
            <p className="text-gray-400 mt-2">Sign in to your Nexora account</p>
          </div>

          {/* Sign In Card */}
          <div className="  bg-[#E2F4A4] rounded-3xl  relative shadow-[-3px_2px_1px_#0000005e] p-8 ">

  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-px top-0 z-0 flex h-12 w-full max-w-[min(267px,calc(100vw-2rem))] items-start justify-center">
        <svg viewBox="0 0 85 64" fill="#F6F5EF" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto shrink-0 translate-x-px translate-y-px overflow-visible"><rect x="0" y="0" width="85" height="1" fill="#F6F5EF" transform="translate(0, -1)"></rect><path d="M50 45C57.3095 56.6952 71.2084 63.9997 85 64V0H0C13.7915 0 26.6905 7.30481 34 19L50 45Z" fill="#F6F5EF"></path></svg>
        <div className=" relative z-10 h-[calc(100%+1px)] min-w-0 grow   bg-[#F6F5EF]"></div>
        <svg viewBox="0 0 85 64" fill="#F6F5EF" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto shrink-0 -translate-x-px translate-y-px -scale-x-100 overflow-visible"><rect x="0" y="0" width="85" height="1" fill="#F6F5EF" transform="translate(0, -1)"></rect><path d="M50 45C57.3095 56.6952 71.2084 63.9997 85 64V0H0C13.7915 0 26.6905 7.30481 34 19L50 45Z" fill="#F6F5EF"></path>
        </svg>
      </div>


            <div className="text-center mt-10 mb-6">
              <h1 className="text-xl font-semibold text-[#28362E]! mb-2"><em>Sign in with Google</em></h1>
             </div>

            {/* Google Sign In Button */}
            <button
              onClick={() => signIn('google')}
              className={`w-full flex items-center justify-center px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg  
                }`}
            >

              <>
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>

            </button>

            {/* Security Note */}
            <div className="mt-6 p-4 border bg-[#28362E]  backdrop-blur-3xl  rounded-xl">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-[#48f291] mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#9bceb1] font-medium mb-1">Secure Authentication</p>
                  <p className="text-xs text-[#909391]">We use Google OAuth 2.0 for secure access. Your Google password is never shared with us.</p>
                </div>
              </div>
            </div>

          </div>


          <div className="mt-8 text-center">
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-400 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default SignInPage;


