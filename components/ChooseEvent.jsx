import React from "react";

export default function ChooseEvent({setEvent, chooseEvent}) {
  return (
    <>
      <select onChange={(e) => setEvent(e.target.value)}>
        <option value="">Choose Event</option>
        <option value="recruit">Recruit</option>
        <option value="give 3 guns">Give 3 guns</option>
        {/* <option value="check navigation team">Check Navigation Team</option> */}
      </select>
      <button className="btn btn-event" onClick={chooseEvent}>
        Choose Event
      </button>
    </>
  );
}
