"use client";
import { Progress } from "@/components/ui/progress";
import useSubcription from "@/hook/useSubscription";
import { Zap } from "lucide-react";

interface AICreditBarProps {
  totalCredits: number;
  usedCredits: number;
}

export default function CreditBar() {
  const {
    hasActiveMembership,
    isOverFileLimit,
    loading,
    usedCredits,
    totalCredits,
    isOverCreditLimit,
  } = useSubcription();

  if (loading) {
    return <div>Loading...</div>;
  }

  const remainingCredits = totalCredits - usedCredits;
  const percentageUsed = (usedCredits / totalCredits) * 100;

  return (
    <div className='md:col-span-3 lg:col-span-3 col-span-5 '>
      <div className='hidden md:inline-flex lg:inline-flex items-center justify-between  gap-5'>
        <div className='flex items-center space-x-2 '>
          <Zap className='w-4 h-4 text-yellow-400' />
          <span className='font-semibold text-sm text-gray-700'>
            AI Credits
          </span>
        </div>
        <span className='text-sm font-medium text-gray-600'>
          {usedCredits} / {totalCredits}
        </span>
      </div>
      <Progress
        value={percentageUsed}
        className='hidden  md:inline-block lg:inline-block h-2 bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200'
      >
        <div
          className='h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500 ease-in-out'
          style={{ width: `${percentageUsed}%` }}
        />
      </Progress>
      <p className=' text-xs text-gray-500 text-center'>
        {remainingCredits} credits remaining
      </p>
    </div>
  );
}
