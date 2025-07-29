import React from 'react'

interface Props {
    fullName: string,
    xp: number ,
    profilePicture: string
}

function ProfileCard(props: Props) {
    const {fullName, xp=0, profilePicture} = props

    return (
       <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-48">
  <div className="flex flex-col items-center space-y-4 dark:hover:bg-gray-700 rounded-lg px-4 py-2 cursor-pointer">
    <img 
      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 dark:border-gray-600 left-0 top-0"
      src={profilePicture} 
      alt="Profile" 
    />
    <div>
      <p className="text-lg font-semibold text-gray-800 dark:text-white">{fullName}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Member since 2005</p>
    </div>
  </div>
  
  <div className="bg-blue-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center">
      <span className="mr-2">🌟</span> 
      <span>Total XP: {xp}</span>
    </p>
  </div>
</div>
    )
}

export default ProfileCard
