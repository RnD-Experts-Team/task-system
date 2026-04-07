import { useNavigate, useParams } from "react-router"
import { ConfigurationForm, type ConfigurationFormValues } from "@/app/ratings/configurations/configuration-form"
import { configurations } from "@/app/ratings/configurations/data"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function EditConfigurationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const config = configurations.find((c) => c.id === id)

  if (!config) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-semibold">Configuration not found</p>
        <Button variant="outline" onClick={() => navigate("/ratings/configurations")}>
          <ArrowLeft className="size-3.5" />
          Back to Configurations
        </Button>
      </div>
    )
  }

  async function handleSubmit(data: ConfigurationFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const index = configurations.findIndex((c) => c.id === id)
    if (index !== -1) {
      configurations[index] = {
        ...configurations[index],
        name: data.name,
        description: data.description,
        type: data.type,
        status: data.isActive ? "ACTIVE" : "INACTIVE",
        fields: data.fields.map((f, i) => ({
          id: configurations[index].fields[i]?.id ?? `f-${Date.now()}-${i}`,
          name: f.name,
          description: f.description,
          maxValue: f.maxValue,
        })),
        updatedAt: new Date().toISOString().split("T")[0],
      }
    }

    navigate("/ratings/configurations")
  }

  return (
    <ConfigurationForm
      mode="edit"
      configuration={config}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/ratings/configurations")}
    />
  )
}
