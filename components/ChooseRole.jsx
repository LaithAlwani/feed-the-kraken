import { MdAnchor } from "react-icons/md";
import { FaGitkraken } from "react-icons/fa6";
import { GiPirateFlag } from "react-icons/gi";

export default function ChooseRole({chooseRole}) {
  return (
    <>
      <h3>please choose a role</h3>
      <span onClick={() => chooseRole("sailor")}>
        <MdAnchor size={128} color="#47a5cb" />
      </span>
      <span onClick={() => chooseRole("pirate")}>
        <GiPirateFlag size={128} color="#984141" />
      </span>
      <span onClick={() => chooseRole("cult leader")}>
        <FaGitkraken size={128} color="#cab81b" />
      </span>
    </>
  );
}
