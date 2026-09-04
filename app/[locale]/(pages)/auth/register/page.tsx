"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { registerSchema, RegisterFormValues } from "@/lib/validation/authShema"
import { useRegisterMutation } from "@/redux/features/authApiSlice"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "@/i18n/navigation"

export default function RegisterPage() {
  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", phone: "", password: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await registerUser(values).unwrap();
      
      // رسالة النجاح من الباك إند بالظبط
      toast.success(response.message);
      
      router.push("/dashboard/client"); 
    } catch (err: any) {
  

      if (err?.data?.message) {
        toast.error(err.data.message); 
      } 
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-background p-8 rounded-xl border shadow-sm">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p className="text-sm text-muted-foreground mt-2">Join us to get started with our services</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full Name</label>
            <Input type="text" placeholder="John Doe" {...form.register("full_name")} />
            {form.formState.errors.full_name && <span className="text-xs text-destructive mt-1 block">{form.formState.errors.full_name.message}</span>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Email Address</label>
            <Input type="email" placeholder="name@example.com" {...form.register("email")} />
            {form.formState.errors.email && <span className="text-xs text-destructive mt-1 block">{form.formState.errors.email.message}</span>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Phone Number</label>
            <Input type="tel" placeholder="01xxxxxxxxx" {...form.register("phone")} />
            {form.formState.errors.phone && <span className="text-xs text-destructive mt-1 block">{form.formState.errors.phone.message}</span>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <Input type="password" placeholder="••••••••" {...form.register("password")} />
            {form.formState.errors.password && <span className="text-xs text-destructive mt-1 block">{form.formState.errors.password.message}</span>}
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in here </Link>
        </div>
      </div>
    </div>
  )
}