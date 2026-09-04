'use client';

import { useGetInvoicesDashQuery } from "@/redux/features/dashMangerSlice";
import { useTranslations } from 'next-intl';
import { 
  Receipt, 
  CheckCircle2, 
  FileEdit, 
  XCircle 
} from "lucide-react";
import { useSearchParams } from "next/navigation";

const ALL_INVOICE_STATUSES = [
  'paid',
  'draft',
  'cancelled'
];

const STATUS_UI = {
  paid: { 
    icon: CheckCircle2, 
    containerClass: 'border-l-4 border-emerald-500 bg-emerald-50/80 hover:bg-emerald-50/100', 
    textClass: 'text-emerald-700 font-semibold',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  draft: { 
    icon: FileEdit, 
    containerClass: 'border-l-4 border-gray-300 hover:bg-gray-200 bg-gray-100', 
    textClass: 'text-primary font-semibold', 
    badgeClass: 'shadow-sm text-primary border-slate-200 bg-white' 
  },
  cancelled: { 
    icon: XCircle, 
    containerClass: 'border-l-4 border-gray-300 hover:bg-gray-200 bg-gray-100', 
    textClass: 'text-primary font-semibold', 
    badgeClass: 'bg-gray-100 text-primary border-transparent' 
  }
};

export default function InvoicesWidget() {
  const t = useTranslations("dashboard.invoices");
  const params = useSearchParams();
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");

  const queryParams = startDate && endDate ? { startDate, endDate } : undefined;
  
  const { data, isLoading, isError } = useGetInvoicesDashQuery(queryParams);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm animate-pulse h-[380px]">
        <div className="h-6 bg-slate-100 rounded-lg w-1/3 mb-6"></div>
        <div className="h-10 bg-slate-100 rounded-lg w-1/4 mb-10"></div>
        <div className="flex flex-col gap-4">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-12 bg-slate-50 rounded-lg w-full"></div>
           ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8 shadow-sm h-[380px] flex items-center justify-center">
        <p className="text-red-500 text-sm font-medium">حدث خطأ أثناء تحميل إحصائيات الفواتير</p>
      </div>
    );
  }

  const stats = data?.data?.statuses || {};
  const total = data?.data?.total || 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-6 border-b border-slate-100 bg-gray-100/80 p-6">
        <h2 className="text-lg font-medium text-primary gap-3 items-center flex">
          {/* صندوق الأيقونة: حواف ناعمة rounded-lg */}
          <span className="p-2 bg-primary/5 rounded-lg text-primary shadow-sm">
            <Receipt className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex items-center gap-2">
            <span>{t('title')}</span>
            {/* الرقم الإجمالي بداخل دائرة أنيقة */}
            <span className="bg-primary/10 text-primary border-none rounded-full font-bold px-3 py-1 text-sm shadow-none">
              {total}
            </span>
          </div>
        </h2>
      </div>

      <div className="flex flex-col p-6 pt-0 gap-3 flex-grow">
        {ALL_INVOICE_STATUSES.map((status) => {
          const UI = STATUS_UI[status as keyof typeof STATUS_UI];
          const Icon = UI.icon;
          const count = stats[status] || 0;
          const isHighlight = status === 'paid';

          return (
            <div 
              key={status} 
              className={`flex justify-between items-center p-4 rounded-lg transition-all duration-200 ${UI.containerClass}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${UI.textClass}`} strokeWidth={isHighlight ? 2 : 1.5} />
                <span className={`text-sm ${UI.textClass} tracking-wide`}>
                  {t(`statuses.${status}`)}
                </span>
              </div>
              
              <span className={`text-sm font-bold px-3 py-1 rounded-full border shadow-sm ${UI.badgeClass}`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}