import React from "react";
import { Button } from "../ui/button";
// w-[600px]

function SuggestItems({ firstQuestion }: { firstQuestion: FirstQuestion[] }) {
  return (
    <div className='w-full p-5'>
      <ul className='flex flex-nowrap gap-3 w-full overflow-x-auto hide-scrollbar'>
        {firstQuestion?.map((question) => (
          <li key={question?.id} className='flex-shrink-0'>
            <Button
              variant={"ghost"}
              className='rounded-full px-4 py-2 whitespace-nowrap hover:bg-muted border'
            >
              {question.question}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default SuggestItems;
