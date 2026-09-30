import { useState } from "react"
import { Monogram } from "./monogram"
import type { PublicAssets } from "../../types"
import { cn } from "@/lib/utils"

interface Props {
  name: string
  assets: PublicAssets
  className?: string
}

/** Logo (with a dark variant when configured) or a Monogram tile. */
export function SiteLogo({ name, assets, className }: Props) {
  const [broken, setBroken] = useState<string | null>(null)
  const light = assets.logo_url && broken !== assets.logo_url ? assets.logo_url : null
  const dark = assets.logo_dark_url && broken !== assets.logo_dark_url ? assets.logo_dark_url : null

  if (!light && !dark) return <Monogram name={name} className={className} />

  const imgClass = "h-8 w-auto max-w-[9rem] object-contain"
  return (
    <>
      {light ? (
        <img
          src={light}
          alt=""
          className={cn(imgClass, dark ? "dark:hidden" : "", className)}
          onError={() => setBroken(light)}
        />
      ) : null}
      {dark ? (
        <img
          src={dark}
          alt=""
          className={cn(imgClass, light ? "hidden dark:block" : "", className)}
          onError={() => setBroken(dark)}
        />
      ) : null}
    </>
  )
}
