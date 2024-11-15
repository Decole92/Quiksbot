"use client";
import React, { useState } from "react";

import DraftComponent from "./Draft/DraftComponent";

export default function EmailDraft({ integrate }: { integrate: boolean }) {
  return (
    <div className='bg-white dark:bg-gray-900 dark:text-gray-400 rounded-lg shadow-sm p-6 w-full'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
          New Campaign
        </h2>
      </div>

      <div className='space-y-4 w-full '>
        <DraftComponent integrate={integrate} />
      </div>
    </div>
  );
}
