"use client";
import { useState } from "react";

export default function CreditBar() {
  const [score, setScore] = useState(10);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScore(Number(e.target.value));
  };

  const getScoreColor = (score: number) => {
    if (score <= 4) return "bg-emerald-500"; // Highest score, use green
    if (score <= 8) return "bg-green-500"; // Slightly lower, use lighter green
    if (score <= 12) return "bg-yellow-500"; // Mid range, use yellow
    if (score <= 16) return "bg-orange-500"; // Lower range, use orange
    return "bg-red-500"; // Lowest range, use red
  };

  const getScoreLabel = (score: number) => {
    if (score <= 4) return "Excellent";
    if (score <= 8) return "Very Good";
    if (score <= 12) return "Good";
    if (score <= 16) return "Fair";
    return "Poor";
  };

  return (
    <div className='w-full md:max-w-[200px] lg:max-w-[200px] md:mx-auto p-2 space-y-4'>
      <div className='relative h-3 rounded-full overflow-hidden'>
        <div className='absolute inset-0 flex'>
          <div className='flex-1 bg-emerald-500'></div> {/* Highest */}
          <div className='flex-1 bg-green-500'></div>
          <div className='flex-1 bg-yellow-500'></div>
          <div className='flex-1 bg-orange-500'></div>
          <div className='flex-1 bg-red-500'></div> {/* Lowest */}
        </div>
        <div
          className='absolute top-0 bottom-0 w-1 bg-white'
          style={{ left: `calc(${(score / 22) * 100}% - 2px)` }}
        ></div>
      </div>
    </div>
  );
}
