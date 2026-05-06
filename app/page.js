import { Show, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full">
      <Image
        src="https://funtails.de/wp-content/uploads/2022/09/feed-the-kraken-mobile-background-1.jpg"
        alt="hero"
        width={0}
        height={0}
        sizes="100vw"
        className="block w-full h-[calc(100svh-4rem)] object-cover"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-fg text-center bg-linear-to-b from-bg/55 to-bg/85">
        <h1 className="m-0 text-4xl tracking-[0.094rem]">A Companion App</h1>
        <Show when="signed-out">
          <SignInButton className="btn" />
        </Show>
        <Show when="signed-in">
          <Link href="/games" className="btn btn-alt">
            Play
          </Link>
        </Show>
      </div>
      <span className="absolute bottom-4 inset-x-0 text-center text-fg-dim text-xs">
        Made By Laith Alwani
      </span>
    </div>
  );
}
