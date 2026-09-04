"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useGetPurchaseInvoicesQuery } from "@/redux/features/purchaseApiSlice";
import InvoiceDetailsModal from "@/components/manager/suppliers/InvoiceDetailsModal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Plus, Eye, ReceiptText } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function PurchaseInvoicesPage() {
  const t = useTranslations("invoicesManager");
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: response, isLoading, isFetching } = useGetPurchaseInvoicesQuery({
    page,
    limit: 15,
    search: debouncedSearch,
    status: statusFilter === "ALL" ? "" : statusFilter,
  });

  const invoices = response?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID": return <Badge className="bg-emerald-50 shadow-sm border  text-emerald-700 px-3 py-1 font-bold rounded-xl hover:bg-emerald-200 border-none whitespace-nowrap">{t("filters.paid")}</Badge>;
      case "PARTIALLY_PAID": return <Badge className="bg-amber-50 shadow-sm border  text-amber-900 px-3 py-1 font-bold rounded-xl hover:bg-amber-200 border-none whitespace-nowrap">{t("filters.partially_paid")}</Badge>;
      case "UNPAID": return <Badge className="bg-rose-50 shadow-sm border  text-rose-900 px-3 py-1 font-bold rounded-xl hover:bg-rose-200 border-none whitespace-nowrap">{t("filters.unpaid")}</Badge>;
      default: return null;
    }
  };

  const openInvoiceDetails = (id: number) => {
    setSelectedInvoiceId(id);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 max-w-9xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white text-primary shadow-md border  flex items-center justify-center shrink-0">
            <ReceiptText size={24} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-800">{t("title")}</h1>
            <p className="text-[12px] md:text-[13px] text-slate-500 font-medium">{t("subtitle")}</p>
          </div>
        </div>
        <Button 
          onClick={() => router.push("/manager/purchases/new")} 
          className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 shadow-sm w-full sm:w-auto font-bold transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 ml-2" /> فاتورة جديدة
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-[350px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 pr-10 pl-4 rounded-xl bg-white border-slate-200 focus-visible:ring-primary/20 shadow-sm text-[13px] w-full"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 px-4 rounded-xl bg-white border-slate-200 focus:ring-primary/20 text-[13px] font-semibold w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">{t("filters.all")}</SelectItem>
              <SelectItem value="PAID">{t("filters.paid")}</SelectItem>
              <SelectItem value="PARTIALLY_PAID">{t("filters.partially_paid")}</SelectItem>
              <SelectItem value="UNPAID">{t("filters.unpaid")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {/* overflow-x-auto هي سر تجاوب الجدول مع الموبايل */}
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-right text-[13px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">{t("table.ref")}</th>
                <th className="px-6 py-4 whitespace-nowrap">{t("table.supplier")}</th>
                <th className="px-6 py-4 whitespace-nowrap">{t("table.date")}</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">{t("table.netAmount")}</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">{t("table.paid")}</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">{t("table.status")}</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="h-48 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-48 text-center text-slate-500 font-medium">
                    لا توجد فواتير مطابقة للبحث
                  </td>
                </tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{inv.invoice_ref}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">{inv.supplier_name}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(inv.invoice_date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                      {Number(inv.net_amount).toLocaleString()} ج
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-emerald-600 font-bold whitespace-nowrap">
                      {Number(inv.paid_amount).toLocaleString()} ج
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {getStatusBadge(inv.payment_status)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openInvoiceDetails(inv.id)}
                        className="rounded-lg h-8 px-3 text-[12px] text-slate-600 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Eye className="w-4 h-4 ml-1.5" /> عرض
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View */}
      <InvoiceDetailsModal 
        invoiceId={selectedInvoiceId} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
}