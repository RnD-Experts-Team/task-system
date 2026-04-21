import { useEffect } from "react"
import { useNavigate } from "react-router"
import { ConfigurationForm, type ConfigurationFormValues } from "@/app/ratings/configurations/configuration-form"
// Real API hook — POST /rating-configs via the Zustand store
import { useCreateRatingConfig } from "@/app/ratings/configurations/hooks/useCreateRatingConfig"

export default function CreateConfigurationPage() {
  const navigate = useNavigate()
  // creating — true while API request is in flight (unused directly; form uses its own isSubmitting)
  const { createConfig, createError, clearCreateError } = useCreateRatingConfig()

  // Clear any leftover error when the page unmounts
  useEffect(() => () => clearCreateError(), [clearCreateError])

  async function handleSubmit(data: ConfigurationFormValues) {
    // Map form values → CreateRatingConfigPayload expected by the API
    const result = await createConfig({
      name: data.name,
      type: data.type,                   // already "task_rating" | "stakeholder_rating"
      description: data.description || null,
      is_active: data.isActive,
      config_data: {
        // Map maxValue (camelCase form field) → max_value (snake_case API field)
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
      mode="create"
      onSubmit={handleSubmit}
      onCancel={() => navigate("/ratings/configurations")}
      isLoading={false}
      submitError={createError}   // surfaces API error inside the form footer
    />
  )
}
