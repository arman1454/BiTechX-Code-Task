"use client";

import { Input } from "@heroui/input";
import { Search } from "lucide-react"; 
import React from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  loading?: boolean;
}

export default function SearchBar({ value, onChange, loading }: Props) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <Input
        size="lg"
        variant="underlined"
        label="Search"
        color="secondary"
        placeholder="Search by product name..."
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        className="w-full md:w-1/3 font-bold"
        type="search"
        startContent={<Search className="text-secondary w-5 h-5" />}
      />
      {loading && (
        <div className="flex items-center">
          {React.createElement(require("@heroui/spinner").Spinner as any, {
            size: "sm",
            className: "text-primary",
          })}
        </div>
      )}
    </div>
  );
}
