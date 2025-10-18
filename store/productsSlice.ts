import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface Category {
  id: string;
  name: string;
  image: string;
  description?: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

interface ProductsState {
  list: Product[];
  loading: boolean;
  error: string | null;
  offset: number;
  limit: number;
  total: number;
  searchQuery: string;
}

const initialState: ProductsState = {
  list: [],
  loading: false,
  error: null,
  offset: 0,
  limit: 10,
  total: 0,
  searchQuery: "",
};

// Fetch products (with pagination or categoryId)
export const fetchProducts = createAsyncThunk<any, { offset?: number; limit?: number; categoryId?: string }, { state: RootState }>(
  "products/fetch",
  async (
    { offset = 0, limit = 10, categoryId },
    { getState, rejectWithValue }
  ) => {
    const token = getState().auth.token;
    try {
      let url = `https://api.bitechx.com/products?offset=${offset}&limit=${limit}`;
      if (categoryId) url += `&categoryId=${categoryId}`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      // The API may return either an array of products or an object { items: Product[], total: number }
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Create product
export const createProduct = createAsyncThunk<
  Product,
  { name: string; description: string; price: number; images: string[]; categoryId: string },
  { state: RootState }
>("products/create", async (payload, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const res = await fetch(`https://api.bitechx.com/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to create product");
    }
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// Update product
export const updateProduct = createAsyncThunk<
  Product,
  { id: string; data: { name: string; description: string; price: number; images: string[]; categoryId: string } },
  { state: RootState }
>("products/update", async ({ id, data }, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const res = await fetch(`https://api.bitechx.com/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to update product");
    }
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// Search products by name
export const searchProducts = createAsyncThunk<
  Product[],
  string,
  { state: RootState }
>("products/search", async (searchedText, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const res = await fetch(
      `https://api.bitechx.com/products/search?searchedText=${encodeURIComponent(
        searchedText
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error("Failed to search products");
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// Delete product by ID
export const deleteProduct = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("products/delete", async (id, { getState, rejectWithValue }) => {
  const token = getState().auth.token;
  try {
    const res = await fetch(`https://api.bitechx.com/products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to delete product");
    // Some APIs return an empty body on DELETE. Try to parse JSON, but fall back to the id we passed.
    let data: any = null;
    try {
      data = await res.json();
    } catch (e) {
      // ignore parse errors
    }
    return (data && data.id) || id;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Action payload may be an array or an object with { items, total }
        if (Array.isArray(action.payload)) {
          state.list = action.payload as Product[];
        } else if (action.payload && typeof action.payload === "object") {
          const payload: any = action.payload;
          state.list = Array.isArray(payload.items) ? payload.items : payload.items ?? [];
          state.total = typeof payload.total === "number" ? payload.total : state.total;
        } else {
          state.list = [];
        }
        // Update pagination info
        state.offset = action.meta.arg.offset ?? 0;
        state.limit = action.meta.arg.limit ?? 10;
      })

      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p.id !== action.payload);
      });

    // Create product: add to list (prepend)
    builder.addCase(createProduct.fulfilled, (state, action) => {
      if (action.payload) {
        state.list = [action.payload, ...state.list];
        state.total = (state.total || 0) + 1;
      }
    });

    // Update product: replace item in list
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      if (action.payload) {
        state.list = state.list.map((p) => (p.id === action.payload.id ? action.payload : p));
      }
    });
  },
});

export const { setSearchQuery } = productsSlice.actions;
export default productsSlice.reducer;
