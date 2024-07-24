import React from "react";

export default function ChooseEvent({ chooseEvent}) {
  return (
    <>
      <button className="btn" onClick={()=>chooseEvent("recruit")}>Recruit</button>
      <button className="btn" onClick={()=>chooseEvent("give 3 guns")}>Distribute 3 Guns</button>
      
      
      <button className="btn btn-event" onClick={chooseEvent}>
        Choose Event
      </button>
    </>
  );
}
