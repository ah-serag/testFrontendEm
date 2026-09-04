"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { HandCoins, Loader2, Building2, UserCircle } from "lucide-react";
import { useCreateAdvanceMutation } from "@/redux/features/advancesApiSlice";
import CompanySafeSelect from "@/components/treasury/CompanySafeSelect";
import AccountSelect from "@/components/treasury/AccountSelect";
import { TechnicianWalletSelect } from "@/components/treasury/TechnicianWalletSelect";
import { useGetUsersListQuery } from "@/redux/features/authApiSlice";

const advanceSchema = z.object({
  user_id: z.string().min(1, { message: "يرجى اختيار الموظف أو الفني المستلم" }),
  sourceType: z.enum(["TECH_WALLET", "MAIN_SAFE"]),
  taken_from_safe_id: z.string().min(1, { message: "يرجى تحديد مصدر الصرف" }),
  account_id: z.string().min(1, { message: "التوجيه المحاسبي مطلوب" }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "المبلغ يجب أن يكون رقماً صحيحاً أكبر من صفر",
  }),
  notes: z.string().optional(),
});

type AdvanceFormValues = z.infer<typeof advanceSchema>;

export interface UserData {
  id: number;
  full_name: string;
}

interface AddAdvanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAdvanceDialog({ isOpen, onClose }: AddAdvanceDialogProps) {
  const [createAdvance, { isLoading: isSubmitting }] = useCreateAdvanceMutation();
  const { data: usersResponse, isLoading: isLoadingUsers } = useGetUsersListQuery("supervisor,admin,technician", {
    skip: !isOpen,
  });
  const usersList: UserData[] = usersResponse?.data || [];

  const form = useForm<AdvanceFormValues>({
    resolver: zodResolver(advanceSchema),
    defaultValues: {
      user_id: "",
      sourceType: "TECH_WALLET",
      taken_from_safe_id: "",
      account_id: "",
      amount: "",
      notes: "",
    },
  });

  const watchSourceType = form.watch("sourceType");

  const onSubmit = async (data: AdvanceFormValues) => {
    try {
      await createAdvance({
        user_id: Number(data.user_id),
        taken_from_safe_id: Number(data.taken_from_safe_id),
        account_id: Number(data.account_id),
        amount: Number(data.amount),
        notes: data.notes || "",
      }).unwrap();
      toast.success("تم تسجيل السلفة وإثباتها محاسبياً بنجاح");
      form.reset();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "حدث خطأ أثناء تسجيل السلفة");
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[550px] p-0 border-0 rounded-2xl overflow-hidden gap-0 bg-white flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        <DialogHeader className="bg-primary px-6 py-5 border-b border-primary/10">
          <DialogTitle className="flex items-center  gap-2 text-xl text-white">
            <HandCoins className="w-6 h-6  text-white" />
            <span className="text-normal">صرف سلفة نقدية</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 w-full overflow-y-auto" dir="rtl">
            <div className="px-6 py-6 space-y-6">
              <Controller
                control={form.control}
                name="user_id"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label className={fieldState.error ? "text-red-500" : "text-slate-700 font-semibold"}>
                      الفني / الموظف المستفيد
                    </Label>
                    {isLoadingUsers ? (
                      <div className="flex items-center h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" /> جاري تحميل الموظفين...
                      </div>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger
                          className={`h-11 px-4 rounded-xl transition-all ${
                            fieldState.error
                              ? "border-red-500 focus:ring-red-500/20"
                              : "border-slate-200 focus:ring-primary/20 focus:border-primary bg-slate-50 hover:bg-white"
                          }`}
                        >
                          <SelectValue placeholder="اختر الموظف أو الفني المستلم..." />
                        </SelectTrigger>
                        <SelectContent dir="rtl" className="rounded-xl shadow-xl max-h-48">
                          {usersList.length === 0 ? (
                            <div className="p-3 text-center text-sm text-slate-500">لا يوجد موظفين مسجلين</div>
                          ) : (
                            usersList.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()} className="font-medium cursor-pointer">
                                {user.full_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {fieldState.error && <p className="text-xs text-red-500 font-medium">{fieldState.error.message}</p>}
                  </div>
                )}
              />

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
                <Label className="text-primary font-bold text-base">مصدر صرف السلفة</Label>
                <div className="flex bg-slate-200/70 p-1.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue("sourceType", "TECH_WALLET");
                      form.setValue("taken_from_safe_id", "");
                      form.clearErrors("taken_from_safe_id");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                      watchSourceType === "TECH_WALLET"
                        ? "bg-white text-primary shadow-md ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/80"
                    }`}
                  >
                    <UserCircle className="w-4 h-4" /> عهدة فني
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue("sourceType", "MAIN_SAFE");
                      form.setValue("taken_from_safe_id", "");
                      form.clearErrors("taken_from_safe_id");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${
                      watchSourceType === "MAIN_SAFE"
                        ? "bg-white text-primary shadow-md ring-1 ring-slate-200"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/80"
                    }`}
                  >
                    <Building2 className="w-4 h-4" /> خزنة شركة
                  </button>
                </div>

                <div className="pt-1">
                  <Controller
                    control={form.control}
                    name="taken_from_safe_id"
                    render={({ field, fieldState }) => (
                      <div className="space-y-2">
                        {watchSourceType === "TECH_WALLET" ? (
                          <TechnicianWalletSelect value={field.value} onChange={field.onChange} />
                        ) : (
                          <CompanySafeSelect
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="اختر خزنة الشركة التي سيتم الصرف منها..."
                          />
                        )}
                        {fieldState.error && <p className="text-xs text-red-500 font-medium">{fieldState.error.message}</p>}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label className={fieldState.error ? "text-red-500" : "text-slate-700 font-semibold"}>
                        المبلغ (ج.م)
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        className={`px-4 h-11 font-extrabold text-xl rounded-xl transition-all shadow-sm ${
                          fieldState.error
                            ? "border-red-500 focus-visible:ring-red-500/20"
                            : "border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary text-primary bg-slate-50 focus:bg-white"
                        }`}
                        placeholder="0.00"
                        {...field}
                      />
                      {fieldState.error && <p className="text-xs text-red-500 font-medium">{fieldState.error.message}</p>}
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name="account_id"
                  render={({ field, fieldState }) => (
                    <div className="space-y-2">
                      <Label className={fieldState.error ? "text-red-500" : "text-slate-700 font-semibold"}>
                        التوجيه المحاسبي
                      </Label>
                      <AccountSelect
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="اختر حساب السلف..."
                        error={!!fieldState.error}
                      />
                      {fieldState.error && <p className="text-xs text-red-500 font-medium">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">ملاحظات البيان (اختياري)</Label>
                    <Textarea
                      placeholder="اكتب سبب السلفة أو أي تفاصيل إضافية هنا..."
                      className="px-4 py-3 resize-none h-24 rounded-xl border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all bg-slate-50 focus:bg-white shadow-sm"
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
          </ScrollArea>

          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-28 h-12 rounded-xl border-slate-200 text-slate-600 hover:bg-white transition-all font-bold shadow-sm"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all font-bold text-base"
            >
              {isSubmitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              تسجيل واعتماد
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}