"use client";
import Link from "next/link";
import {  useState } from "react";


export default function Home() {
  const [username, setUsername] = useState();

  return (
    <>
      <div className="hero">
        <Link href="/">
          <img src="https://funtails.de/wp-content/uploads/2020/01/ftk_logo_center.png" alt="" />
        </Link>
        {/* <img src="	https://funtails.de/wp-content/uploads/2022/09/feed-the-kraken-mobile-background-1.jpg" alt="" /> */}
      </div>
      <div>
        <h3>A Companion App</h3>
        {/* <Link href="/games/create" className="btn">
          Create Room
        </Link> */}
        <input type="text" placeholder="username" onChange={(e)=>setUsername(e.target.value)} />
        <Link href={{pathname:"/games/1", query:{username}}} className="btn btn-alt">
          Join
        </Link>
      </div>
    </>
  );
}
