'use client';

import { useTranslations } from 'next-intl';
import BookingWidget from '@/components/manager/dashboard/BookingWidget';
import FinancialWidget from '@/components/manager/dashboard/FinancialWidget';
import InvoicesWidget from '@/components/manager/dashboard/InvoicesWidget';
import AssignmentsWidget from '@/components/manager/dashboard/AssignmentsWidget';
import TeamsWidget from '@/components/manager/dashboard/TeamsWidget';
import UsersWidget from '@/components/manager/dashboard/UsersWidget';
import TodayWidget from '@/components/manager/dashboard/TodayWidget';
import DateFilter from '@/components/shared/DateFilter';

export default function DashboardPage() {
  const  t  = useTranslations("dashboard");

  return (
    <div className="min-h-screen bg-slate-50 ">

      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-normal text-primary tracking-tight">
          {t('title')}
        </h1>
       </div> 
      <div> 
        <DateFilter/>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <FinancialWidget/>
        <InvoicesWidget/>
        <TeamsWidget/>

        <TodayWidget/>

        <AssignmentsWidget/> 

        <BookingWidget />
                <UsersWidget/>

      </div>
    </div>
  );
}