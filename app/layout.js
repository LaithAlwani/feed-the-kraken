import "./globals.css";
import styles from "./page.module.css";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Feed the Kraken App",
  description: "A Companion app for Feed the Kraken boardgame",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
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
          className={styles.logo}
        />
      </Link>
      <div className="navlinks">
        <UserButton />
      </div>
    </nav>
  );
};

