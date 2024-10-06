import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import React from "react";

import { UserProvider } from "@auth0/nextjs-auth0/client";

export const metadata = {
  title: "JobSeek v1",
  description: "A small project to automate job search.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <UserProvider>
        <head>
          <title>JobSeek V1</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <link
            href={"https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"}
            rel="stylesheet"
          />
        </head>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            {children}
          </ThemeProvider>
        </body>
      </UserProvider>
    </html>
  );
}
