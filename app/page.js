import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="hero">
        <Image
          src="https://funtails.de/wp-content/uploads/2022/09/feed-the-kraken-mobile-background-1.jpg"
          alt="hero"
          width={0}
          height={0}
          sizes="100vw"
          className="img"
        />
        <img src="https://funtails.de/wp-content/uploads/2020/01/ftk_logo_center.png" alt="" className="image-text" />
      </div>
      <div>
        <h3>A Companion App</h3>
        <SignedOut>
          <SignInButton className="btn" />
        </SignedOut>
        <SignedIn>
          <Link href={"/games"} className="btn btn-alt">
            Play
          </Link>
        </SignedIn>
      </div>
    </>
  );
}
