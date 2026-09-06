import { supabase } from "../config/supabaseClient.js";

export const RestockModel = {
  async create(payload) {
    const { product_id, supplier_name, quantity_added } = payload;

    if (quantity_added <= 0) {
      throw new Error("Jumlah barang yang direstock harus lebih besar dari nol.");
    }

    // 1. Ambil data produk saat ini untuk mengecek stok lama
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock")
      .eq("id", product_id)
      .single();

    if (productError) throw productError;

    // 2. Tambahkan stok produk dengan quantity_added yang baru
    const newStock = product.stock + quantity_added;

    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", product_id);

    if (updateError) throw updateError;

    // 3. Catat data restock ke dalam tabel restocks
    const { data: restock, error: restockError } = await supabase
      .from("restocks")
      .insert([{ product_id, supplier_name, quantity_added }])
      .select()
      .single();

    if (restockError) throw restockError;
    return restock;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("restocks")
      .select(`
        id,
        supplier_name,
        quantity_added,
        created_at,
        products (name, stock)
      `);
      
    if (error) throw error;
    return data;
  }
};