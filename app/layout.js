import "./globals.css";
import styles from "./page.module.css";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import ConvexClientProvider from "@/components/ConvexClientProvider";

export const metadata = {
  title: "Feed the Kraken App",
  description: "A Companion app for Feed the Kraken boardgame",
  generator: "Next.js",
  keywords: ["nextjs", "boardgames", "feed the kraken", "companion app"],
  authors: [
    {
      name: "Laith Alwani",
      url: "https://www.linkedin.com/in/laith-alwani/",
    },
  ],
  icons: [
    { rel: "apple-touch-icon", url: "/kraken.png" },
    { rel: "icon", url: "/kraken.png" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <html lang="en">
          <body>
            <Toaster />
            <Navbar />
            <main className={styles.main}>{children}</main>
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
