/**
 * Download Page
 * Secure download page for digital products using token
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyDownloadToken, getDownloadUrl, trackDownload } from "@/lib/shopify/digital-assets";
import { Download, AlertCircle } from "lucide-react";

const Download = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [asset, setAsset] = useState<Awaited<ReturnType<typeof verifyDownloadToken>>>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAsset = async () => {
      if (!token) {
        setError("No download token provided.");
        setLoading(false);
        return;
      }

      try {
        const verifiedAsset = await verifyDownloadToken(token);
        if (!verifiedAsset) {
          setError("Invalid or expired download token.");
          setLoading(false);
          return;
        }

        setAsset(verifiedAsset);

        // Get signed download URL
        const url = await getDownloadUrl(verifiedAsset.file_url, 3600);
        setDownloadUrl(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [token]);

  const handleDownload = async () => {
    if (!downloadUrl || !asset) return;

    try {
      // Track the download
      await trackDownload(asset.download_token);

      // Trigger download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = asset.file_url.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tribute: "Memorial Tribute",
      archive: "Legacy Archive",
      memory_page: "Memory Page",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="mx-auto max-w-2xl px-6 py-24">
          <div className="text-center text-white/60">Loading download...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="mx-auto max-w-2xl px-6 py-24">
          <Card className="border-rose-400/40 bg-rose-500/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-200">
                <AlertCircle className="h-5 w-5" />
                Download Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-rose-200">{error || "Invalid download link."}</p>
              <Button
                onClick={() => navigate("/order-confirmation")}
                className="mt-4 rounded-full bg-white text-black hover:bg-white/90"
              >
                Go to Order Confirmation
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-2xl px-6 py-24">
        <Card className="border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Your Digital Product
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-white/70">Product Type</div>
              <div className="text-lg font-semibold">{getAssetTypeLabel(asset.asset_type)}</div>
            </div>

            {asset.expires_at && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="text-sm text-white/70">
                  This download link expires on{" "}
                  {new Date(asset.expires_at).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}

            {asset.download_count > 0 && (
              <div className="text-sm text-white/60">
                Downloaded {asset.download_count} time{asset.download_count !== 1 ? "s" : ""}
              </div>
            )}

            <Button
              onClick={handleDownload}
              disabled={!downloadUrl}
              className="w-full rounded-full bg-white text-black hover:bg-white/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Now
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate("/order-confirmation")}
                className="text-white/70 hover:text-white"
              >
                View Order Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Download;

