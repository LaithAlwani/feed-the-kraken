"use client";
import Image from "next/image";
import { useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function CurrentPlayer({ currentPlayer }) {
  const { avatar, username, role } = currentPlayer;
  console.log(username);
  const [visible, setVisible] = useState(true);

  const toggleRole = () => {
    const target = document.getElementById("current-player");
    if (visible) {
      target.classList.remove(role?.split(" ")[0]);
    } else {
      target.classList.add(role?.split(" ")[0]);
    }
    setVisible(!visible);
  };
  return (
    currentPlayer && (
      <div className="current-player" onClick={toggleRole}>
        <div className="current-player-img-wrapper">
          <Image src={avatar} id="current-player" fill className={role?.split(" ")[0]} />
        </div>
        <p>{username} </p>
        <span>{visible ? <IoMdEyeOff size={24} /> : <IoMdEye size={24} />}</span>
      </div>
    )
  );
}
