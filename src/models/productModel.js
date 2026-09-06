import { supabase } from "../config/supabaseClient.js";

export const ProductModel = {
  async getAll() {
    const { data, error } = await supabase
      .from("products")
      .select("id, sku, name, description, price, stock, category_id");
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("products")
      .select("id, sku, name, description, price, stock, categories (id, name)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { price, stock } = payload;

    // Validasi manual tingkat Medium: Cek harga atau stok di bawah nol
    if (price !== undefined && price < 0) {
      throw new Error("Gagal: Harga produk tidak boleh bernilai negatif atau di bawah nol.");
    }
    if (stock !== undefined && stock < 0) {
      throw new Error("Gagal: Stok produk tidak boleh bernilai negatif atau di bawah nol.");
    }

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select();

    if (error) throw error;
    return data[0];
  },

  async update(id, payload) {
    const { price, stock } = payload;

    if (price !== undefined && price < 0) {
      throw new Error("Gagal: Harga produk tidak boleh bernilai negatif.");
    }
    if (stock !== undefined && stock < 0) {
      throw new Error("Gagal: Stok produk tidak boleh bernilai negatif.");
    }

    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },

  async remove(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return { message: "Product deleted successfully" };
  },
};