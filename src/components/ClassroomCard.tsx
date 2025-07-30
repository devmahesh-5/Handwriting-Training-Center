import React from 'react'

interface Props {
    title: string,
    xp: number,
    duration: string,

}

function ClassroomCard(props: Props) {
    const {title, xp, duration} = props

    return (
        <div className="w-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 rounded-xl border border-gray-100 dark:border-gray-700 p-5 mb-4 flex flex-row items-center justify-between py-4 px-6 h-48">
    <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h2>
        <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
  <div 
    className="absolute top-0 left-0 h-full bg-[#6C48E3] rounded-full animate-pulse"
    style={{ width: `${(xp/1000)*100}%` }}
  ></div>
</div>
        <div className="flex items-center space-x-4 mt-6">
            <p className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="mr-1">🌟</span> {xp} XP
            </p>
            <p className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="mr-1">⏱️</span> {duration}
            </p>
        </div>
    </div>
    <div className="ml-4">
        <button className="bg-[#6C48E3] hover:bg-[#5A3BC9] text-white py-2 px-5 rounded-lg font-medium transition-colors duration-200 flex items-center">
            Continue <span className="ml-2">→</span>
        </button>
    </div>
</div>
    )
}

export default ClassroomCard
