
import "./globals.css";
import styles from "./page.module.css";
import  { Toaster } from "react-hot-toast";
import { ClerkProvider,  } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";


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


