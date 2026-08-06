import axios from "axios";

const API = "http://localhost:8000/api/transactions";

function authHeader() {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// ==============================
// Get All Transactions
// ==============================

export async function getTransactions() {
  const res = await axios.get(API, authHeader());

  return res.data.data;
}

// ==============================
// Create Manual Invoice
// ==============================

export async function createTransaction(data) {
  const res = await axios.post(
    API,
    data,
    authHeader()
  );

  return res.data;
}

// ==============================
// Delete Transaction
// ==============================

export async function deleteTransaction(id) {
  const res = await axios.delete(
    `${API}/${id}`,
    authHeader()
  );

  return res.data;
}

// ==============================
// Get Single Invoice
// ==============================

export async function getTransaction(id) {
  const res = await axios.get(
    `${API}/${id}`,
    authHeader()
  );

  return res.data;
}

// ==============================
// Update Invoice
// ==============================

export async function updateTransaction(
  id,
  data
) {
  const res = await axios.put(
    `${API}/${id}`,
    data,
    authHeader()
  );

  return res.data;
}