"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useGetPurchaseInvoiceDetailsQuery } from "@/redux/features/purchaseApiSlice";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button"; 
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Receipt, Building2, Wallet, Calendar, User, 
  FileText, Package, Banknote, Printer, History, CheckCircle2 
} from "lucide-react";

import InvoicePaymentModal from "./InvoicePaymentModal";
import { generatePurchaseInvoicePDF } from "@/lib/pdf/PurchaseInvoicePDF"; 

interface InvoiceDetailsModalProps {
  invoiceId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InvoiceDetailsModal({ invoiceId, open, onOpenChange }: InvoiceDetailsModalProps) {
  const t = useTranslations("invoicesManager");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const { data: response, isLoading, isError } = useGetPurchaseInvoiceDetailsQuery(invoiceId, {
    skip: !invoiceId || !open,
  });

  const invoice = response?.data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID": return <Badge className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 font-bold">{t("filters.paid")}</Badge>;
      case "PARTIALLY_PAID": return <Badge className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-bold">{t("filters.partially_paid")}</Badge>;
      case "UNPAID": return <Badge className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full border border-rose-200 font-bold">{t("filters.unpaid")}</Badge>;
      default: return null;
    }
  };

  const remainingAmount = invoice ? Number(invoice.net_amount) - Number(invoice.paid_amount) : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>

        <DialogContent 
          className="sm:max-w-[850px] w-[95vw] h-[90vh] flex flex-col p-0 gap-0 border-0 rounded-3xl bg-slate-50 shadow-2xl overflow-hidden" 
          dir="rtl"
        >
          
          {/* ================= 1. Header (ثابت لا يتحرك بفضل shrink-0) ================= */}
          <div className="bg-primary  border-b border-slate-100 px-5 sm:px-6 py-4 flex justify-between items-center shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-primary flex items-center justify-center shrink-0">
                <Receipt size={18} />
              </div>
              <div>
                <DialogTitle className="font-bold text-[15px] sm:text-[17px] text-slate-200 tracking-tight text-right">
                  {invoice?.invoice_ref || "جاري التحميل..."}
                </DialogTitle>
                {invoice?.invoice_date && (
                  <span className="text-[11px] sm:text-[12px] text-slate-200 font-medium flex items-center gap-1.5 mt-0.5">
                    <Calendar size={12} /> {new Date(invoice.invoice_date).toLocaleDateString("en-GB")}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {invoice && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generatePurchaseInvoicePDF(invoice)}
                  className="hidden sm:flex rounded-full h-9 px-4 font-bold text-slate-600 hover:text-slate-900 border-slate-200 bg-white shadow-sm text-xs"
                >
                  <Printer size={14} className="ml-1.5" /> طباعة
                </Button>
              )}
              {invoice?.payment_status && getStatusBadge(invoice.payment_status)}
            </div>
          </div>

          {/* ================= 2. المحتوى (يعمل ScrollArea بفضل flex-1 و min-h-0) ================= */}
          <ScrollArea className="flex-1 min-h-0 w-full bg-slate-50/50" dir="rtl">
            <div className="p-4 sm:p-6 space-y-5">
              
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : isError || !invoice ? (
                <div className="flex items-center justify-center h-[300px] text-rose-500 font-bold bg-white rounded-2xl shadow-sm border border-slate-100">
                  حدث خطأ أثناء تحميل بيانات الفاتورة
                </div>
              ) : (
                <>
                  {/* قسم المورد والبيانات المالية */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 text-right">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-start gap-1.5">
                        <Building2 size={14} className="text-slate-300" /> {t("modal.supplierInfo")}
                      </h3>
                      <div>
                        <p className="font-bold text-[14px] sm:text-[15px] text-slate-800">{invoice.supplier_name}</p>
                        {invoice.supplier_company && <p className="text-[12px] text-slate-500 mt-1">{invoice.supplier_company}</p>}
                        {invoice.supplier_invoice_number && (
                          <div className="mt-3 flex items-center gap-2 justify-start">
                            <span className="text-[11px] font-bold text-slate-400">الرقم الورقي:</span>
                            <span className="text-[11px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-600" dir="ltr">
                              {invoice.supplier_invoice_number}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 text-right">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-start gap-1.5">
                        <Wallet size={14} className="text-slate-300" /> {t("modal.financials")}
                      </h3>
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[12px] sm:text-[13px] text-slate-500">
                          <span>{t("modal.total")}:</span>
                          <span className="font-mono text-slate-700">{Number(invoice.total_amount).toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex justify-between text-[12px] sm:text-[13px] text-slate-500">
                          <span>{t("modal.discount")}:</span>
                          <span className="font-mono text-rose-500">-{Number(invoice.discount).toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex justify-between text-[14px] font-bold text-slate-800 pt-2 border-t border-slate-50">
                          <span>الصافي المطلوب:</span>
                          <span className="font-mono bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-md">{Number(invoice.net_amount).toLocaleString()} ج.م</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* جدول الأصناف (أنيق وبسيط) */}
                  {invoice.items && invoice.items.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-3.5 flex items-center gap-2 border-b border-slate-50 text-right">
                        <Package size={15} className="text-slate-400" />
                        <h3 className="text-[13px] font-bold text-slate-800">{t("modal.itemsTitle")}</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[12px] sm:text-[13px]">
                          <thead className="text-slate-400 bg-slate-50/50">
                            <tr>
                              <th className="px-5 py-3 font-semibold">{t("modal.material")}</th>
                              <th className="px-5 py-3 font-semibold font-mono">SKU</th>
                              <th className="px-5 py-3 font-semibold text-center">{t("modal.qty")}</th>
                              <th className="px-5 py-3 font-semibold text-center">{t("modal.price")}</th>
                              <th className="px-5 py-3 font-semibold text-left">{t("modal.totalPrice")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {invoice.items.map((item: any) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3.5 font-bold text-slate-700">{item.material_name}</td>
                                <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400" dir="ltr">{item.material_sku || '-'}</td>
                                <td className="px-5 py-3.5 font-mono font-bold text-slate-600 text-center">{Number(item.quantity)}</td>
                                <td className="px-5 py-3.5 font-mono text-slate-500 text-center">{Number(item.unit_price).toLocaleString()}</td>
                                <td className="px-5 py-3.5 font-mono font-bold text-slate-800 text-left">{Number(item.total_price).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* سجل الدفعات السابقة (نظيف ومرتب) */}
                  {invoice.payments && invoice.payments.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden text-right">
                      <div className="px-5 py-3.5 flex items-center gap-2 border-b border-slate-50">
                        <History size={15} className="text-slate-400" />
                        <h3 className="text-[13px] font-bold text-slate-800">سجل الدفعات</h3>
                      </div>
                      <div className="p-4 sm:p-5 space-y-3">
                        {invoice.payments.map((payment: any) => (
                          <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={16} />
                              </div>
                              <div>
                                <p className="text-[13px] font-bold text-slate-800">دفعة نقدية</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                                  <span className="flex items-center gap-1"><Calendar size={11}/> {new Date(payment.created_at).toLocaleDateString("en-GB")}</span>
                                  {payment.safe_name && <span className="flex items-center gap-1"><Wallet size={11}/> {payment.safe_name}</span>}
                                  {payment.created_by_name && <span className="flex items-center gap-1"><User size={11}/> {payment.created_by_name}</span>}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-[14px] text-emerald-600 self-end sm:self-auto" dir="ltr">
                              {Number(payment.amount).toLocaleString()} ج.م
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* الملاحظات */}
                  {invoice.notes && (
                    <div className="flex items-start gap-2.5 max-w-full text-right bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <FileText size={16} className="text-slate-300 mt-0.5 shrink-0" />
                      <p className="text-[12px] sm:text-[13px] text-slate-500 leading-relaxed">
                        {invoice.notes}
                      </p>
                    </div>
                  )}

                  {/* ملخص المتبقي وزر السداد (شريط داكن بالأسفل) */}
                  <div className="bg-primary rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-center gap-5 shadow-lg text-right mt-4">
                    <div className="flex justify-between w-full sm:w-auto gap-6 sm:gap-8">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{t("table.paid")}</p>
                        <p className="text-[16px] sm:text-[18px] font-mono font-bold text-slate-100">{Number(invoice.paid_amount).toLocaleString()} ج</p>
                      </div>
                      <div className="pl-0 sm:pl-8 border-r-0 pr-5 sm:border-r border-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">المتبقي الآجل</p>
                        <p className="text-[16px] sm:text-[18px] font-mono font-bold text-red-200">
                          {remainingAmount.toLocaleString()} ج
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto">
                      {(invoice.payment_status === "UNPAID" || invoice.payment_status === "PARTIALLY_PAID") ? (
                        <Button 
                          onClick={() => setIsPaymentModalOpen(true)}
                          className="h-11 px-6 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold w-full sm:w-auto shadow-sm text-xs"
                        >
                          <Banknote className="w-4 h-4 ml-1.5" /> سداد دفعة للمورد
                        </Button>
                      ) : (
                        <div className="h-11 px-6 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center justify-center w-full sm:w-auto text-xs">
                          <CheckCircle2 className="w-4 h-4 ml-1.5" /> مسددة بالكامل
                        </div>
                      )}
                    </div>
                  </div>

                </>
              )}
            </div>
          </ScrollArea>

          {/* ================= 3. Footer (ثابت لا يتحرك) ================= */}
          <div className="bg-white border-t border-slate-100 px-5 sm:px-6 py-4 flex flex-col sm:flex-row justify-between sm:justify-end items-center gap-3 shrink-0 z-10">
            {invoice && (
              <Button 
                variant="outline" 
                onClick={() => generatePurchaseInvoicePDF(invoice)}
                className="sm:hidden w-full rounded-xl h-11 font-bold text-slate-600 border-slate-200 bg-white text-[13px]"
              >
                <Printer size={16} className="ml-1.5" /> طباعة
              </Button>
            )}

            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto rounded-xl h-11 px-8 font-bold text-slate-600 hover:bg-slate-100 border-slate-200 bg-white text-[13px] transition-all"
            >
              إغلاق
            </Button>
          </div>

        </DialogContent>
      </Dialog>

      {invoice && (
        <InvoicePaymentModal 
          open={isPaymentModalOpen}
          onOpenChange={setIsPaymentModalOpen}
          invoiceId={invoice.id}
          invoiceRef={invoice.invoice_ref}
          remainingAmount={remainingAmount}
        />
      )}
    </>
  );
}