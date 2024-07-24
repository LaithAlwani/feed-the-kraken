
import "./globals.css";
import styles from "./page.module.css";
import  { Toaster } from "react-hot-toast";
import { ClerkProvider,  } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";


export const metadata = {
    title: "Feed the Kraken App",
  description: "A Companion app for Feed the Kraken boardgame",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["nextjs", "next14", "pwa", "next-pwa"],
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#fff" }],
  authors: [
    {
      name: "imvinojanv",
      url: "https://www.linkedin.com/in/imvinojanv/",
    },
  ],
  viewport:
    "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  icons: [
    { rel: "apple-touch-icon", url: "/kraken.png" },
    { rel: "icon", url: "/kraken.png" },
  ],
};

// export const metadata = {

// };

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


