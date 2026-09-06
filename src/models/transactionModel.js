import { supabase } from "../config/supabaseClient.js";

export const TransactionModel = {
  async create(payload) {
    const { customer_id, product_id, quantity } = payload;

    // 1. Ambil data produk untuk cek stok & harga
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("price, stock")
      .eq("id", product_id)
      .single();

    if (productError) throw productError;

    // 2. Validasi apakah stok mencukupi
    if (product.stock < quantity) {
      throw new Error("Stok produk tidak mencukupi untuk transaksi ini");
    }

    // 3. Hitung total harga
    const total_price = product.price * quantity;

    // 4. Kurangi stok produk di database
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: product.stock - quantity })
      .eq("id", product_id);

    if (updateError) throw updateError;

    // 5. Masukkan data ke tabel transactions
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert([{ customer_id, product_id, quantity, total_price }])
      .select()
      .single();

    if (transactionError) throw transactionError;
    return transaction;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        quantity,
        total_price,
        created_at,
        customers (name),
        products (name, price)
      `);
      
    if (error) throw error;
    return data;
  }
};