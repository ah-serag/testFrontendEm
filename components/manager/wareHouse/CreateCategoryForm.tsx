



"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, RollerCoaster } from "lucide-react";

import { categoryFormSchema, CategoryFormValues } from '@/lib/validation/warehouse';
import { useCreateMaterialCategoryMutation } from '@/redux/features/wareHouse';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CreateCategoryFormProps {
  categories: any[];
}

export function CreateCategoryForm({ categories }: CreateCategoryFormProps) {
  const t = useTranslations("Warehouse.Categories");
  const [createCategory, { isLoading }] = useCreateMaterialCategoryMutation();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      parent_id: "none",
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const payload = {
        name: values.name,
        parent_id: values.parent_id !== "none" ? Number(values.parent_id) : null,
      };
      const result = await createCategory(payload).unwrap();
      reset();
      toast.success("تم الإضافة بنجاح")
    } catch (error) {

       const errorMessage =  "حدث خطأ اثناء الاضافة";
      
      toast.error(errorMessage);

    }
  };

  return (
    <div className="flex flex-col  gap-4 bg-white border border-slate-200/60 shadow-sm p-6 rounded-2xl w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center lg:flex-row gap-4 ">
        
        {/* حقل الاسم */}
        <div className=" w-full space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t("categoryName") || "اسم القسم"}
          </label>
          <Input 
            placeholder={t("categoryNamePlaceholder") || "مثال: قطع غيار تكييف"} 
            className="w-full rounded-xl border-slate-200 px-4 shadow-sm h-11 bg-slate-50/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
            {...register("name")} 
          />
          {errors.name && (
            <p className="text-xs font-medium text-red-500 px-1">{errors.name.message}</p>
          )}
        </div>

        {/* حقل القسم الأب */}
        <div className=" w-full space-y-2">
          <label className="text-sm font-medium mb-2 text-slate-700">
            {t("parentCategory") || "القسم الرئيسي (إن وُجد)"}
          </label>
          <Controller
            control={control}
            name="parent_id"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full px-4 rounded-xl border-slate-200 shadow-sm h-11 bg-slate-50/50 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={t("selectParent") || "اختر القسم الأب"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl mt-2 border-slate-200 shadow-lg">
                  <SelectItem value="none" className="rounded-lg text-primary font-medium">
                     {t("mainCategory") || "قسم رئيسي "} 
                  </SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="rounded-lg">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* الزر */}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full lg:w-auto bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm flex items-center justify-center gap-2 px-8 h-11 transition-all"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={18} />}
          <span>{t("saveBtn") || "إضافة القسم"}</span>
        </Button>
        
      </form>
    </div>
  );
}