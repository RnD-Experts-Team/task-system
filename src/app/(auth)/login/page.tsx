import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/theme-toggle"

interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "", remember: false },
  })

  const remember = watch("remember")

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    console.log("Login attempt:", data)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  return (
    <div className=" from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center p-6 sm:p-8">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="animate-in fade-in duration-500 fill-mode-both w-full max-w-md">
        <div className="rounded-xl border border-white/10 bg-white/4 dark:bg-black/40 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-inset ring-white/5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-chart-1 to-chart-5 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6 text-primary-foreground"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              // autoFocus
              autoComplete="email"
              className="h-9 border-white/10 bg-white/5 placeholder:text-muted-foreground text-foreground  transition-colors duration-200 focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary/20"
              aria-invalid={!!errors.email}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-9 border-white/10 bg-white/5 pr-9 placeholder:text-muted-foreground text-foreground transition-colors duration-200 focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary/20"
                aria-invalid={!!errors.password}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                    <path d="m2 2 20 20" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}

            {/* <div className="flex justify-end -mt-1.5">
              <a
                href="#"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div> */}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) =>
                setValue("remember", checked === true)
              }
            />
            <Label htmlFor="remember" className="font-normal">
              Stay signed in
            </Label>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="h-10 w-full btn-gradient-modern text-sm font-medium text-primary-foreground shadow-lg transform-gpu will-change-transform disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <svg
                  className="size-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="sr-only">Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>


      </div>
    </div>
    </div>
  )
}
