"use client"

import Link from "next/link"
import { Form } from "@base-ui/react/form"
import { Field } from "@base-ui/react/field"
import { Input } from "@base-ui/react/input"
import { Button } from "@/components/ui/button"
import { motion } from "motion/react"

export default function SignInPage() {
  return (
    <main className="min-h-svh flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Enter your details below.
          </p>
        </div>

        <Form className="space-y-4">
          <Field.Root name="email" className="space-y-1.5">
            <Field.Label className="text-sm font-medium text-foreground">
              Email
            </Field.Label>
            <Input
              type="email"
              required
              placeholder="you@example.com"
              className="flex h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <Field.Error className="text-xs text-destructive" />
          </Field.Root>

          <Field.Root name="password" className="space-y-1.5">
            <Field.Label className="text-sm font-medium text-foreground">
              Password
            </Field.Label>
            <Input
              type="password"
              required
              placeholder="••••••••"
              className="flex h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
            <Field.Error className="text-xs text-destructive" />
          </Field.Root>

          <Button type="submit" className="w-full" size="lg">
            Sign in
          </Button>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground hover:underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
