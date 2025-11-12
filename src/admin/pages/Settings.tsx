import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useSiteSettingsAdmin } from "../hooks/useAdminData";
import { useUpsertSiteSettingsMutation, type SiteSettingInput } from "../hooks/useAdminMutations";

const Settings = () => {
  const { data: settings = [], isLoading, isError, error } = useSiteSettingsAdmin();
  const upsertSettings = useUpsertSiteSettingsMutation();

  const [localValues, setLocalValues] = useState<Map<string, string>>(new Map());

  const groupedSettings = useMemo(() => {
    if (isError) {
      return new Map<string, { key: string; value: string; fullKey: string }[]>();
    }

    const map = new Map<string, { key: string; value: string; fullKey: string }[]>();
    settings.forEach((setting) => {
      const [group, key] = setting.key.split("_", 2);
      const bucket = map.get(group) ?? [];
      bucket.push({ key, value: setting.value, fullKey: setting.key });
      map.set(group, bucket);
    });
    return map;
  }, [settings, isError]);

  const handleValueChange = (fullKey: string, value: string) => {
    setLocalValues((prev) => {
      const next = new Map(prev);
      next.set(fullKey, value);
      return next;
    });
  };

  const handleSaveGroup = async (group: string, groupSettings: { key: string; value: string; fullKey: string }[]) => {
    const payload: SiteSettingInput[] = groupSettings.map((item) => ({
      key: item.fullKey,
      value: localValues.get(item.fullKey) ?? item.value,
    }));

    try {
      await upsertSettings.mutateAsync(payload);
      toast({
        title: "Settings saved",
        description: `${group} settings have been updated.`,
      });
      // Clear local values for this group
      setLocalValues((prev) => {
        const next = new Map(prev);
        groupSettings.forEach((item) => next.delete(item.fullKey));
        return next;
      });
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Site Settings</h1>
        <p className="text-sm text-white/70">Update navigation, contact channels, and social handles.</p>
      </header>

      {isLoading ? (
        <Card className="border-white/10 bg-white/5 p-6 text-sm text-white/60">Loading settings…</Card>
      ) : isError ? (
        <Card className="border-white/10 bg-rose-500/10 p-6 text-sm text-rose-100">
          {error instanceof Error ? error.message : "Unable to load settings."}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from(groupedSettings.entries()).map(([group, values]) => {
            const hasChanges = values.some((item) => {
              const localValue = localValues.get(item.fullKey);
              return localValue !== undefined && localValue !== item.value;
            });
            const isSaving = upsertSettings.isPending;

            return (
              <Card key={group} className="border-white/10 bg-white/5 text-white">
                <CardHeader>
                  <CardTitle className="text-white/70 uppercase tracking-[0.3em]">{group}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {values.map((item) => (
                    <div key={item.fullKey} className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-white/60">{item.key}</label>
                      <Input
                        defaultValue={item.value}
                        value={localValues.get(item.fullKey) ?? item.value}
                        onChange={(e) => handleValueChange(item.fullKey, e.target.value)}
                        className="border-white/10 bg-white/10 text-white"
                      />
                    </div>
                  ))}
                  <Button
                    onClick={() => handleSaveGroup(group, values)}
                    disabled={!hasChanges || isSaving}
                    className="rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving…" : `Save ${group}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Settings;

