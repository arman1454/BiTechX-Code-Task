"use client";

import React from "react";
import { Button } from "@heroui/button";
import LogoutButton from "@/components/LogoutButton";

interface Props {
  onAdd: () => void;
}

export default function ProductsToolbar({ onAdd }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
      <Button
        onPress={onAdd}
        className="bg-primary text-background px-4 py-2 rounded-lg font-medium sm:w-auto"
      >
        + Add Product
      </Button>
      <LogoutButton />
    </div>
  );
}
