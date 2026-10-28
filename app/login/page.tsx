"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ForgotPasswordModal } from "@/components/auth/forgot-password-modal"
import { useToast } from "@/hooks/use-toast"
import { SITE } from "@/lib/site"
import { Building2, Lock, Mail, TrendingUp, Users, BarChart3, CheckCircle2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to dashboard...",
          variant: "success",
        })
        router.push("/dashboard")
      } else {
        const errorMsg = "Invalid email or password. Please check your credentials and try again."
        toast({
          title: "Login Failed",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      const errorMsg = "An error occurred during login. Please try again."
      toast({
        title: "Login Error",
        description: errorMsg,
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("123456")
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2C3E50] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="flex items-center gap-3 mb-8">
          <div className="flex flex-col gap-2 mb-8">
            <img src="/logo.png" alt={SITE.company} className="w-80 h-auto" />
          </div>
        </div>
        <div className="relative z-10 flex justify-center items-center flex-col h-full">
          <div className="space-y-6 mt-16">
            <h1 className="text-5xl font-bold text-white leading-tight">
              Manage Your Leads
              <br />
              <span className="text-[#E8D68A]">Close More Deals</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-md">
              Streamline your sales process with our powerful CRM platform. Track leads, automate follow-ups, and grow
              your business.
            </p>
          </div>
        </div>


      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">{SITE.name}</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back to {SITE.company}</h2>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <ForgotPasswordModal>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-primary hover:text-primary/80"
                    >
                      Forgot password?
                    </Button>
                  </ForgotPasswordModal>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
