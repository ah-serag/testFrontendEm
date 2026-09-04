'use client';

import { useGetTeamDashQuery } from "@/redux/features/dashMangerSlice";
import { useTranslations } from 'next-intl';
import { 
  Users, 
  UserCheck, 
  HardHat 
} from "lucide-react";

export default function TeamsWidget() {
  const t = useTranslations("dashboard.teams");
  const { data, isLoading, isError } = useGetTeamDashQuery(undefined);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm animate-pulse h-[380px]">
        <div className="h-6 bg-slate-100 rounded-lg w-1/3 mb-6"></div>
        <div className="h-10 bg-slate-100 rounded-lg w-1/4 mb-10"></div>
        <div className="flex flex-col gap-4">
           <div className="h-12 bg-slate-50 rounded-lg w-full"></div>
           <div className="h-12 bg-slate-50 rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8 shadow-sm h-[380px] flex items-center justify-center">
        <p className="text-red-500 text-sm font-medium">حدث خطأ أثناء تحميل بيانات الفرق</p>
      </div>
    );
  }

  const stats = data?.data || {};
  const totalTeams = stats.total_teams || 0;
  const availableTeams = stats.available_teams || 0;
  const totalMembers = stats.total_members || 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col">
      
      {/* Header */}
      <div className="mb-6 border-b border-slate-100 bg-gray-100/80 p-6">
        <h2 className="text-lg font-medium text-primary gap-3 items-center flex">
          {/* صندوق الأيقونة: حواف ناعمة rounded-lg */}
          <span className="p-2 bg-primary/5 rounded-lg text-primary shadow-sm">
            <Users className="w-5 h-5" strokeWidth={1.5} />
          </span>
          <div className="flex items-center gap-2">
            <span>{t('title')}</span>
            {/* الرقم الإجمالي بداخل دائرة أنيقة */}
            <span className="bg-primary/10 text-primary border-none rounded-full font-bold px-3 py-1 text-sm shadow-none">
              {totalTeams}
            </span>
          </div>
        </h2>
      </div>

      <div className="flex flex-col p-6 pt-0 gap-3 flex-grow">
        
        <div className="flex justify-between items-center p-4 rounded-lg transition-all duration-200 border-l-4 border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-700" strokeWidth={2} />
            <span className="text-sm text-emerald-700 font-semibold tracking-wide">
              {t('available_teams')}
            </span>
          </div>
          <span className="text-sm font-bold px-3 py-1 rounded-full border shadow-sm bg-emerald-100 text-emerald-800 border-emerald-200">
            {availableTeams}
          </span>
        </div>

        <div className="flex justify-between items-center p-4 rounded-lg transition-all duration-200 border-l-4 border-gray-300 hover:bg-gray-200 bg-gray-100">
          <div className="flex items-center gap-3">
            <HardHat className="w-5 h-5 text-primary" strokeWidth={2} />
            <span className="text-sm text-primary font-semibold tracking-wide">
              {t('total_members')}
            </span>
          </div>
          <span className="text-sm font-bold px-3 py-1 rounded-full border shadow-sm bg-white text-primary border-slate-200">
            {totalMembers}
          </span>
        </div>

      </div>

    </div>
  );
}