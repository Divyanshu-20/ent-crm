import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_shell/settings")({
  head: () => ({ meta: [{ title: "Settings — ENT Clinic CRM" }] }),
  component: SettingsPage,
});

type Tab = "clinic" | "account" | "notifications" | "security";

const TABS: { id: Tab; label: string }[] = [
  { id: "clinic", label: "Clinic Profile" },
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "security", label: "Security" },
];

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("clinic");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Clinic and account preferences</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tab list */}
        <div className="w-full shrink-0 lg:w-52">
          <nav className="overflow-hidden rounded-xl border bg-card shadow-card">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center px-4 py-3 text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-l-2 border-primary bg-primary/8 font-semibold text-primary"
                    : "border-l-2 border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-5">
          {activeTab === "clinic" && <ClinicProfileTab />}
          {activeTab === "account" && <AccountTab />}
          {activeTab === "notifications" && <PlaceholderTab title="Notifications" description="Configure how you receive alerts and reminders." />}
          {activeTab === "security" && <PlaceholderTab title="Security" description="Manage passwords, two-factor authentication, and sessions." />}
        </div>
      </div>
    </div>
  );
}

/* ─── Clinic Profile Tab ────────────────────────────────────────── */
function ClinicProfileTab() {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    clinic_name: "",
    specialization: "",
    phone: "",
    city: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata ?? {};
      setFields({
        clinic_name: meta.clinic_name ?? "ENT Clinic",
        specialization: meta.specialization ?? "ENT (Ear, Nose & Throat)",
        phone: meta.clinic_phone ?? "",
        city: meta.clinic_city ?? "",
      });
    });
  }, []);

  async function handleSave() {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        clinic_name: fields.clinic_name,
        specialization: fields.specialization,
        clinic_phone: fields.phone,
        clinic_city: fields.city,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Failed to save settings");
    } else {
      toast.success("Clinic profile saved");
    }
  }

  return (
    <>
      {/* Clinic Information */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="text-base font-semibold text-foreground">Clinic Information</h2>
        <p className="mb-5 mt-0.5 text-sm text-muted-foreground">Basic details about your clinic</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="clinic_name">Clinic Name</Label>
            <Input
              id="clinic_name"
              value={fields.clinic_name}
              onChange={(e) => setFields((f) => ({ ...f, clinic_name: e.target.value }))}
              placeholder="ENT Clinic"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={fields.specialization}
              onChange={(e) => setFields((f) => ({ ...f, specialization: e.target.value }))}
              placeholder="ENT (Ear, Nose & Throat)"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clinic_phone">Phone</Label>
            <Input
              id="clinic_phone"
              value={fields.phone}
              onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clinic_city">City</Label>
            <Input
              id="clinic_city"
              value={fields.city}
              onChange={(e) => setFields((f) => ({ ...f, city: e.target.value }))}
              placeholder="City"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Doctor Profile */}
      <DoctorProfileCard />
    </>
  );
}

/* ─── Doctor Profile Card ────────────────────────────────────────── */
function DoctorProfileCard() {
  const [user, setUser] = useState<{ email: string; name: string; initials: string } | null>(
    null,
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? "";
      const slug = email.split("@")[0];
      const name =
        data.user?.user_metadata?.full_name ??
        `Dr. ${slug.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`;
      const initials = slug
        .split(/[._-]/)
        .map((s: string) => s[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("") || email.substring(0, 2).toUpperCase();
      setUser({ email, name, initials });
    });
  }, []);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h2 className="text-base font-semibold text-foreground">Doctor Profile</h2>
      <p className="mb-5 mt-0.5 text-sm text-muted-foreground">Your personal account details</p>
      <Separator className="mb-5" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow">
            {user?.initials ?? "DD"}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{user?.name ?? "Dr. Dangore"}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => toast.info("Edit profile coming soon")}>
          Edit profile
        </Button>
      </div>
    </div>
  );
}

/* ─── Account Tab ────────────────────────────────────────────────── */
function AccountTab() {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordChange() {
    if (!newPwd || newPwd.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Failed to update password");
    } else {
      toast.success("Password updated");
      setCurrentPwd("");
      setNewPwd("");
    }
  }

  void currentPwd; // referenced for completeness; Supabase doesn't need current pwd for update

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h2 className="text-base font-semibold text-foreground">Change Password</h2>
      <p className="mb-5 mt-0.5 text-sm text-muted-foreground">
        Update your account password
      </p>
      <div className="max-w-sm space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="current_pwd">Current Password</Label>
          <Input
            id="current_pwd"
            type="password"
            value={currentPwd}
            onChange={(e) => setCurrentPwd(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new_pwd">New Password</Label>
          <Input
            id="new_pwd"
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button onClick={handlePasswordChange} disabled={loading} className="mt-2">
          {loading ? "Updating…" : "Update password"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Placeholder Tab ─────────────────────────────────────────────── */
function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-4 text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  );
}
