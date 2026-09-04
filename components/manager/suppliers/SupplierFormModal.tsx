"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, User, Building, Phone, Mail, FileText, MapPin } from "lucide-react";

import { supplierSchema, SupplierFormValues } from "@/lib/validation/supplierSchema";
import { useCreateSupplierMutation, useUpdateSupplierMutation } from "@/redux/features/supplierApiSlice";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SupplierFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: any | null; 
}

export default function SupplierFormModal({ open, onOpenChange, supplier }: SupplierFormModalProps) {
  const t = useTranslations("suppliersManager");
  
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  
  const isEditing = !!supplier;
  const isLoading = isCreating || isUpdating;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "", phone: "", email: "", address: "", company_name: "", tax_number: "", status: "ACTIVE"
    }
  });

  useEffect(() => {
    if (open) {
      if (isEditing && supplier) {
        reset({
          name: supplier.name,
          phone: supplier.phone || "",
          email: supplier.email || "",
          address: supplier.address || "",
          company_name: supplier.company_name || "",
          tax_number: supplier.tax_number || "",
          status: supplier.status || "ACTIVE",
        });
      } else {
        reset({
          name: "", phone: "", email: "", address: "", company_name: "", tax_number: "", status: "ACTIVE"
        });
      }
    }
  }, [open, isEditing, supplier, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      if (isEditing) {
        await updateSupplier({ id: supplier.id, data }).unwrap();
        toast.success(t("toasts.editSuccess"));
      } else {
        await createSupplier(data).unwrap();
        toast.success(t("toasts.addSuccess"));
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.error || err?.data?.message || t("toasts.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[650px] w-[95vw] h-[90vh] sm:h-auto max-h-[90vh] flex flex-col p-0 gap-0 border-0 rounded-3xl bg-white shadow-2xl overflow-hidden"
        dir="rtl"
      >
        
        {/* ================= Header (ثابت) ================= */}
        <div className="bg-primary px-5 sm:px-6 py-5 shrink-0 z-10 text-right">
          <DialogTitle className="font-bold text-[17px] sm:text-[19px] text-white flex items-center justify-start gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <User size={18} />
            </div>
            {isEditing ? t("modal.editTitle") : t("modal.addTitle")}
          </DialogTitle>
          <p className="text-[12px] text-primary-foreground/80 mt-1.5 pr-11 text-right">
            {isEditing ? "قم بتحديث بيانات المورد الأساسية أدناه." : "أدخل بيانات المورد الجديد لربطه بالحسابات والمشتريات."}
          </p>
        </div>

        {/* ================= Form Content (قابل للتمرير) ================= */}
        <ScrollArea className="flex-1 min-h-0 w-full bg-slate-50/30">
          <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-right text-[13px] font-bold text-slate-700">
                  {t("modal.name")} <span className="text-red-500 mr-1">*</span>
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    {...register("name")} 
                    placeholder="مثال: شركة المهندس للتوريدات"
                    className={`rounded-xl bg-white border-slate-200 h-12 px-4 pr-11 text-right text-[13px] focus-visible:ring-primary/20 shadow-sm transition-all ${errors.name ? 'border-red-300 focus-visible:ring-red-200' : ''}`} 
                  />
                </div>
                {errors.name && <p className="text-[11px] text-right font-bold text-red-500">{errors.name.message}</p>}
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <label className="block text-right text-[13px] font-bold text-slate-700">
                  {t("modal.company_name")}
                </label>
                <div className="relative">
                  <Building className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    {...register("company_name")} 
                    placeholder="الاسم التجاري للشركة"
                    className="rounded-xl bg-white border-slate-200 h-12 px-4 pr-11 text-right text-[13px] focus-visible:ring-primary/20 shadow-sm transition-all" 
                  />
                </div>
              </div>

              {/* Phone (LTR Layout) */}
              <div className="space-y-2">
                <label className="block text-right text-[13px] font-bold text-slate-700">
                  {t("modal.phone")}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    {...register("phone")} 
                    type="tel"
                    placeholder="010XXXXXXXX"
                    className="rounded-xl bg-white border-slate-200 h-12 px-4 pl-11 text-left text-[13px] font-mono focus-visible:ring-primary/20 shadow-sm transition-all" 
                    dir="ltr" 
                  />
                </div>
              </div>

              {/* Email (LTR Layout) */}
              <div className="space-y-2">
                <label className="block text-right text-[13px] font-bold text-slate-700">
                  {t("modal.email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    {...register("email")} 
                    type="email"
                    placeholder="supplier@company.com"
                    className={`rounded-xl bg-white border-slate-200 h-12 px-4 pl-11 text-left text-[13px] focus-visible:ring-primary/20 shadow-sm transition-all ${errors.email ? 'border-red-300 focus-visible:ring-red-200' : ''}`} 
                    dir="ltr" 
                  />
                </div>
                {errors.email && <p className="text-[11px] text-right font-bold text-red-500">{errors.email.message}</p>}
              </div>

              {/* Tax Number (LTR Layout) */}
              <div className="space-y-2">
                <label className="block text-right text-[13px] font-bold text-slate-700">
                  {t("modal.tax_number")}
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    {...register("tax_number")} 
                    placeholder="123-456-789"
                    className="rounded-xl bg-white border-slate-200 h-12 px-4 pl-11 text-left text-[13px] font-mono focus-visible:ring-primary/20 shadow-sm transition-all" 
                    dir="ltr" 
                  />
                </div>
              </div>

              {/* Status (Only in Edit Mode) */}
              {isEditing && supplier && (
                <div className="space-y-2">
                  <label className="block text-right text-[13px] font-bold text-slate-700">
                    {t("modal.status")}
                  </label>
                  <Select defaultValue={supplier.status} onValueChange={(val) => setValue("status", val as "ACTIVE" | "INACTIVE")}>
                    <SelectTrigger className="rounded-xl px-4 text-right bg-white border-slate-200 h-12 text-[13px] focus:ring-primary/20 shadow-sm">
                      <SelectValue placeholder="اختر حالة المورد" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 shadow-xl" dir="rtl">
                      <SelectItem value="ACTIVE" className="text-emerald-600 font-bold my-1 text-right focus:bg-emerald-50 focus:text-emerald-700">{t("filters.active")}</SelectItem>
                      <SelectItem value="INACTIVE" className="text-rose-600 font-bold my-1 text-right focus:bg-rose-50 focus:text-rose-700">{t("filters.inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Address (Full Width - RTL) */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-right text-[13px] font-bold text-slate-700">
                  {t("modal.address")}
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    {...register("address")} 
                    placeholder="مثال: القاهرة، شارع التسعين، التجمع الخامس"
                    className="rounded-xl bg-white border-slate-200 h-12 px-4 pr-11 text-right text-[13px] focus-visible:ring-primary/20 shadow-sm transition-all" 
                  />
                </div>
              </div>

            </div>
          </form>
        </ScrollArea>

        {/* ================= Footer (ثابت) ================= */}
        <div className="bg-white border-t border-slate-100 px-5 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3 shrink-0 z-10">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="rounded-xl h-11 px-8 w-full sm:w-auto border-slate-200 text-slate-600 font-bold hover:bg-slate-50 shadow-sm order-2 sm:order-1"
          >
            {t("buttons.cancel")}
          </Button>
          
          <Button 
            type="submit" 
            form="supplier-form"
            disabled={isLoading} 
            className="rounded-xl h-11 px-10 bg-primary text-white hover:bg-primary/95 font-bold w-full sm:w-auto shadow-md order-1 sm:order-2 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
                {t("buttons.saving")}
              </>
            ) : (
              t("buttons.save")
            )}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}