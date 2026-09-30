import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { S } from "../../lib/strings"
import { btn } from "../../lib/ui"

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

/** Local boundary so a crash on the public site never falls through to the staff app UI. */
export class RoadmapErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Roadmap public site error:", error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <span className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <AlertTriangle aria-hidden="true" className="size-5" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight">{S.errors.boundaryTitle}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{S.errors.boundaryBody}</p>
        <button type="button" className={btn("outline", "md", "mt-5")} onClick={() => this.setState({ failed: false })}>
          {S.common.retry}
        </button>
      </div>
    )
  }
}
