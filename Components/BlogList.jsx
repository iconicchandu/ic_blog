import { blog_data } from '@/Assets/assets'
import React, { useEffect, useState } from 'react'
import BlogItem from './BlogItem'
import axios from 'axios';

export const BlogList = () => {

    const [menu,setMenu] = useState("All");
    const [blogs,setBlogs] = useState([]);
    const fetchBlogs = async () =>{
        const response = await axios.get('/api/blog');
         // 🔥 Sort blogs in descending order (latest first)
    const sortedBlogs = response.data.blogs.sort(
      (a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
    );

    setBlogs(sortedBlogs);
    console.log(sortedBlogs);
  };


    useEffect(()=>{
        fetchBlogs();
    },[])


    return (
        <div>
            <div className='flex justify-center gap-6 my-10'>
                <button onClick={() => setMenu('All')} className={menu === "All" ? 'bg-black text-white py-1 px-4 rounded-lg' : ""}>All</button>
                <button onClick={() => setMenu('Technology')} className={menu === "Technology" ? 'bg-black text-white py-1 px-4 rounded-lg' : ""}>Technology</button>
                <button onClick={() => setMenu('Startup')} className={menu === "Startup" ? 'bg-black text-white py-1 px-4 rounded-lg' : ""}>Startup</button>
                <button onClick={() => setMenu('Lifestyle')} className={menu === "Lifestyle" ? 'bg-black text-white py-1 px-4 rounded-lg' : ""}>Lifestyle</button>
            </div>
            <div className='flex flex-wrap justify-around gap-2 gap-y-10 mb-16 xl:mx-24'>
                {blogs.filter((item)=> menu==="All"?true:item.category===menu).map((item, index) => {
                    return <BlogItem key={index} id={item._id} image={item.image} title={item.title} description={item.description} category={item.category} />
                })}
            </div>
        </div>
    )
}
