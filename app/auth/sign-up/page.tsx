'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['tenant', 'manager']),
})

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema as any),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'tenant',
    },
  })

  const onSubmit = async (data: SignUpFormValues) => {
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      })

      if (authError) {
        toast.error(authError.message || 'Failed to create account')
        return
      }

      router.push('/auth/sign-up-success')
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground mb-1 tracking-tight">Create Account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join SMARTMAINTAIN</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                {...register('fullName')}
                type="text"
                placeholder="John Doe"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary aria-invalid:border-destructive transition-colors text-sm min-h-[44px]"
              />
              {errors.fullName && (
                <p id="fullName-error" role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary aria-invalid:border-destructive transition-colors text-sm min-h-[44px]"
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary aria-invalid:border-destructive transition-colors text-sm min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
                Role
              </label>
              <select
                id="role"
                {...register('role')}
                aria-invalid={!!errors.role}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm min-h-[44px]"
              >
                <option value="tenant">Tenant</option>
                <option value="manager">Manager</option>
              </select>
              {errors.role && (
                <p role="alert" className="text-xs text-destructive mt-1 font-medium">{errors.role.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] text-sm font-medium mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
