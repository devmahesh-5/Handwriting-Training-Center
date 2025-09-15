'use client'

import React, { useState, useEffect } from 'react'

export default function Loading({message}: {message: string | null}) {

    const tips = [
        "Hold your pen comfortably – not too tight, not too loose. A relaxed grip reduces hand fatigue.",
        "Maintain good posture: sit up straight with both feet flat on the floor for better control.",
        "Practice consistent letter slant (either straight, forward, or backward) for uniform appearance.",
        "Keep your letters properly spaced – not too crowded, not too far apart.",
        "Use guidelines or lined paper to maintain consistent letter size and alignment.",
        "Slow down! Writing too quickly often leads to messy handwriting.",
        "Practice basic strokes first – curves, lines, and circles form the foundation of all letters.",
        "Experiment with different writing instruments to find what feels most comfortable in your hand.",
        "Take regular breaks during practice sessions to prevent hand cramping and fatigue.",
        "Be patient and consistent – handwriting improvement takes regular practice over time."
    ];

    const [currentTip, setCurrentTip] = useState('');

    useEffect(() => {
        // Show a random tip when component mounts
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setCurrentTip(randomTip);

        // Optional: Rotate tips every few seconds
        const interval = setInterval(() => {
            const newTip = tips[Math.floor(Math.random() * tips.length)];
            setCurrentTip(newTip);
        }, 4000); // Change tip every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-30">
                {/* Floating circles */}
                <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-blue-200 rounded-full opacity-70 
                                animate-[float_8s_ease-in-out_infinite]"></div>
                <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-purple-200 rounded-full opacity-60 
                                animate-[float_8s_ease-in-out_infinite_1s]"></div>
                <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-indigo-200 rounded-full opacity-50 
                                animate-[float_8s_ease-in-out_infinite_2s]"></div>

                {/* Moving lines */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent 
                                animate-[moveLine_3s_linear_infinite]"></div>
                <div className="absolute top-20 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-300 to-transparent 
                                animate-[moveLine_3s_linear_infinite_1s]"></div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                        {/* Animated logo/icon */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl 
                                        animate-pulse shadow-lg"></div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 animate-pulse">
                        {message || "Bringing you closer to perfect handwriting..."}
                    </h1>
                    <p className="text-gray-600 animate-pulse dark:text-gray-400">
                        Preparing everything for you...
                    </p>
                </div>

                {/* Progress bar */}
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-8 dark:bg-gray-700">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 
                                    animate-[progress_2s_ease-in-out_infinite] rounded-full dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-600"></div>
                </div>

                {/* Rotating tips */}
                <div className="max-w-md text-center ">
                    <div className="animate-pulse text-sm text-gray-500 dark:text-gray-400">
                        <p>Tip: {currentTip}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

