import { FaGitkraken } from "react-icons/fa";
import { GiCrossedPistols } from "react-icons/gi";

export default function ChooseEvent({ chooseEvent }) {
  return (
    <>
      <div className="event-card" onClick={() => chooseEvent("recruit")}>
        <FaGitkraken size={128}/>
        <h2>Recruit</h2>
      </div>
      <div className="event-card" onClick={() => chooseEvent("give 3 guns")}>
        <GiCrossedPistols size={128}/>
        <h2>Distribute Guns</h2>
      </div>
      
    </>
  );
}
