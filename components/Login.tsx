"use client";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token, loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await dispatch(login(email));
    if (res.meta.requestStatus === "fulfilled") {
      router.push("/products");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">
          Login
        </h1>
        <div className="mb-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>

        <Button
          type="submit"
          color="primary"
          disabled={loading}
          className="w-full text-background"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </form>
    </div>
  );
}
