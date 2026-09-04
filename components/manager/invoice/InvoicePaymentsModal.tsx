"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Banknote, 
  CalendarDays, 
  Wallet, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  ArrowDownLeft,
  ReceiptText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: number;
  amount: string | number;
  payment_method: string;
  notes: string;
  created_at: string;
  safe_name: string;
}

interface InvoicePaymentsModalProps {
  invoice: any; // يحتوي على بيانات الفاتورة ومصفوفة payments
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoicePaymentsModal({ invoice, isOpen, onClose }: InvoicePaymentsModalProps) {
  const t = useTranslations("invoices"); // قم بتعديل مسار الترجمة حسب مشروعك

  if (!invoice) return null;

  const totalAmount = Number(invoice.total_amount || 0);
  const paidAmount = Number(invoice.paid_amount || 0);
  const remainingAmount = Math.max(totalAmount - paidAmount, 0);
  const payments: Payment[] = invoice.payments || [];

  const isFullyPaid = remainingAmount <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        aria-describedby={undefined}
        className="sm:max-w-[600px] p-0 bg-slate-50 border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]" 
        dir="rtl"
      >
        {/* ================= HEADER ================= */}
        <DialogHeader className="p-5 sm:p-6 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                <ReceiptText size={20} className="text-slate-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  سجل الدفعات
                  <span className="text-slate-600 font-mono text-sm bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                    {invoice.invoice_ref}
                  </span>
                </DialogTitle>
                <p className="text-slate-500 text-xs mt-1 font-medium">
                  تفاصيل التحصيلات المالية المرتبطة بهذه الفاتورة
                </p>
              </div>
            </div>
            
            {/* حالة الفاتورة (خالصة / متبقي) */}
            <div className={cn("px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm flex items-center gap-1.5", 
              isFullyPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
            )}>
              {isFullyPaid ? <CheckCircle2 size={14}/> : <Wallet size={14}/>}
              {isFullyPaid ? "خالصة" : "يوجد متبقي"}
            </div>
          </div>
        </DialogHeader>

        {/* ================= BODY ================= */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full" dir="rtl">
            <div className="p-5 sm:p-6 space-y-6">

              {/* 1. Financial Summary Cards (ملخص مالي أنيق جداً) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] sm:text-xs text-slate-500 mb-1.5 font-bold">إجمالي الفاتورة</span>
                  <p className="text-sm sm:text-lg font-black text-slate-900">{totalAmount.toLocaleString()}</p>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">ج.م</span>
                </div>
                
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] sm:text-xs text-emerald-600 mb-1.5 font-bold">إجمالي المدفوع</span>
                  <p className="text-sm sm:text-lg font-black text-emerald-700">{paidAmount.toLocaleString()}</p>
                  <span className="text-[9px] sm:text-[10px] text-emerald-500 font-medium">ج.م</span>
                </div>

                <div className={cn("p-4 rounded-xl border shadow-sm flex flex-col justify-center items-center text-center",
                  remainingAmount > 0 ? "bg-rose-50/50 border-rose-100" : "bg-slate-50 border-slate-100"
                )}>
                  <span className={cn("text-[10px] sm:text-xs mb-1.5 font-bold", remainingAmount > 0 ? "text-rose-600" : "text-slate-500")}>المتبقي للشركة</span>
                  <p className={cn("text-sm sm:text-lg font-black", remainingAmount > 0 ? "text-rose-700" : "text-slate-700")}>{remainingAmount.toLocaleString()}</p>
                  <span className={cn("text-[9px] sm:text-[10px] font-medium", remainingAmount > 0 ? "text-rose-500" : "text-slate-400")}>ج.م</span>
                </div>
              </div>

              {/* 2. Payments List (قائمة الدفعات) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                  <ArrowDownLeft size={16} className="text-slate-400" />
                  حركات التحصيل المسجلة
                </h3>

                {payments.length === 0 ? (
                  <div className="bg-white border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <Banknote size={24} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">لا توجد دفعات مسجلة</p>
                    <p className="text-xs text-slate-400 mt-1">لم يتم تسجيل أي تحصيلات مالية لهذه الفاتورة حتى الآن.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment, index) => (
                      <div key={payment.id || index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300">
                        
                        {/* يمين: تفاصيل الدفعة */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                            payment.payment_method === 'CASH' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-blue-50 border-blue-100 text-blue-600"
                          )}>
                            {payment.payment_method === 'CASH' ? <Banknote size={18} /> : <CreditCard size={18} />}
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                {payment.payment_method === 'CASH' ? 'دفع نقدي (كاش)' : 'تحويل إلكتروني'}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[120px]">
                                {payment.safe_name || 'خزنة رئيسية'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <CalendarDays size={12} className="text-slate-400" />
                              <span dir="ltr">{new Date(payment.created_at).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}</span>
                            </div>
                            {payment.notes && (
                              <p className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block w-fit">
                                {payment.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* يسار: المبلغ */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 sm:hidden">المبلغ المستلم:</span>
                          <span className="text-lg font-black text-emerald-700 font-mono">
                            +{Number(payment.amount).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600/70 hidden sm:block">ج.م</span>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white flex justify-end shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="w-full sm:w-auto h-10 px-8 rounded-xl text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <XCircle size={16} /> <span>إغلاق السجل</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}