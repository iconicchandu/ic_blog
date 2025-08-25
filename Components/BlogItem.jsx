import { assets, blog_data } from '@/Assets/assets'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const BlogItem = ({title,description,category,image,id}) => {
  return (
    <div className='max-w-[330px] sm:max-w-[300px] bg-white border border-black hover:shadow-[-7px_7px_0px_black]'>
        <Link href={`/blogs/${id}`}>
         <div className="relative w-[300px] h-[200px]">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover border-b border-black w-[100%]"
          />
        </div>
        </Link>
        <p className='ml-5 mt-5 px-1 py-0.5 inline-block bg-black text-white text-sm rounded-sm'>{category}</p>
        <div className='p-5'>
            <h5 className='mb-2 text-lg font-medium tracking-tight text-gray-900'>{title}</h5>
            <p className='mb-3  text-sm tracking-tight text-gray-700' dangerouslySetInnerHTML={{__html:description.slice(0,120)}}></p>
            <Link href={`/blogs/${id}`}><div className='inline-flex items-center py-2 font-semibold text-center'>
                Read more <Image src={assets.arrow} className='ml-2' alt='' width={12}/>
            </div></Link>
        </div>
    </div>
  )
}

export default BlogItem