'use client'
 import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
 import React from 'react'

const Navbar = () => {
    const { data, status } = useSession();
     
    return (
        <div className='flex fixed top-0 left-0 w-full backdrop-blur-2xl z-[30] justify-between shadow border-b  bordercolor h-[60px] items-center p-5 max-md:p-3   '>
            {<Link href={`${data?.user ? "/" : '/'}`} className='  text text-transparent text-2xl center gap-2 max-md:text-lg whitespace-nowrap textbase font-bold'>
                <p className="textbg">Super bot</p>
            </Link>}
            {
                status !== 'loading' && data ? <div className='center gap-2 max-md:gap-1'>

                     

                    <Link href={`/profile`}>
                        <Image loading='lazy' src={data.user.image!} alt="User Avatar" width={40} height={40} className=' max-md:w-8  rounded-full' />
                    </Link>


                </div> :
                    status !== 'loading' && <Link href="/sign-in" className="buttonbg p-2 px-6">
                        Sign In
                    </Link>
            }

        </div>
    )
}

export default Navbar