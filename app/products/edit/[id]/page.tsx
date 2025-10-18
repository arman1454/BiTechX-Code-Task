"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { useLoading } from "@/components/LoadingProvider";
import { Card, CardBody } from "@heroui/card";
import { updateProduct } from "@/store/productsSlice";

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  // Unwrap params proxy if React.use is available (Next.js app dir compatibility)
  const actualParams =
    typeof (React as any).use === "function"
      ? (React as any).use(params)
      : params;
  // The route param is a slug (we changed links to use slug). We'll fetch by slug then use the returned product.id (UUID) for PUT.
  const { id: slug } = actualParams;
  const [productId, setProductId] = useState<string | null>(null);
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    images: "",
    categoryId: "",
  });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://api.bitechx.com/categories", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };

    fetchCategories();
  }, [token]);

  const { show, hide } = useLoading();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      // If Redux token is falsy, check localStorage directly (client-only)
      const savedToken =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const effectiveToken = token || savedToken;
      if (!effectiveToken) {
        setError("Please login to load product details");
        setLoadingProduct(false);
        return;
      }
      show();
      setLoadingProduct(true);
      try {
        // GET by slug per API docs
        const res = await fetch(
          `https://api.bitechx.com/products/${encodeURIComponent(slug)}`,
          {
            headers: { Authorization: `Bearer ${effectiveToken}` },
          }
        );
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load product details");
        }
        const data = await res.json();
        // store the UUID for later PUT
        setProductId(data.id);
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          images: data.images?.[0] || "",
          categoryId: data.category?.id || "",
        });
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoadingProduct(false);
        hide();
      }
    };

    fetchProduct();
  }, [slug, token]);

  const validate = () => {
    const newErrors: any = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = "Price must be a positive number";
    if (!form.images.trim()) newErrors.images = "Image URL is required";
    if (!form.categoryId) newErrors.categoryId = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    show();
    setLoading(true);
    setError(null);

    try {
      // Use UUID for update; ensure we have it (API expects id UUID for PUT)
      if (!productId) {
        setError("Product UUID not available yet. Please wait and try again.");
        setLoading(false);
        return;
      }
      const payload = {
        id: productId,
        data: {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          categoryId: form.categoryId,
          images: [form.images],
        },
      };

      const res = await dispatch(updateProduct(payload));
      if (res.meta.requestStatus === "fulfilled") {
        const data = res.payload as any;
        if (data?.slug) router.push(`/products/${data.slug}`);
        else router.push("/products");
      } else {
        setError((res.payload as any) || "Failed to update product");
      }
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
      hide();
    }
  };

  if (loadingProduct)
    return <p className="p-6 text-center text-gray-500">Loading product...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h1>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}

            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}

            <Input
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
            />
            {errors.price && (
              <p className="text-red-500 text-sm">{errors.price}</p>
            )}

            <Input
              label="Image URL"
              name="images"
              value={form.images}
              onChange={handleChange}
            />
            {errors.images && (
              <p className="text-red-500 text-sm">{errors.images}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 text-sm">{errors.categoryId}</p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-700"
              >
                {loading ? "Saving..." : "Update Product"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="border px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
