"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProducts,
  searchProducts,
  deleteProduct,
} from "@/store/productsSlice";
import { useLoading } from "@/components/LoadingProvider";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import ProductsToolbar from "@/components/ProductsToolbar";

import { Button } from "@heroui/button";
import { Pagination } from "@heroui/pagination";

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const { list, loading, error, offset, limit, total } = useAppSelector(
    (state) => state.products
  );
  const [searchText, setSearchText] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const currentPage = Math.floor(offset / limit) + 1;
  let totalPages: number;
  if (
    typeof (list as any) !== "undefined" &&
    typeof (limit as any) !== "undefined"
  ) {
    
    const totalItems = typeof (/* get total from selector */ (null as any));
  }
  totalPages =
    total && total > 0
      ? Math.max(1, Math.ceil(total / limit))
      : Math.max(3, currentPage + 2);

  const { show, hide } = useLoading();
  useEffect(() => {
    setSelectedPage(currentPage);
  }, [currentPage]);
  useEffect(() => {
    show();
    const p = dispatch(fetchProducts({ offset: 0, limit }));
    p.finally(() => hide());
  }, [dispatch, limit]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchLoading(true);
      if (searchText.trim()) {
        const q = dispatch(searchProducts(searchText));
        q.finally(() => setSearchLoading(false));
      } else {
        const q = dispatch(fetchProducts({ offset: 0, limit }));
        q.finally(() => setSearchLoading(false));
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText, dispatch, limit]);

  // Pagination handlers
  const handleNext = () => {
    const next = currentPage + 1;
    setSelectedPage(next);
    show();
    const p = dispatch(fetchProducts({ offset: offset + limit, limit }));
    p.finally(() => hide());
  };
  const handlePrev = () => {
    const prev = Math.max(1, currentPage - 1);
    setSelectedPage(prev);
    show();
    const p = dispatch(
      fetchProducts({ offset: Math.max(0, offset - limit), limit })
    );
    p.finally(() => hide());
  };

  // Handle delete
  const handleDelete = (id: string) => {
    show();
    const p = dispatch(deleteProduct(id));
    p.finally(() => {
      hide();
      setConfirmDeleteId(null);
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-background text-primary min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary text-center sm:text-left">
          Products
        </h1>

        <ProductsToolbar onAdd={() => router.push("/products/new")} />
      </div>

      <SearchBar
        value={searchText}
        onChange={setSearchText}
        loading={searchLoading}
      />

      {loading && (
        <p className="text-secondary text-center">Loading products...</p>
      )}
      {error && <p className="text-accent text-center">{error}</p>}

      {/* Products Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {searchLoading
          ? 
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border-2 border-secondary rounded-lg p-4 animate-pulse h-64"
              />
            ))
          : !loading
            ? list.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={(slug) => router.push(`/products/${slug}`)}
                  onEdit={(slug) => router.push(`/products/edit/${slug}`)}
                  onDelete={(id) => handleDelete(id)}
                />
              ))
            : 
              null}
      </div>

      <div className="flex justify-center items-center text-background gap-4 mt-8">
        <Button
          onPress={handlePrev}
          disabled={offset === 0}
          variant="ghost"
          className={offset === 0 ? "opacity-50 cursor-not-allowed" : ""}
        >
          Previous
        </Button>

        <Pagination
          color="secondary"
          initialPage={selectedPage}
          key={selectedPage}
          total={totalPages}
          onChange={(p: number) => {
            // immediate UI feedback
            setSelectedPage(p);
            show();
            const newOffset = (p - 1) * limit;
            const q = dispatch(fetchProducts({ offset: newOffset, limit }));
            q.finally(() => hide());
          }}
        />

        <Button
          onPress={handleNext}
          disabled={list.length < limit}
          variant="ghost"
          className={list.length < limit ? "opacity-50 cursor-not-allowed" : ""}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
