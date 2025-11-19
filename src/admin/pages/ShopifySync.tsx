/**
 * Shopify Sync Management Page
 */

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useShopifySyncLog, useReconcileProducts } from "../hooks/useShopifySync";

const ShopifySync = () => {
  const { data: syncLog = [], isLoading } = useShopifySyncLog(100);
  const reconcile = useReconcileProducts();

  const handleReconcile = async () => {
    try {
      const result = await reconcile.mutateAsync();
      toast({
        title: "Reconciliation complete",
        description: `Synced ${result.synced} products, ${result.errors} errors.`,
      });
    } catch {
      // Error handled by mutation
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: "bg-emerald-100 text-emerald-700",
      error: "bg-rose-100 text-rose-700",
      pending: "bg-amber-100 text-amber-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Shopify Sync</h1>
        <p className="text-sm text-white/70">Manage synchronization between your database and Shopify.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Sync Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleReconcile}
              disabled={reconcile.isPending}
              className="w-full rounded-full bg-white text-black hover:bg-white/90"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${reconcile.isPending ? "animate-spin" : ""}`} />
              Reconcile All Products
            </Button>
            <p className="text-xs text-white/60">
              Syncs all product mappings with Shopify to ensure data consistency.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Sync Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Total Operations</span>
                <span className="font-medium">{syncLog.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Successful</span>
                <span className="font-medium text-emerald-400">
                  {syncLog.filter((log) => log.status === "success").length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Errors</span>
                <span className="font-medium text-rose-400">
                  {syncLog.filter((log) => log.status === "error").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle>Sync Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-white/60">Loading sync log...</div>
          ) : syncLog.length === 0 ? (
            <div className="text-center py-8 text-white/60">No sync operations yet.</div>
          ) : (
            <div className="space-y-2">
              {syncLog.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{log.operation_type}</span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/70">{log.entity_type}</span>
                      {log.entity_id && (
                        <>
                          <span className="text-white/60">•</span>
                          <span className="text-white/50 text-sm">{log.entity_id.slice(0, 8)}...</span>
                        </>
                      )}
                    </div>
                    {log.error_message && (
                      <div className="mt-1 text-sm text-rose-400">{log.error_message}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                    <span className="text-xs text-white/50">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifySync;

