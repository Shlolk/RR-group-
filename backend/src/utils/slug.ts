export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function generateOrderNumber(): string {
  const date = new Date()
  const y = date.getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `RR-${y}-${rand}`
}

export function generateInvoiceNumber(): string {
  const date = new Date()
  const y = date.getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `INV-${y}-${rand}`
}

export function formatCurrency(amount: number | string, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount))
}