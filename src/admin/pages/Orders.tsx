/**
 * Shopify Orders Admin Page
 */

import { useState } from "react";
import { Mail, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { CrudTable } from "@/admin/components/crud";
import { useShopifyOrders, useUpdateOrderStatus } from "../hooks/useShopifyOrders";
import type { OrderStatus } from "@/lib/shopify/orders";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [sendEmail, setSendEmail] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  
  const { data: orders = [], isLoading, isError, error } = useShopifyOrders(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );
  const errorMessage = error instanceof Error ? error.message : "Unable to load orders.";
  const updateStatus = useUpdateOrderStatus();

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus,
    sendEmail: boolean,
    customMessage?: string
  ) => {
    try {
      await updateStatus.mutateAsync({
        orderId,
        newStatus,
        sendEmail,
        customMessage,
      });
      toast({
        title: "Order updated",
        description: `Order status updated to ${newStatus}.${sendEmail ? " Email sent." : ""}`,
      });
    } catch {
      // Error handled by mutation
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
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
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Orders & Pre-Orders</h1>
        <p className="text-sm text-white/70">Manage orders and send status updates to customers.</p>
      </header>

      <div className="flex items-center gap-4">
        <Label htmlFor="status-filter">Filter by Status</Label>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
          <SelectTrigger id="status-filter" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CrudTable
        title="Orders"
        description="View and manage customer orders."
        dataCount={orders.length}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        emptyMessage="No orders found."
        columns={
          <tr>
            <th className="px-6 py-4 text-left font-medium">Order #</th>
            <th className="px-6 py-4 text-left font-medium">Customer</th>
            <th className="px-6 py-4 text-left font-medium">Type</th>
            <th className="px-6 py-4 text-center font-medium">Status</th>
            <th className="px-6 py-4 text-right font-medium">Total</th>
            <th className="px-6 py-4 text-left font-medium">Date</th>
            <th className="px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        }
      >
        {orders.map((order) => {
          const isEditing = editingOrder === order.id;

          return (
            <tr key={order.id} className="transition hover:bg-white/5">
              <td className="px-6 py-4 font-medium text-white">{order.order_number}</td>
              <td className="px-6 py-4 text-white/70">
                <div>
                  <div>{order.customer_name || "—"}</div>
                  <div className="text-xs text-white/50">{order.customer_email}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-white/70">
                <span className="rounded-full px-2 py-1 text-xs font-medium bg-white/10">
                  {order.order_type === "pre_order" ? "Pre-Order" : "Order"}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-white/70">${order.total_amount.toFixed(2)}</td>
              <td className="px-6 py-4 text-white/60">
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full bg-white/10 text-white hover:bg-white/20"
                    onClick={() => {
                      setEditingOrder(order.id);
                      setNewStatus(order.status);
                      setSendEmail(true);
                      setCustomMessage("");
                    }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
      </CrudTable>

      {/* Update Dialog */}
      {editingOrder && (() => {
        const order = orders.find((o) => o.id === editingOrder);
        if (!order) return null;

        return (
          <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
            <DialogContent className="bg-white/5 text-white border-white/10">
              <DialogHeader>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogDescription className="text-white/70">
                  Update the status for order {order.order_number}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>New Status</Label>
                  <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="send-email">Send Email Notification</Label>
                  <Switch id="send-email" checked={sendEmail} onCheckedChange={setSendEmail} />
                </div>

                {order.order_type === "pre_order" && sendEmail && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                    <Textarea
                      id="custom-message"
                      rows={3}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Add a custom message for pre-order updates..."
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingOrder(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleStatusUpdate(order.id, newStatus, sendEmail, customMessage || undefined);
                    setEditingOrder(null);
                  }}
                  disabled={updateStatus.isPending}
                  className="bg-white text-black hover:bg-white/90"
                >
                  {updateStatus.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
};

export default Orders;

