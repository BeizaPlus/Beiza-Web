/**
 * Order Confirmation Page
 * Public-facing page for customers to view their order status
 */

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyOrderAccess } from "@/lib/shopify/orders";
import { getOrderDownloadLinks as getDigitalLinks } from "@/lib/shopify/digital-assets";
import { getDownloadUrl } from "@/lib/shopify/digital-assets";
import { Package, Download, Mail } from "lucide-react";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [order, setOrder] = useState<Awaited<ReturnType<typeof verifyOrderAccess>>>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<Array<{ productName: string; downloadUrl: string }>>([]);

  const handleLookup = async () => {
    if (!orderNumber || !email) {
      setError("Please enter both order number and email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const foundOrder = await verifyOrderAccess(orderNumber, email);
      if (!foundOrder) {
        setError("Order not found. Please check your order number and email.");
        setOrder(null);
        setLoading(false);
        return;
      }

      setOrder(foundOrder);

      // Get download links for digital products
      if (foundOrder.status === "confirmed" || foundOrder.status === "delivered") {
        const links = await getDigitalLinks(foundOrder.id);
        const downloadUrls = await Promise.all(
          links.map(async (link) => {
            const url = await getDownloadUrl(link.file_url, 3600);
            return {
              productName: `${link.asset_type} - Order ${foundOrder.order_number}`,
              downloadUrl: url,
            };
          })
        );
        setDownloadLinks(downloadUrls);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-slate-100 text-slate-700",
      confirmed: "bg-blue-100 text-blue-700",
      processing: "bg-amber-100 text-amber-700",
      shipped: "bg-purple-100 text-purple-700",
      delivered: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-rose-100 text-rose-700",
      refunded: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="mx-auto max-w-4xl px-6 py-24">
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold text-white">Order Confirmation</h1>
          <p className="text-white/70">Enter your order number and email to view your order status.</p>

          {!order ? (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle>Lookup Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-number">Order Number</Label>
                  <Input
                    id="order-number"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g., 1001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                {error && <div className="text-sm text-rose-400">{error}</div>}
                <Button
                  onClick={handleLookup}
                  disabled={loading}
                  className="w-full rounded-full bg-white text-black hover:bg-white/90"
                >
                  {loading ? "Looking up..." : "Lookup Order"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order {order.order_number}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Status</span>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/70">Order Type</span>
                    <span className="text-white">{order.order_type === "pre_order" ? "Pre-Order" : "Order"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Total</span>
                    <span className="text-white font-semibold">${order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Date</span>
                    <span className="text-white">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {downloadLinks.length > 0 && (
                  <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <Download className="h-5 w-5" />
                      Digital Products
                    </h3>
                    <div className="space-y-2">
                      {downloadLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.downloadUrl}
                          download
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                        >
                          <span className="text-white">{link.productName}</span>
                          <Button size="sm" variant="outline" className="rounded-full">
                            Download
                          </Button>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOrder(null);
                      setDownloadLinks([]);
                    }}
                    className="flex-1"
                  >
                    Lookup Another Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;

