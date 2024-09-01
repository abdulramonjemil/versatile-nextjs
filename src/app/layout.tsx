import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/client/theme.component"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  // Note! If you do not add suppressHydrationWarning to your <html> you will
  // get warnings because next-themes updates that element. This property only
  // applies one level deep, so it won't block hydration warnings on other
  // elements.
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
