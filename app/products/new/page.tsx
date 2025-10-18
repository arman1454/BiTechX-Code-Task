"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { createProduct } from '@/store/productsSlice'
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

interface Category {
  id: string
  name: string
}

export default function CreateProductPage() {
  const router = useRouter()
  const token = useAppSelector((state) => state.auth.token)
  const dispatch = useAppDispatch()

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://api.bitechx.com/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await res.json()
        setCategories(data)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    if (token) fetchCategories()
  }, [token])

  // ✅ Form validation
  const validate = () => {
    const newErrors: any = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = 'Price must be a positive number'
    if (!form.image.trim()) newErrors.image = 'Image URL is required'
    if (!form.categoryId) newErrors.categoryId = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        images: [form.image],
        categoryId: form.categoryId,
      }
      const res = await dispatch(createProduct(payload));
      if (res.meta.requestStatus === 'fulfilled') {
        router.push('/products')
      } else {
        setError((res.payload as any) || 'Failed to create product')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <div className="mt-1">
            <Input
              label=""
              type="text"
              placeholder="Product name"
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows={4}
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <div className="mt-1">
            <Input
              label=""
              type="number"
              placeholder="0.00"
              value={form.price}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, price: e.target.value })
              }
            />
          </div>
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <div className="mt-1">
            <Input
              label=""
              type="text"
              placeholder="https://..."
              value={form.image}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, image: e.target.value })
              }
            />
          </div>
          {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId}</p>}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <Button
            type="submit"
            color="primary"
            disabled={loading}
            className="w-full text-background"
          >
            {loading ? 'Saving...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  )
}
