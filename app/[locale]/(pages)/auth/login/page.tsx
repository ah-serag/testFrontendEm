"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, LogIn, Mail, Lock, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { signInSchema, SignInFormValues } from "@/lib/validation/authShema"
import { useSignInMutation } from "@/redux/features/authApiSlice"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

export default function SignInPage() {
  const router = useRouter();
  const [signIn, { isLoading }] = useSignInMutation();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      const response = await signIn(values).unwrap();
      
      toast.success(response.message);
      
      const roleUser = response?.user?.role;
  
      switch(roleUser){
        case "client":
          router.push("/"); 
          break;
        case "superadmin":
        case "admin":
          router.push("/manager"); 
          break;
        case "supervisor":
          router.push("/team"); 
          break;
        default: 
          router.push("/"); 
      }

    } catch (err: any) {
      console.log(err)
      if (err?.data?.message) {
        toast.error(err?.data?.message);
      }
    }
  };

  return (
    // 🌟 الخلفية الفخمة باللون الأساسي (Primary) مع تأثيرات إضاءة ناعمة
    <div className="relative flex min-h-screen items-center justify-center bg-primary p-4 overflow-hidden">
      
      {/* تأثيرات جمالية في الخلفية (Glow Effects) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-black/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      {/* 🌟 كارت تسجيل الدخول (حواف دائرية شديدة الفخامة) */}
      <div className="relative z-10 w-full max-w-[420px] bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 flex items-center justify-center rounded-[1.25rem] mb-6 shadow-sm">
            <LogIn className="w-7 h-7 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-2.5 font-medium leading-relaxed">
            Enter your credentials to access your secure account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Email Input */}
          <div>
            {/* 🔴 تم إبعاد الـ Label عن الـ Input وتصميمه بشكل أنيق جداً */}
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2 block">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
                <Mail size={20} strokeWidth={2} />
              </div>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                {...form.register("email")} 
                disabled={isLoading}
                className={cn(
                  "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium text-sm transition-all duration-300",
                  "focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10",
                  "hover:border-slate-300 disabled:opacity-50"
                )}
              />
            </div>
            {form.formState.errors.email && (
              <span className="text-xs font-semibold text-rose-500 mt-2 ml-2 block flex items-center gap-1">
                • {form.formState.errors.email.message}
              </span>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2 block">
              Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
                <Lock size={20} strokeWidth={2} />
              </div>
              <Input 
                type="password" 
                placeholder="••••••••" 
                {...form.register("password")} 
                disabled={isLoading}
                className={cn(
                  "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50/50 border-slate-200 text-slate-900 font-medium text-sm transition-all duration-300",
                  "focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10",
                  "hover:border-slate-300 disabled:opacity-50"
                )}
              />
            </div>
            {form.formState.errors.password && (
              <span className="text-xs font-semibold text-rose-500 mt-2 ml-2 block flex items-center gap-1">
                • {form.formState.errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 mt-8 rounded-2xl bg-primary hover:bg-primary/90 text-white text-base font-bold shadow-lg shadow-primary/30 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-white/80" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={18} className="text-white/80" />
              </>
            )}
          </Button>

        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-[13px] font-medium text-slate-500">
          Don't have an account?{" "}
          <Link 
            href="/auth/login" 
            className="text-primary font-bold hover:text-primary/80 transition-colors duration-200 underline decoration-primary/30 underline-offset-4"
          >
            Register here
          </Link>
        </div>
        
      </div>
    </div>
  )
}