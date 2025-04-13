import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import Providers from "./providers";
import "./highlight.languages";
import "react-toastify/dist/ReactToastify.css";
import "react-tabs/style/react-tabs.css";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chat App",
  description: "Its just a chat app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black-600">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/easymde/dist/easymde.min.css"
        />
        <script
          src="//cdn.temasys.io/adapterjs/0.15.x/adapter.min.js"
          async
        ></script>
        <script
          src="https://unpkg.com/twemoji@latest/dist/twemoji.min.js"
          async
        ></script>
      </head>
      <body className={openSans.className}>
        <main className="flex h-screen">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
