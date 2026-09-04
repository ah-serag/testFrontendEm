'use client';

import { useGetBookingDashQuery } from "@/redux/features/dashMangerSlice";
import { useTranslations } from 'next-intl';
import { 
  Calendar, 
  Clock, 
  Activity, 
  Check, 
  X, 
  Ban, 
  CalendarDays, 
  UserCheck, 
  FileText 
} from "lucide-react";
import { useSearchParams } from "next/navigation";

const ALL_BOOKING_STATUSES = [
  'pending',
  'in_progress',
  'confirmed',
  'scheduled',
  'assigned',
  'completed',
  'cancelled',
  'rejected'
];

// خريطة لتحديد أيقونة، ولون، وتنسيق مخصص لكل حالة
const STATUS_UI = {
  pending: { 
    icon: Clock, 
    containerClass: 'border-l-4 border-gray-300 bg-amber-100/20 hover:bg-amber-100/40', 
    textClass: 'text-amber-700 font-semibold',
    badgeClass: ' text-amber-800 shadow-sm'
  },
  in_progress: { 
    icon: Activity, 
    containerClass: 'border-l-4 border-gray-300 bg-sky-200/20 hover:bg-sky-200/40', 
    textClass: 'text-sky-700 font-semibold',
    badgeClass: ' text-sky-800 shadow-sm'
  },
  // الحالات العادية
  confirmed: { icon: Check, containerClass: 'border-l-4 border-gray-300 hover:bg-gray-200 bg-gray-100', textClass: ' font-semibold text-primary', badgeClass: 'shadow-sm text-primary border-slate-200' },
  scheduled: { icon: CalendarDays, containerClass: 'border-l-4 border-gray-300 hover:bg-gray-200 bg-gray-100', textClass: ' font-semibold text-primary', badgeClass: 'shadow-sm text-primary border-slate-200' },
  assigned: { icon: UserCheck, containerClass: 'border-l-4 border-gray-300 hover:bg-gray-200 bg-gray-100', textClass: ' font-semibold text-primary', badgeClass: 'shadow-sm text-primary border-slate-200' },
  completed: { icon: FileText, containerClass: 'border-l-4 border-gray-300 hover:bg-gray-200 bg-gray-100', textClass: ' font-semibold text-primary', badgeClass: 'shadow-sm text-primary border-slate-200' },
  cancelled: { icon: X, containerClass: 'border-l-4 border-gray-300 hover:bg-gray-200 bg-gray-100', textClass: ' font-semibold text-primary', badgeClass: 'bg-gray-100 text-primary border-transparent' },
  rejected: { icon: Ban, containerClass: 'border-l-4 border-gray-300 hover:bg-gray-200 bg-gray-100', textClass: ' font-semibold text-primary', badgeClass: 'bg-gray-100 text-primary border-transparent' }
};

export default function BookingWidget() {
  const t = useTranslations("dashboard.bookings");

  const params = useSearchParams();
  const startDate = params.get("startDate");
  const endDate = params.get("endDate");

  const queryParams = startDate && endDate ? { startDate, endDate } : undefined;

  const { data, isLoading, isError } = useGetBookingDashQuery(queryParams);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm animate-pulse h-[380px]">
        <div className="h-6 bg-slate-100 rounded-lg w-1/3 mb-6"></div>
        <div className="h-10 bg-slate-100 rounded-lg w-1/4 mb-10"></div>
        <div className="grid grid-cols-2 gap-4">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="h-10 rounded-lg bg-slate-50 w-full"></div>
           ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8 shadow-sm flex items-center justify-center h-[380px]">
        <p className="text-red-500 text-sm font-medium">حدث خطأ أثناء تحميل بيانات الحجوزات</p>
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
            <Calendar className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex items-center gap-2">
            <span>{t('title')}</span>
            {/* الرقم الإجمالي بداخل دائرة أنيقة بجوار العنوان */}
            <span className="bg-primary/10 text-primary border-none rounded-full font-bold px-3 py-1 text-sm shadow-none">
              {total}
            </span>
          </div>
        </h2>
      </div>

      {/* Statuses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 p-6 pt-0 gap-4 flex-grow">
        {ALL_BOOKING_STATUSES.map((status) => {
          const UI = STATUS_UI[status as keyof typeof STATUS_UI];
          const Icon = UI.icon;
          const count = stats[status] || 0;
          const isHighlight = status === 'pending' || status === 'in_progress';

          return (
            <div 
              key={status} 
              className={`flex justify-between items-center p-3 rounded-lg transition-colors ${UI.containerClass}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${UI.textClass}`} strokeWidth={isHighlight ? 2 : 1.5} />
                <span className={`text-sm ${UI.textClass}`}>
                  {t(`statuses.${status}`)}
                </span>
              </div>
              
              <span className={`text-sm font-medium px-3 py-1 rounded-full border ${UI.badgeClass}`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}