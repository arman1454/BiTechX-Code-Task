"use client";
import { useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import { setToken } from "@/store/authSlice";

export default function TokenInitializer() {
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    try {
      const savedToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (savedToken) dispatch(setToken(savedToken));
    } catch (e) {
      
    }
  }, [dispatch]);

  return null;
}
