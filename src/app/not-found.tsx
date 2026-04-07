import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"
import { Home } from "lucide-react"

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <p className="text-7xl font-extrabold tracking-tighter text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button onClick={() => navigate("/")} className="gap-2">
        <Home className="size-4" />
        Back to Dashboard
      </Button>
    </div>
  )
}
