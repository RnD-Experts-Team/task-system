import { useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { ConfigurationForm, type ConfigurationFormValues } from "@/app/ratings/configurations/configuration-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
// Hook: GET /rating-configs/{id} — loads the config to pre-fill the form
import { useRatingConfig } from "@/app/ratings/configurations/hooks/useRatingConfig"
// Hook: PUT /rating-configs/{id} — sends the updated data to the API
import { useUpdateRatingConfig } from "@/app/ratings/configurations/hooks/useUpdateRatingConfig"

export default function EditConfigurationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Parse the numeric ID from the URL param
  const configId = id ? parseInt(id, 10) : null

  // Fetch existing config from GET /rating-configs/{id}
  const { config, loading, error: fetchError } = useRatingConfig(configId)

  // Expose update action and its loading/error state
  const { updateConfig, updating, updateError, clearUpdateError } = useUpdateRatingConfig()

  // Clear update error when the page unmounts
  useEffect(() => () => clearUpdateError(), [clearUpdateError])

  // If the config fetch failed (404 or other error), show a "not found" state
  if (!loading && (fetchError || (!config && configId !== null))) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-semibold">
          {fetchError ?? "Configuration not found"}
        </p>
        <Button variant="outline" onClick={() => navigate("/ratings/configurations")}>
          <ArrowLeft className="size-3.5" />
          Back to Configurations
        </Button>
      </div>
    )
  }

  async function handleSubmit(data: ConfigurationFormValues) {
    if (!configId) return

    // Map form values → UpdateRatingConfigPayload expected by the API
    const result = await updateConfig(configId, {
      name: data.name,
      type: data.type,                    // "task_rating" | "stakeholder_rating"
      description: data.description || null,
      is_active: data.isActive,
      config_data: {
        // Map maxValue (camelCase form) → max_value (snake_case API)
        fields: data.fields.map((f) => ({
          name: f.name,
          description: f.description || null,
          max_value: f.maxValue,
        })),
      },
    })

    // Navigate back only on success (result is null on failure; error shown in the form)
    if (result) {
      navigate("/ratings/configurations")
    }
  }

  return (
    <ConfigurationForm
      mode="edit"
      configuration={config}              // pre-fills form with live API data
      onSubmit={handleSubmit}
      onCancel={() => navigate("/ratings/configurations")}
      isLoading={loading || updating}     // show spinner while fetching OR submitting
      submitError={updateError}           // surfaces API error inside the form footer
    />
  )
}
