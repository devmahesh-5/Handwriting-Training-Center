// name, description, type, price, duration, tags

'use client'
import React from 'react'
import CourseForm from '@/components/forms/CourseForm';

const AddCourse = () =>{
  
return(
  <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800'>
    <CourseForm/>
  </div>
)


}

export default AddCourse;