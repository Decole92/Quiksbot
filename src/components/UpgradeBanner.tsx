import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
function UpgradeBanner() {
  return (
    <div className='fixed inset-0 bg-white opacity-50 z-10 dark:bg-gray-950'>
      <div className='flex items-center justify-center h-full'>
        <Card className='w-full max-w-md mx-auto'>
          <CardHeader className='text-center'>
            <div className='w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center'>
              <LockIcon className='h-6 w-6 text-amber-600' />
            </div>
            <CardTitle className='text-2xl font-bold text-gray-800'>
              Restricted Access
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='text-gray-600'>
              Only users on an active plan have access to this feature.
            </p>
          </CardContent>
          <CardFooter className='flex justify-center'>
            <Link href='/pricing'>
              <Button className='bg-[#E1B177] hover:bg-gray-900 text-white'>
                Upgrade Your Plan
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default UpgradeBanner;
