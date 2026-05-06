import "./globals.css";
import { Skranji } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const skranji = Skranji({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-skranji",
});

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
        <html lang="en" className={skranji.variable}>
          <body>
            <Toaster
              toastOptions={{
                style: {
                  background: "var(--color-bg-card)",
                  color: "var(--color-fg)",
                  border: "1px solid var(--color-border-strong)",
                },
              }}
            />
            <Navbar />
            <main
              className="flex w-full flex-col items-center"
              style={{
                paddingTop: "calc(5rem + env(safe-area-inset-top, 0px))",
                minHeight: "100svh",
              }}
            >
              {children}
            </main>
          </body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
