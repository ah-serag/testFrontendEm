'use client';

import { useGetTodayDashQuery } from "@/redux/features/dashMangerSlice";
import { useTranslations } from 'next-intl';
import { 
  CalendarClock, 
  CalendarPlus, 
  ClipboardPlus, 
  Receipt 
} from "lucide-react";
import { useSearchParams } from "next/navigation";

// مفاتيح البيانات كما تعود من الـ API بالضبط
const TODAY_KEYS = [
  'today_new_bookings',
  'today_assignments',
  'today_invoices'
];

const ITEM_UI = {
  today_new_bookings: { 
    icon: CalendarPlus, 
    containerClass: 'border-l-4 bg-sky-50/40 hover:bg-sky-50/80', 
    textClass: 'text-sky-700 font-semibold',
    badgeClass: 'shadow-sm text-sky-800'
  },
  today_assignments: { 
    icon: ClipboardPlus, 
    containerClass: 'border-l-4 bg-amber-50/40 hover:bg-amber-50/80', 
    textClass: 'text-amber-700 font-semibold',
    badgeClass: 'shadow-sm text-amber-800'
  },
  today_invoices: { 
    icon: Receipt, 
    containerClass: 'border-l-4 bg-emerald-50/40 hover:bg-emerald-50/80', 
    textClass: 'text-emerald-700 font-semibold',
    badgeClass: 'shadow-sm text-emerald-800'
  }
};

export default function TodayWidget() {
  const t = useTranslations("dashboard.today");

  const params = useSearchParams();
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");
    
  const queryParams = startDate && endDate ? { startDate, endDate } : undefined;
    
  const { data, isLoading, isError } = useGetTodayDashQuery(queryParams);

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
        <p className="text-red-500 text-sm font-medium">حدث خطأ أثناء تحميل بيانات اليوم</p>
      </div>
    );
  }

  const stats = data?.data || {};
  
  // استخراج القيم مع وضع 0 كافتراضي (Zero-Filling)
  const newBookings = stats.today_new_bookings || 0;
  const newAssignments = stats.today_assignments || 0;
  const newInvoices = stats.today_invoices || 0;

  // جمع الحركات لمعرفة مدى نشاط النظام اليوم
  const totalActivities = newBookings + newAssignments + newInvoices;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-6 border-b border-slate-100 bg-gray-100/80 p-6">
        <h2 className="text-lg font-medium text-primary gap-3 items-center flex">
          {/* صندوق الأيقونة: حواف ناعمة rounded-lg */}
          <span className="p-2 bg-primary/5 rounded-lg text-primary shadow-sm">
            <CalendarClock className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex items-center gap-2">
            <span>{t('title')}</span>
            {/* الرقم الإجمالي بداخل دائرة أنيقة */}
            <span className="bg-primary/10 text-primary border-none rounded-full font-bold px-3 py-1 text-sm shadow-none">
              {totalActivities}
            </span>
          </div>
        </h2>
      </div>

      {/* List Items */}
      <div className="flex flex-col p-6 pt-0 gap-3 flex-grow">
        {TODAY_KEYS.map((key) => {
          const UI = ITEM_UI[key as keyof typeof ITEM_UI];
          const Icon = UI.icon;
          const count = stats[key as keyof typeof stats] || 0;

          return (
            <div 
              key={key} 
              className={`flex justify-between items-center p-4 rounded-lg transition-all duration-200 ${UI.containerClass}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${UI.textClass}`} strokeWidth={2} />
                <span className={`text-sm ${UI.textClass} tracking-wide`}>
                  {t(`items.${key}`)}
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