import { Component, type ReactNode, type ErrorInfo } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
          </div>
          <Button variant="outline" onClick={this.handleReset}>
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
