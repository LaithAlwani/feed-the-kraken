import { Skranji } from "next/font/google";
import "./globals.css";
import styles from "./page.module.css";
import { Toaster } from "react-hot-toast";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

const skranji = Skranji({
  weight: '400',
  weight: '700',
  subsets: ["latin"]
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={skranji.className}>
          <Toaster />
          <Navbar />
          <main className={styles.main}>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}

const Navbar = () => {
  return (
    <nav>
      <Link href="/">
        <Image
          src="https://funtails.de/wp-content/uploads/2020/01/ftk_logo_center.png"
          alt="logo"
          width={150}
          height={60}
        />
      </Link>
      <div className="navlinks">
        <UserButton />
      </div>
    </nav>
  );
};
