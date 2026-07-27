'use client'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import React from 'react'

const Profile = () => {
  const { data: session, status } = useSession()
  return (
    <div className=' w-full min-h-screen overflow-hidden'>


      <div className=" mt-[50px] mx-auto relative backdrop-blur-lg border border-[#31324436] /20 card-2 rounded-3xl p-8 max-md:p-4 shadow-2xl max-w-md w-[90%] text-center">
       
        <div>
          {status !== 'loading' && session && (
            <div className='flex flex-col items-center justify-center'>
              <Image src={session.user?.image!} alt='profile' width={100} height={100} className='rounded-3xl w-24 h-24' />
              <h2 className='text-xl font-semibold '>{session.user?.name}</h2>
              <p className='text-gray-600 mt-5'>Signed as {session.user?.email}</p>
            </div>
          )}
        </div>

          <div className=' mt-5  '>
          <button className="w-fit mx-auto button-red whitespace-nowrap flex gap-3 cursor-pointer rounded-full font-bold p-3 px-5" 
          onClick={() => signOut()}> <LogOut /> Signout </button>
        </div>
      </div>
    
    </div>
  )
}

export default Profile