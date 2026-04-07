import { useNavigate } from "react-router"
import { ConfigurationForm, type ConfigurationFormValues } from "@/app/ratings/configurations/configuration-form"
import { configurations } from "@/app/ratings/configurations/data"

export default function CreateConfigurationPage() {
  const navigate = useNavigate()

  async function handleSubmit(data: ConfigurationFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const newConfig = {
      id: `cfg-${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      status: (data.isActive ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
      fields: data.fields.map((f, i) => ({
        id: `f-${Date.now()}-${i}`,
        name: f.name,
        description: f.description,
        maxValue: f.maxValue,
      })),
      creator: {
        name: "You",
        email: "you@company.com",
        avatar: undefined,
      },
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    configurations.push(newConfig)
    navigate("/ratings/configurations")
  }

  return (
    <ConfigurationForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={() => navigate("/ratings/configurations")}
    />
  )
}
