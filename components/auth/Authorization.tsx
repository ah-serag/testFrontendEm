"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

import { useAuthorization, Role } from "@/hooks/useAuthorization";
import { Skeleton } from "../ui/skeleton";

interface AuthorizationProps {
  allow: Role[];
  children: ReactNode;
}

export default function Authorization({
  allow,
  children,
}: AuthorizationProps) {
  const router = useRouter();

  const {
    isAuthenticated,
    hasAnyRole,
    initialized
  } = useAuthorization();



  useEffect(() => {

    if (!initialized) return;

    if (!isAuthenticated) {
        router.replace("/auth/login");
        return;
    }

    if (!hasAnyRole(allow)) {
        router.replace("/unauthorized");
    }

}, [
    initialized,
    isAuthenticated,
    allow,
    hasAnyRole,
    router,
]);

  if (!initialized) {
    return  (

     <div className="flex flex-col w-full h-full justify-center items-center gap-4">
        <Skeleton className="w-full h-96 bg-slate-100  " />
        <Skeleton className="w-full h-96 bg-slate-100  " />
       
      </div>
    
    ) }

  if (!isAuthenticated || !hasAnyRole(allow)) {
    return null;
  }

  return <>{children}</>;
}