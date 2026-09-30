// src/app/roadmap-admin/pages/settings/page.tsx
// Settings: Branding, Site copy, Moderation, Limits, SEO with a scope selector (global or a
// board's allowed overrides) and a live preview driven by POST /settings/theme-preview.

import { useState } from "react"
import { AlertCircle, Loader2, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorState } from "../../components/error-state"
import { PageHeader } from "../../components/page-header"
import { SettingsPreview } from "../../components/settings-preview"
import { BrandingSection, LimitsSection, ModerationSection, SeoSection, SiteSection, type SectionProps } from "../../components/settings-sections"
import { useBoards } from "../../hooks/useBoards"
import { useRoadmapPermissions } from "../../hooks/useRoadmapPermissions"
import { useRoadmapSettings } from "../../hooks/useRoadmapSettings"
import { useThemePreview } from "../../hooks/useThemePreview"
import type { UpdateSettingsPayload } from "../../services/roadmapAdminService"
import { fieldError, type MutationResult } from "../../utils/mutation"
import type { AssetType, RoadmapSettings, SettingsResponse } from "../../types"

/** Asset paths are managed by the upload endpoints, never sent with the settings form. */
function withoutAssetPaths(settings: RoadmapSettings): RoadmapSettings {
  return {
    ...settings,
    branding: { ...settings.branding, logo_path: null, logo_dark_path: null, favicon_path: null, og_image_path: null },
  }
}

function buildPayload(scope: string, draft: RoadmapSettings): UpdateSettingsPayload {
  if (scope === "global") {
    const { branding, ...rest } = withoutAssetPaths(draft)
    const { logo_path, logo_dark_path, favicon_path, og_image_path, ...brandingFields } = branding
    void [logo_path, logo_dark_path, favicon_path, og_image_path]
    return { scope, data: { ...rest, branding: brandingFields } }
  }
  // Boards may only override a handful of keys
  return {
    scope,
    data: {
      site: { hero_title: draft.site.hero_title, hero_subtitle: draft.site.hero_subtitle },
      branding: { primary: draft.branding.primary, radius: draft.branding.radius, hero_style: draft.branding.hero_style },
    },
  }
}

function comparable(scope: string, settings: RoadmapSettings): string {
  return JSON.stringify(buildPayload(scope, settings).data)
}

export default function RoadmapSettingsPage() {
  const { canManageSettings } = useRoadmapPermissions()
  const { boards } = useBoards()
  const [scope, setScope] = useState("global")
  const settings = useRoadmapSettings(scope)
  const { response, error, refetch } = settings

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {!response ? (
        <>
          <PageHeader title="Settings" description="Branding, copy, moderation rules and limits for the public roadmap." />
          {error ? (
            <ErrorState message={error} onRetry={() => void refetch()} />
          ) : (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          )}
        </>
      ) : (
        <SettingsEditor
          key={scope}
          scope={scope}
          onScopeChange={setScope}
          boards={boards}
          response={response}
          canEdit={canManageSettings}
          settings={settings}
        />
      )}
    </div>
  )
}

type EditorProps = {
  scope: string
  onScopeChange: (scope: string) => void
  boards: { id: number; slug: string; name: string }[]
  response: SettingsResponse
  canEdit: boolean
  settings: ReturnType<typeof useRoadmapSettings>
}

function SettingsEditor({ scope, onScopeChange, boards, response, canEdit, settings }: EditorProps) {
  const boardScope = scope !== "global"
  const [draft, setDraft] = useState<RoadmapSettings>(response.settings)
  const [saveResult, setSaveResult] = useState<MutationResult<SettingsResponse> | null>(null)

  const dirty = comparable(scope, draft) !== comparable(scope, response.settings)

  // Live theme preview: debounced 250 ms, server is the colour authority
  const preview = useThemePreview(
    { primary: draft.branding.primary, radius: draft.branding.radius, font: draft.branding.font, default_theme: draft.branding.default_theme },
    response.theme
  )

  function onChange<K extends keyof RoadmapSettings>(section: K, patch: Partial<RoadmapSettings[K]>) {
    setDraft((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }))
    setSaveResult(null)
  }

  async function save() {
    const result = await settings.save(buildPayload(scope, draft))
    setSaveResult(result)
    if (result.ok) setDraft(result.data.settings)
  }

  // Validation messages: server 422 on save, plus the preview's contrast rejection for the accent colour
  function errorFor(path: string): string | null {
    const fromSave = fieldError(saveResult, `data.${path}`) ?? fieldError(saveResult, path)
    if (fromSave) return fromSave
    if (path === "branding.primary") return preview.error
    return null
  }

  const sectionProps: SectionProps = { draft, onChange, boardScope, errorFor }
  const generalError = saveResult && !saveResult.ok && Object.keys(saveResult.errors).length === 0 ? saveResult.message : null
  const otherErrors =
    saveResult && !saveResult.ok
      ? Object.entries(saveResult.errors).flatMap(([key, messages]) => messages.map((m) => ({ key, message: m })))
      : []

  const assetUrls: Record<AssetType, string | null> = {
    logo: response.assets.logo_url,
    logo_dark: response.assets.logo_dark_url,
    favicon: response.assets.favicon_url,
    og: response.assets.og_image_url,
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Branding, copy, moderation rules and limits for the public roadmap."
        badge={dirty ? "Unsaved changes" : undefined}
        actions={
          <>
            <Select value={scope} onValueChange={onScopeChange}>
              <SelectTrigger className="w-full sm:w-52" aria-label="Settings scope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global (all boards)</SelectItem>
                {boards.map((b) => (
                  <SelectItem key={b.id} value={`board:${b.id}`}>
                    Board: {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canEdit && (
              <>
                <Button variant="outline" size="lg" className="gap-1.5" disabled={!dirty || settings.saving} onClick={() => { setDraft(response.settings); setSaveResult(null) }}>
                  <RotateCcw />
                  Discard
                </Button>
                <Button size="lg" className="gap-1.5" disabled={!dirty || settings.saving || preview.error !== null} onClick={() => void save()}>
                  {settings.saving ? <Loader2 className="animate-spin" /> : <Save />}
                  Save changes
                </Button>
              </>
            )}
          </>
        }
      />

      {!canEdit && <p className="text-sm text-muted-foreground">You can view these settings but not change them.</p>}

      {(generalError || otherErrors.length > 0) && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="min-w-0 text-sm">
            <p className="font-medium text-destructive">The server rejected these settings</p>
            <ul className="mt-1 list-disc space-y-0.5 ps-4 text-destructive/90">
              {generalError && <li>{generalError}</li>}
              {otherErrors.map((e, i) => (
                <li key={`${e.key}-${i}`}>{e.message}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <fieldset disabled={!canEdit} className="min-w-0">
          <Tabs defaultValue="branding">
            <TabsList className="max-w-full overflow-x-auto">
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="site">Site copy</TabsTrigger>
              {!boardScope && <TabsTrigger value="moderation">Moderation</TabsTrigger>}
              {!boardScope && <TabsTrigger value="limits">Limits</TabsTrigger>}
              {!boardScope && <TabsTrigger value="seo">SEO</TabsTrigger>}
            </TabsList>
            <Card className="mt-2">
              <CardContent>
                <TabsContent value="branding">
                  <BrandingSection
                    {...sectionProps}
                    assets={{
                      urls: assetUrls,
                      busy: settings.assetBusy,
                      onUpload: async (type, file) => (await settings.uploadAsset(type, file)).ok,
                      onRemove: async (type) => (await settings.deleteAsset(type)).ok,
                    }}
                  />
                </TabsContent>
                <TabsContent value="site">
                  <SiteSection {...sectionProps} boardSlugs={boards} />
                </TabsContent>
                <TabsContent value="moderation">
                  <ModerationSection {...sectionProps} />
                </TabsContent>
                <TabsContent value="limits">
                  <LimitsSection {...sectionProps} />
                </TabsContent>
                <TabsContent value="seo">
                  <SeoSection {...sectionProps} />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </fieldset>

        <div className="xl:sticky xl:top-4">
          <Card>
            <CardContent>
              <SettingsPreview
                theme={preview.theme}
                settings={draft}
                logoUrl={assetUrls.logo}
                logoDarkUrl={assetUrls.logo_dark}
                pending={preview.pending}
                error={preview.error}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
