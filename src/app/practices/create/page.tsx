// name, description, type, price, duration, tags

'use client'
import React from 'react'
import PracticeForm from '@/components/forms/PracticeForm';

const AddPractice = () =>{
  
return(
  <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-800'>
    <PracticeForm/>
  </div>
)


}

export default AddPractice;