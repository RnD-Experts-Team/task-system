import { useState } from "react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Lock, Camera } from "lucide-react"

function ProfileTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <CardTitle className="text-lg">Profile Information</CardTitle>
        <CardDescription className="mt-1">
          Update your personal details and profile picture.
        </CardDescription>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="group relative">
            <Avatar className="size-20 rounded-xl border-2 border-primary/20">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="rounded-xl bg-primary/10 text-lg font-semibold text-primary">
                AD
              </AvatarFallback>
            </Avatar>
            <button className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium">Profile Photo</p>
            <p className="text-xs text-muted-foreground">
              Click the avatar to upload a new photo.
            </p>
          </div>
        </div>
        <Separator className="bg-white/5" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="Enter first name"
              defaultValue="Admin"
              className="transition-colors hover:border-primary/50 focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Enter last name"
              defaultValue=""
              className="transition-colors hover:border-primary/50 focus:border-primary"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            defaultValue="admin@system.com"
            className="transition-colors hover:border-primary/50 focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter phone number"
            className="transition-colors hover:border-primary/50 focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            defaultValue="Administrator"
            disabled
            className="bg-muted/50"
          />
        </div>
        <div className="flex justify-end">
          <Button className="transition-all hover:shadow-md hover:shadow-primary/25">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

function PasswordTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <CardTitle className="text-lg">Change Password</CardTitle>
        <CardDescription className="mt-1">
          Update your password to keep your account secure.
        </CardDescription>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="Enter current password"
            className="transition-colors hover:border-primary/50 focus:border-primary"
          />
        </div>
        <Separator className="bg-white/5" />
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Enter new password"
            className="transition-colors hover:border-primary/50 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with a mix of letters, numbers, and symbols.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            className="transition-colors hover:border-primary/50 focus:border-primary"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button className="transition-all hover:shadow-md hover:shadow-primary/25">
            Update Password
          </Button>
        </div>
      </div>
    </div>
  )
}

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
] as const

type TabId = (typeof tabs)[number]["id"]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile")

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 min-w-0 md:gap-6 md:p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground">
          Manage your profile and security settings.
        </p>
      </div>
      <div className="flex flex-col gap-6 min-w-0 md:flex-row">
        {/* Side tab navigation */}
        <nav className="flex shrink-0 flex-row gap-1 md:w-48 md:flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:bg-white/5 hover:text-accent-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        {/* Tab content — single Card container, no nested cards */}
        <Card className="min-w-0 flex-1 rounded-xl">
          <CardContent className="p-6">
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "password" && <PasswordTab />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
