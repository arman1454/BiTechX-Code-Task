"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { deleteProduct } from "@/store/productsSlice";
import { Button } from "@heroui/button";
import { useLoading } from "@/components/LoadingProvider";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

export default function ProductDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const actualParams =
    typeof (React as any).use === "function"
      ? (React as any).use(params)
      : params;
  const { slug } = actualParams;
  const token = useAppSelector((s) => s.auth.token);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { show, hide } = useLoading();

  useEffect(() => {
    const fetchProduct = async () => {
      show();
      setLoading(true);
      setError(null);
      if (!token) {
        setError("Please login to view product details");
        setLoading(false);
        hide();
        return;
      }
      try {
        const res = await fetch(
          `https://api.bitechx.com/products/${encodeURIComponent(slug)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load product");
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
        hide();
      }
    };

    fetchProduct();
  }, [slug, token]);

  const { show: showLoading, hide: hideLoading } = useLoading();

  const handleDelete = async () => {
    if (!product) return;
    try {
      showLoading();
      await dispatch(deleteProduct(product.id)).unwrap();
      router.push("/products");
    } catch (err: any) {
      setError(err.message || "Delete failed");
    } finally {
      hideLoading();
    }
  };

  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!product) return <p className="p-6 text-center">Product not found</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-secondary text-center sm:text-left">
          Product Details
        </h1>
        <div className="flex flex-wrap justify-center sm:justify-end gap-3">
          <Button
            className="text-background bg-secondary"
            onPress={() => router.push(`/products/edit/${product.slug}`)}
          >
            Edit
          </Button>
          <Button
          className="text-background bg-accent"
            onPress={() => {
              setConfirmDelete(true);
              setIsModalOpen(true);
            }}
          >
            Delete
          </Button>
          <Button
            variant="bordered"
            onPress={() => router.push("/products")}
          >
            Home
          </Button>
        </div>
      </div>

      {/* Product display */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 sm:p-8 flex flex-col md:flex-row gap-8">
        {/* Image section */}
        <div className="flex justify-center md:justify-start md:w-1/2">
          <img
            src={product.images?.[0] || "/placeholder.jpg"}
            alt={product.name}
            className="w-full max-w-sm h-auto object-cover rounded-lg shadow-sm"
          />
        </div>

        {/* Details section */}
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {product.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {product.description || "No description available."}
          </p>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-lg font-semibold text-primary">
              ${product.price}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Category:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {product.category?.name || "Uncategorized"}
              </span>
            </p>
            {product.stock && (
              <p className="text-sm text-gray-500 mt-1">
                In Stock:{" "}
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {product.stock}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* HeroUI modal for confirmation */}
      <Modal
        isOpen={isModalOpen && confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setIsModalOpen(false);
        }}
      >
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this product?</p>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-center gap-4 w-full">
              <Button
                className="bg-accent text-background"
                onPress={async () => {
                  await handleDelete();
                  setIsModalOpen(false);
                }}
              >
                Yes, Delete
              </Button>
              <Button
                variant="bordered"
                onPress={() => {
                  setConfirmDelete(false);
                  setIsModalOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
