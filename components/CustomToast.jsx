import React from 'react'
import toast from 'react-hot-toast';

export default function CustomToast({ player }) {
  return toast.custom(
    <div className="custom-toast">
      <img src={player.avatar} alt="" className="avatar" />
      <p>{player.username} has recruited you!</p>
    </div>,
    { duration: 10000, id: player.id }
  );
}
