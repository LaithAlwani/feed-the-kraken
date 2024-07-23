import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="hero">
        {/* <img src="https://funtails.de/wp-content/uploads/2020/01/ftk_logo_center.png" alt="" /> */}
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
