import { Calendar, Clock, Mail, User, Award } from "lucide-react";

export default function AppointmentConfirmation({ data }: { data: any }) {
  return (
    <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-7 '>
      <div className='text-center mb-4'>
        <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          Appointment Confirmed! 🎉
        </h3>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Your booking has been successfully scheduled
        </p>
      </div>

      <div className='space-y-3 text-gray-700 dark:text-gray-300'>
        <div className='flex items-center gap-2'>
          <div className='w-5 text-gray-500 dark:text-gray-400 flex-shrink-0'>
            <Award className='w-5 h-5' />
          </div>
          <div>
            <p className='font-medium'>{data.service_type}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='w-5 text-gray-500 dark:text-gray-400 flex-shrink-0'>
            <Calendar className='w-5 h-5' />
          </div>
          <div>
            <p>{data.appointment_date}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='w-5 text-gray-500 dark:text-gray-400 flex-shrink-0'>
            <Clock className='w-5 h-5' />
          </div>
          <div>
            <p>{data.appointment_time}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='w-5 text-gray-500 dark:text-gray-400 flex-shrink-0'>
            <User className='w-5 h-5' />
          </div>
          <div>
            <p>{data.user_name}</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='w-5 text-gray-500 dark:text-gray-400 flex-shrink-0'>
            <Mail className='w-5 h-5' />
          </div>
          <div>
            <p>{data.user_email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
