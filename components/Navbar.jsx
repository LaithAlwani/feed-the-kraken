"use client";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed top-0 z-10 flex w-full items-center justify-between bg-bg/95 px-4 py-3 backdrop-blur-md border-b border-border"
      style={{
        paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <Link href="/" aria-label="Home">
        <Image
          src="https://funtails.de/wp-content/uploads/2020/01/ftk_logo_center.png"
          alt="Feed the Kraken"
          width={120}
          height={50}
          priority
          className={
            pathname === "/"
              ? "filter-[invert(1)_drop-shadow(0_0_0.3rem_rgba(255,255,255,0.4))]"
              : ""
          }
        />
      </Link>
      <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
    </nav>
  );
}
