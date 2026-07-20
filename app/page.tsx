import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">SMARTMAINTAIN</h1>
        <p className="text-lg text-muted-foreground">Maintenance Management System</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            Sign In
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-accent"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
