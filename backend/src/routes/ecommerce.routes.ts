import { Router } from "express"
import { requireAuth } from "@/middlewares/auth"
import {
  getCartHandler,
  addToCartHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  clearCartHandler,
  checkoutHandler,
  createPaymentHandler,
  verifyPaymentHandler,
  getOrdersHandler,
  getOrderHandler,
  getOrderByNumberHandler,
  cancelOrderHandler,
  addReviewHandler,
  getWishlistHandler,
  toggleWishlistHandler,
  getInvoicesHandler,
  getInvoiceHandler,
  getPaymentsHandler,
} from "@/controllers/ecommerce.controller"

const router = Router()

router.use(requireAuth)

// Cart
router.get("/cart", getCartHandler)
router.post("/cart", addToCartHandler)
router.patch("/cart/items/:itemId", updateCartItemHandler)
router.delete("/cart/items/:itemId", removeCartItemHandler)
router.delete("/cart", clearCartHandler)

// Wishlist
router.get("/wishlist", getWishlistHandler)
router.post("/wishlist/:productId", toggleWishlistHandler)
router.delete("/wishlist/:productId", toggleWishlistHandler)

// Checkout & payments
router.post("/checkout", checkoutHandler)
router.post("/orders/:orderId/payment", createPaymentHandler)
router.post("/payments/verify", verifyPaymentHandler)

// Orders
router.get("/orders", getOrdersHandler)
router.get("/orders/number/:orderNumber", getOrderByNumberHandler)
router.get("/orders/:id", getOrderHandler)
router.post("/orders/:id/cancel", cancelOrderHandler)

// Reviews
router.post("/reviews", addReviewHandler)

// Invoices & payments
router.get("/invoices", getInvoicesHandler)
router.get("/invoices/:id", getInvoiceHandler)
router.get("/payments", getPaymentsHandler)

export default router