
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ATTACH JWT TOKEN TO EVERY REQUEST
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("mediflow-token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Do not log response bodies: they may contain confidential patient or payment information.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// CSV DOWNLOAD
export const downloadCsv = (
  filename: string,
  rows: Record<string, unknown>[]
) => {
  if (!rows.length) return;

  const keys = Object.keys(rows[0]);

  const csv = [
    keys.join(","),
    ...rows.map((row) =>
      keys
        .map(
          (key) =>
            `"${String(row[key] ?? "").replaceAll('"', '""')}"`
        )
        .join(",")
    ),
  ].join("\n");

  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};
