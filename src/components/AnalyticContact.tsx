import React from "react";
import Stats from "./Stats";
import ContactList from "./Contact";

function AnalyticContact() {
  return (
    <div className='w-full grid grid-cols-1 '>
      <Stats />
      <ContactList />
    </div>
  );
}

export default AnalyticContact;
