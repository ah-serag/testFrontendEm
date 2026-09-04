'use client';

import { useGetUsersDashQuery } from "@/redux/features/dashMangerSlice";
import { useTranslations } from 'next-intl';
import { 
  UserCog, 
  ShieldAlert, 
  ShieldCheck, 
  UserCheck, 
  Wrench, 
  User 
} from "lucide-react";

const ALL_USER_ROLES = [
  'superadmin',
  'admin',
  'supervisor',
  'technician',
  'client'
];

const ROLE_UI = {
  superadmin: { 
    icon: ShieldAlert, 
  },
  admin: { 
    icon: ShieldCheck, 
  },
  supervisor: { 
    icon: UserCheck, 
  },
  technician: { 
    icon: Wrench, 
  },
  client: { 
    icon: User, 
  }
};

export default function UsersWidget() {
  const t = useTranslations("dashboard.users");
  const { data, isLoading, isError } = useGetUsersDashQuery(undefined);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm animate-pulse h-[420px]">
        <div className="h-6 bg-slate-100 rounded-lg w-1/3 mb-6"></div>
        <div className="h-10 bg-slate-100 rounded-lg w-1/4 mb-10"></div>
        <div className="flex flex-col gap-3">
           {[...Array(5)].map((_, i) => (
             <div key={i} className="h-10 bg-slate-50 rounded-lg w-full"></div>
           ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8 shadow-sm h-[420px] flex items-center justify-center">
        <p className="text-red-500 text-sm font-medium">حدث خطأ أثناء تحميل بيانات المستخدمين</p>
      </div>
    );
  }

  const stats = data?.data?.roles || {};
  const total = data?.data?.total || 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col">
      
      <div className="mb-6 border-b border-slate-100 bg-gray-100/80 p-6">
        <h2 className="text-lg font-medium text-primary gap-3 items-center flex">
          {/* صندوق الأيقونة: حواف ناعمة rounded-lg */}
          <span className="p-2 bg-primary/5 rounded-lg text-primary shadow-sm">
            <UserCog className="w-5 h-5" strokeWidth={1.5} />
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
        {ALL_USER_ROLES.map((role) => {
          const UI = ROLE_UI[role as keyof typeof ROLE_UI];
          const Icon = UI.icon;
          const count = stats[role] || 0;
          const isHighlight = role === 'superadmin' || role === 'admin';

          return (
            <div 
              key={role} 
              className={`flex justify-between items-center p-3 rounded-lg transition-all duration-200 border-l-4 border-gray-300 bg-gray-100 hover:bg-gray-200`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 text-primary font-semibold`} strokeWidth={isHighlight ? 2 : 1.5} />
                <span className={`text-sm text-primary font-semibold tracking-wide`}>
                  {t(`roles.${role}`)}
                </span>
              </div>
              
              <span className={`text-sm font-bold px-3 py-1 rounded-full border shadow-sm bg-white text-primary border-slate-200`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}