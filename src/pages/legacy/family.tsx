import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateLegacyCircle,
  useJoinLegacyCircle,
  useMyLegacyCircle,
} from "@/hooks/useLegacy";
import { useToast } from "@/hooks/use-toast";
import { Copy, Shield } from "lucide-react";

export default function LegacyFamilyPage() {
  const { toast } = useToast();
  const { data: circleCtx, refetch } = useMyLegacyCircle();
  const createCircle = useCreateLegacyCircle();
  const joinCircle = useJoinLegacyCircle();

  const [circleName, setCircleName] = useState("");
  const [inviteInput, setInviteInput] = useState("");

  const circle = circleCtx?.circle;
  const member = circleCtx?.member;

  const copyInvite = async () => {
    if (!circle?.invite_code) return;
    await navigator.clipboard.writeText(circle.invite_code);
    toast({ title: "Invite code copied" });
  };

  if (circle) {
    return (
      <div className="space-y-6">
        <header>
          <h2 className="text-xl font-semibold">Your Legacy Circle</h2>
          <p className="mt-1 text-sm text-muted-foreground">{circle.name}</p>
        </header>

        {member?.role === "keeper" && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Legacy Keeper</span>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Invite code</p>
          <p className="mt-2 font-mono text-2xl tracking-widest text-primary">
            {circle.invite_code}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Share this code so loved ones can join your circle and add their voices.
          </p>
          <Button variant="secondary" className="mt-4 gap-2" onClick={() => void copyInvite()}>
            <Copy className="h-4 w-4" />
            Copy invite code
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h2 className="text-xl font-semibold">Your Legacy Circle</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a private circle for your family or join one with an invite code.
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h3 className="font-medium">Start a new circle</h3>
        <Input
          placeholder="e.g. The Oppong Legacy Circle"
          value={circleName}
          onChange={(e) => setCircleName(e.target.value)}
        />
        <Button
          className="w-full"
          disabled={!circleName.trim() || createCircle.isPending}
          onClick={() =>
            createCircle.mutate(circleName, {
              onSuccess: () => {
                toast({ title: "Legacy Circle created" });
                void refetch();
              },
              onError: (e) =>
                toast({
                  title: "Could not create circle",
                  description: e.message,
                  variant: "destructive",
                }),
            })
          }
        >
          Create your Legacy Circle
        </Button>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h3 className="font-medium">Join with invite code</h3>
        <Input
          placeholder="ABC-DEF-GHI"
          value={inviteInput}
          onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
        />
        <Button
          variant="secondary"
          className="w-full"
          disabled={!inviteInput.trim() || joinCircle.isPending}
          onClick={() =>
            joinCircle.mutate(inviteInput, {
              onSuccess: () => {
                toast({ title: "Welcome to the Legacy Circle" });
                void refetch();
              },
              onError: (e) =>
                toast({
                  title: "Could not join",
                  description: e.message,
                  variant: "destructive",
                }),
            })
          }
        >
          Join Legacy Circle
        </Button>
      </section>
    </div>
  );
}