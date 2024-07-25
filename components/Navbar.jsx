'use client'
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname()
  return (
    <nav>
      <Link href="/">
        <Image
          src="https://funtails.de/wp-content/uploads/2020/01/ftk_logo_center.png"
          alt="logo"
          width={140}
          height={60}
          className={`logo ${pathname === "/" ? "inverted-logo":""}`}
        />
      </Link>
      <div className="navlinks">
        <UserButton />
      </div>
    </nav>
  );
}
