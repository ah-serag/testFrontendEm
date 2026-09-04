"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useGetInventoryTransactionsQuery } from "@/redux/features/wareHouse";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, PackageSearch, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

import DateFilter from "@/components/shared/DateFilter";
import RefreshButton from "@/components/shared/RefreshButton";

export default function InventoryTransactionsPage() {
  const t = useTranslations("inventoryTransactions");
  const locale = useLocale();

  const params = useSearchParams();
  const startDate = params.get("startDate") || "";
  const endDate = params.get("endDate") || "";
  
  const [filters, setFilters] = useState({
    search: "",
    transaction_type: "",
    source: "",
    limit: 20,
    page: 1, 
  });

  const queryParams = {
    ...filters,
    start_date: startDate,
    end_date: endDate,
  };

  const { data: transactionsData, isLoading, refetch, isFetching, isError } = useGetInventoryTransactionsQuery(queryParams);

  // --- Formatters & Badges ---
  const getTransactionBadge = (type: string) => {
    if (type === 'IN') {
      return (
        <Badge className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm font-normal">
          <ArrowDownRight size={12} /> {t("filters.in")}
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm font-normal">
        <ArrowUpRight size={12} /> {t("filters.out")}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' }).format(amount || 0);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="flex flex-col p-2">
      
      {/* ================= HEADER (الهيكل الثابت) ================= */}
      <div className="flex flex-col md:flex-row rounded-2xl flex-wrap justify-between items-start md:items-center gap-5 bg-white p-3 border border-gray-200 shadow-md m-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary">
            <PackageSearch size={24} strokeWidth={1.5} />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-lg md:text-xl font-normal tracking-tight text-primary">
                {t("title")}
              </h1>
              {!isLoading && transactionsData?.pagination && (
                <Badge className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/10 rounded-lg font-bold px-2.5 py-0.5 text-[11px] shadow-none">
                  {transactionsData.pagination.total_records}
                </Badge>
              )}
            </div>
            <p className="text-slate-400 mt-1 text-sm font-medium">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* الجزء الأيسر: الأزرار */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* يمكنك إضافة زر إنشاء حركة مخزنية هنا مستقبلاً إذا احتجت */}
          <RefreshButton onRefresh={refetch} isFetching={isFetching} variant="icon" />
        </div>
      </div>

      <div className="p-3 space-y-6 min-h-screen text-slate-900 w-full overflow-hidden bg-slate-50/50">
        
        {/* ================= FILTERS & DATE ================= */}
        <div className="flex flex-col gap-4 bg-white border border-slate-200/60 shadow-sm p-6 rounded-2xl w-full">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t("filters.searchPlaceholder")}
                className="pl-11 pr-4 w-full rounded-xl border-slate-200 shadow-sm h-11 bg-slate-50/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>

            {/* Select Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              
              <Select onValueChange={(val) => setFilters({ ...filters, transaction_type: val === "all" ? "" : val, page: 1 })}>
                <SelectTrigger className="w-full sm:w-[200px] px-4 rounded-xl border-slate-200 shadow-sm h-11 bg-slate-50/50 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={t("filters.typeLabel")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                  <SelectItem value="all" className="rounded-lg">{t("filters.allTypes")}</SelectItem>
                  <SelectItem value="IN" className="rounded-lg">{t("filters.in")}</SelectItem>
                  <SelectItem value="OUT" className="rounded-lg">{t("filters.out")}</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(val) => setFilters({ ...filters, source: val === "all" ? "" : val, page: 1 })}>
                <SelectTrigger className="w-full sm:w-[200px] px-4 rounded-xl border-slate-200 shadow-sm h-11 bg-slate-50/50 focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder={t("filters.sourceLabel")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                  <SelectItem value="all" className="rounded-lg">{t("filters.allSources")}</SelectItem>
                  <SelectItem value="JOB_EXECUTION" className="rounded-lg">{t("filters.source_JOB_EXECUTION")}</SelectItem>
                  <SelectItem value="PURCHASE" className="rounded-lg">{t("filters.source_PURCHASE")}</SelectItem>
                  <SelectItem value="RETURN" className="rounded-lg">{t("filters.source_RETURN")}</SelectItem>
                  <SelectItem value="ADJUSTMENT" className="rounded-lg">{t("filters.source_ADJUSTMENT")}</SelectItem>
                </SelectContent>
              </Select>
              
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-100">
            <DateFilter />
          </div>
        </div>

        {/* ================= DATA TABLE ================= */}
        <div className="w-full">
          {isLoading ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center text-slate-400 font-light shadow-sm">
              جاري التحميل...
            </div>
          ) : isError ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center text-red-400 font-light shadow-sm">
              حدث خطأ في تحميل البيانات
            </div>
          ) : transactionsData?.data?.length === 0 ? (
            <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center text-slate-400 font-light shadow-sm">
              {t("table.noData")}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[1000px]">
                  <TableHeader className="bg-slate-50 border-b border-slate-100">
                    <TableRow>
                      <TableHead className="font-medium text-center text-slate-500 w-[80px]">{t("table.id")}</TableHead>
                      <TableHead className="font-medium text-center text-slate-500">{t("table.material")}</TableHead>
                      <TableHead className="font-medium text-center text-slate-500">{t("table.type")}</TableHead>
                      <TableHead className="font-medium text-center text-slate-500">{t("table.source")}</TableHead>
                      <TableHead className="font-medium text-center text-slate-500">{t("table.quantity")}</TableHead>
                      <TableHead className="font-medium text-center text-slate-500">{t("table.balanceAfter")}</TableHead>
                      <TableHead className="font-medium text-center text-slate-500">{t("table.cost")}</TableHead>
                      <TableHead className="font-medium text-center text-slate-500">{t("table.user")}</TableHead>
                      <TableHead className="font-medium text-center text-slate-500">{t("table.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData?.data?.map((tx: any) => (
                      <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors text-center border-b border-slate-100">
                        
                        <TableCell className="font-mono text-xs text-slate-400">
                          #{tx.id}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col gap-0.5 items-center">
                            <span className="text-sm font-medium text-slate-800">{tx.material_name}</span>
                            <span className="text-xs text-slate-400 font-mono">{tx.material_code}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-center">
                            {getTransactionBadge(tx.transaction_type)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex text-wrap flex-col  items-center gap-0.5 max-w-[150px] mx-auto">
                            <span className="text-xs font-bold text-slate-700">
                              {t(`filters.source_${tx.source}`)}
                            </span>
                            {tx.notes && (
                              <span className="text-[10px] text-wrap text-slate-500 truncate w-full text-center" title={tx.notes}>
                                {tx.notes}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm font-bold text-slate-800">
                            {tx.transaction_type === 'IN' ? '+' : '-'}{tx.quantity}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 text-xs font-bold">
                            {tx.balance_after}
                          </span>
                        </TableCell>

                        <TableCell className="text-sm font-medium text-slate-900">
                          {formatCurrency(tx.total_cost)}
                        </TableCell>

                        <TableCell className="text-xs text-slate-600 font-medium">
                          {tx.created_by_name || "-"}
                        </TableCell>

                        <TableCell className="text-xs text-slate-500 font-medium">
                          {tx.created_at ? new Date(tx.created_at).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* ================= PAGINATION ================= */}
          {transactionsData?.pagination && transactionsData.pagination.total_pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 mt-4 border border-slate-200/60 bg-white rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-slate-500 font-light w-full sm:w-auto text-center sm:text-left">
                <div>
                  {t("pagination.page")} <span className="font-medium text-slate-900">{transactionsData.pagination.current_page}</span> {t("pagination.of")} <span className="font-medium text-slate-900">{transactionsData.pagination.total_pages}</span>
                </div>
                <div className="hidden sm:block border-l border-slate-200 h-4" />
           
              </div>
              
              <div className="flex gap-2 flex-col md:flex-row w-full sm:w-auto justify-center sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(transactionsData.pagination.current_page - 1)}
                  disabled={transactionsData.pagination.current_page === 1}
                  className="rounded-xl shadow-sm border-slate-200 text-slate-600 hover:text-slate-900 w-full sm:w-auto h-10 px-4"
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(transactionsData.pagination.current_page + 1)}
                  disabled={transactionsData.pagination.current_page === transactionsData.pagination.total_pages}
                  className="rounded-xl shadow-sm border-slate-200 text-slate-600 hover:text-slate-900 w-full sm:w-auto h-10 px-4"
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}