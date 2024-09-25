import { AppIcon } from "@/sharedx/brand"
import { homeRoute } from "@/shared/routes"

export default function HomePage() {
  return (
    <main className="min-w-80 px-4 pt-32">
      <div className="mx-auto max-w-sm rounded-lg border bg-card px-6 pb-6 pt-12 text-card-foreground shadow-sm">
        <AppIcon className="mx-auto mb-8 h-14 w-14" />
        <h1 className="mb-2 text-center text-xl font-semibold tracking-tight">
          Versatile Next.js
        </h1>
        <p className="mb-4 text-center text-sm text-muted-foreground">
          A simple toolkit for building Next.js applications
        </p>
        <a
          className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          href={homeRoute().url.href}
        >
          Homepage
        </a>
        <hr className="mx-auto mt-4 w-4 border-input" />
      </div>
    </main>
  )
}
