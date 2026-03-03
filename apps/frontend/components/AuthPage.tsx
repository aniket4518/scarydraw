"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signinSchema, signupSchema } from "@repo/zod";

interface FormErrors {
  email?: string[];
  password?: string[];
  name?: string[];
  general?: string;
}

export function Authpage({ isSignin }: { isSignin: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle email/password signin
  const handleCredentialsAuth = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      if (isSignin) {
        // Validate signin data
        const validationResult = signinSchema.safeParse({
          email: formData.email,
          password: formData.password,
        });

        if (!validationResult.success) {
          setErrors(validationResult.error.flatten().fieldErrors);
          setIsLoading(false);
          return;
        }

        // Sign in with NextAuth
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setErrors({ general: "Invalid email or password" });
          setIsLoading(false);
          return;
        }

        // Successful signin
        router.push("/room");
        router.refresh();
      } else {
        // Validate signup data
        const validationResult = signupSchema.safeParse(formData);

        if (!validationResult.success) {
          setErrors(validationResult.error.flatten().fieldErrors);
          setIsLoading(false);
          return;
        }

        // Call signup API
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setErrors({
            general: data.error || "Failed to create account",
          });
          setIsLoading(false);
          return;
        }

        // Auto-signin after successful signup
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          // Signup succeeded but signin failed - redirect to signin page
          router.push("/signin");
          return;
        }

        // Successful signup and signin
        router.push("/room");
        router.refresh();
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({ general: "An unexpected error occurred" });
      setIsLoading(false);
    }
  };

  // Handle Google signin
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/room" });
    } catch (error) {
      console.error("Google sign in failed", error);
      setErrors({ general: "Google sign in failed" });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-sm w-full bg-white rounded-lg shadow-lg p-6 shadow-sm shadow-red-500/25">
        <div className="m-2 p-2 bg-white rounded">
          <h1 className="text-4xl font-bold mb-4">
            {isSignin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            {isSignin
              ? "Sign in to continue to your workspace"
              : "Start building your amazing project here!"}
          </p>

          {/* General error message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleCredentialsAuth}>
            {/* Name field (signup only) */}
            {!isSignin && (
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full bg-gray-200 p-2 rounded text-black outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 ${
                    errors.name ? "border-2 border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
                )}
              </div>
            )}

            {/* Email field */}
            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full bg-gray-200 p-2 rounded text-black outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 ${
                  errors.email ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Password field */}
            <div className="mb-4">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`w-full bg-gray-200 p-2 rounded text-black outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 ${
                  errors.password ? "border-2 border-red-500" : ""
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password[0]}
                </p>
              )}
              {!isSignin && !errors.password && (
                <p className="text-gray-500 text-xs mt-1">
                  Must be 8+ characters with uppercase, lowercase, number, and
                  special character
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-300 hover:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span>{isSignin ? "Sign in" : "Sign up"}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google signin button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full group bg-white border border-gray-300 text-black px-6 py-3 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-gray-500/25 transition-all duration-300 hover:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Toggle signin/signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
              <a
                href={isSignin ? "/signup" : "/signin"}
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                {isSignin ? "Sign up" : "Sign in"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
