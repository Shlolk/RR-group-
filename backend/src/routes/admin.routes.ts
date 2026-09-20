import { Router } from "express"
import { requireAuth } from "@/middlewares/auth"
import { requirePermission, requireStaff } from "@/middlewares/rbac"
import { apiRateLimiter } from "@/middlewares/rate-limit"
import * as adminOrders from "@/controllers/admin-orders.controller"
import * as adminUsers from "@/controllers/admin-users.controller"
import { getDashboardStats } from "@/controllers/admin-dashboard.controller"
import {
  manageLeadsHandler,
  listLeadsHandler,
  getLeadHandler,
  deleteLeadHandler,
} from "@/controllers/crm.controller"
import {
  listDepartmentsHandler,
  createDepartmentHandler,
  listEmployeesHandler,
  createEmployeeHandler,
  updateEmployeeHandler,
} from "@/controllers/erp.controller"
import {
  listCampaignsHandler,
  createCampaignHandler,
  updateCampaignHandler,
  campaignAnalyticsHandler,
} from "@/controllers/marketing.controller"
import {
  listTicketsHandler,
  getTicketHandler,
  updateTicketHandler,
  replyTicketHandler,
  listAllMessagesHandler,
} from "@/controllers/support.controller"
import {
  listNotificationsHandler,
  broadcastNotificationHandler,
} from "@/controllers/notification.controller"
import {
  listBlogPostsHandler,
  createBlogPostHandler,
  updateBlogPostHandler,
  deleteBlogPostHandler,
  listFaqHandler,
  createFaqHandler,
  updateFaqHandler,
  deleteFaqHandler,
  listTestimonialsHandler,
  createTestimonialHandler,
  updateTestimonialHandler,
  deleteTestimonialHandler,
  listPortfolioHandler,
  createPortfolioHandler,
  updatePortfolioHandler,
  deletePortfolioHandler,
  listJobsHandler,
  createJobHandler,
  updateJobHandler,
  deleteJobHandler,
  listApplicationsHandler,
  updateApplicationHandler,
} from "@/controllers/content.controller"
import { listAuditLogsHandler } from "@/controllers/audit.controller"
import { listInquiriesHandler, updateInquiryHandler } from "@/controllers/inquiry.controller"
import { listReviewsHandler, approveReviewHandler, deleteReviewHandler } from "@/controllers/review.controller"
import {
  listProductsAdminHandler,
  createProductAdminHandler,
  updateProductAdminHandler,
  deleteProductAdminHandler,
  listCategoriesAdminHandler,
  createCategoryAdminHandler,
  updateCategoryAdminHandler,
  deleteCategoryAdminHandler,
  adjustInventoryAdminHandler,
  couponAdminRouter,
} from "@/controllers/admin-ecommerce.controller"

const router = Router()

router.use(requireAuth, requireStaff(), apiRateLimiter)

// Dashboard
router.get("/dashboard", getDashboardStats)

// Users & customers
router.get("/users", requirePermission("USERS_MANAGE"), adminUsers.listUsersHandler)
router.get("/users/:id", requirePermission("USERS_MANAGE"), adminUsers.getUserHandler)
router.post("/users", requirePermission("USERS_MANAGE"), adminUsers.createUserHandler)
router.patch("/users/:id", requirePermission("USERS_MANAGE"), adminUsers.updateUserHandler)
router.patch("/users/:id/role", requirePermission("USERS_MANAGE"), adminUsers.changeUserRoleHandler)
router.patch("/users/:id/status", requirePermission("USERS_MANAGE"), adminUsers.toggleUserStatusHandler)
router.get("/customers", requirePermission("CUSTOMERS_MANAGE"), adminUsers.listCustomersHandler)

// E-commerce admin
router.get("/admin-products", requirePermission("PRODUCTS_MANAGE"), listProductsAdminHandler)
router.post("/products", requirePermission("PRODUCTS_MANAGE"), createProductAdminHandler)
router.put("/products/:id", requirePermission("PRODUCTS_MANAGE"), updateProductAdminHandler)
router.delete("/products/:id", requirePermission("PRODUCTS_MANAGE"), deleteProductAdminHandler)
router.get("/categories", requirePermission("CATEGORIES_MANAGE"), listCategoriesAdminHandler)
router.post("/categories", requirePermission("CATEGORIES_MANAGE"), createCategoryAdminHandler)
router.put("/categories/:id", requirePermission("CATEGORIES_MANAGE"), updateCategoryAdminHandler)
router.delete("/categories/:id", requirePermission("CATEGORIES_MANAGE"), deleteCategoryAdminHandler)
router.post("/products/:id/inventory", requirePermission("INVENTORY_MANAGE"), adjustInventoryAdminHandler)
router.use("/coupons", requirePermission("COUPONS_MANAGE"), couponAdminRouter)

// Orders, payments, refunds, invoices admin
router.get("/orders", requirePermission("ORDERS_MANAGE"), adminOrders.getAllOrdersHandler)
router.get("/orders/:id", requirePermission("ORDERS_MANAGE"), adminOrders.getOrderHandler)
router.patch("/orders/:id/status", requirePermission("ORDERS_MANAGE"), adminOrders.updateOrderStatusHandler)
router.post("/orders/:id/refund", requirePermission("REFUNDS_MANAGE"), adminOrders.createRefundHandler)
router.get("/refunds", requirePermission("REFUNDS_MANAGE"), adminOrders.listRefundsHandler)
router.get("/payments", requirePermission("PAYMENTS_MANAGE"), adminOrders.listPaymentsHandler)
router.get("/invoices", requirePermission("INVOICES_MANAGE"), adminOrders.listInvoicesHandler)
router.post("/invoices", requirePermission("INVOICES_MANAGE"), adminOrders.createInvoiceHandler)

// CRM
router.get("/leads", requirePermission("LEADS_MANAGE"), listLeadsHandler)
router.get("/leads/:id", requirePermission("LEADS_MANAGE"), getLeadHandler)
router.post("/leads", requirePermission("LEADS_MANAGE"), manageLeadsHandler)
router.patch("/leads/:id", requirePermission("LEADS_MANAGE"), manageLeadsHandler)
router.delete("/leads/:id", requirePermission("LEADS_MANAGE"), deleteLeadHandler)

// ERP
router.get("/erp/departments", requirePermission("ERP_MANAGE"), listDepartmentsHandler)
router.post("/erp/departments", requirePermission("ERP_MANAGE"), createDepartmentHandler)
router.get("/erp/employees", requirePermission("ERP_MANAGE"), listEmployeesHandler)
router.post("/erp/employees", requirePermission("ERP_MANAGE"), createEmployeeHandler)
router.patch("/erp/employees/:id", requirePermission("ERP_MANAGE"), updateEmployeeHandler)

// Marketing
router.get("/campaigns", requirePermission("MARKETING_MANAGE"), listCampaignsHandler)
router.post("/campaigns", requirePermission("MARKETING_MANAGE"), createCampaignHandler)
router.patch("/campaigns/:id", requirePermission("MARKETING_MANAGE"), updateCampaignHandler)
router.get("/campaigns/:id/analytics", requirePermission("MARKETING_MANAGE"), campaignAnalyticsHandler)

// Support
router.get("/tickets", requirePermission("SUPPORT_MANAGE"), listTicketsHandler)
router.get("/tickets/:id", requirePermission("SUPPORT_MANAGE"), getTicketHandler)
router.patch("/tickets/:id", requirePermission("SUPPORT_MANAGE"), updateTicketHandler)
router.post("/tickets/:id/reply", requirePermission("SUPPORT_MANAGE"), replyTicketHandler)
router.get("/messages", requirePermission("MESSAGES_MANAGE"), listAllMessagesHandler)

// Notifications
router.get("/notifications", requirePermission("NOTIFICATIONS_MANAGE"), listNotificationsHandler)
router.post("/notifications/broadcast", requirePermission("NOTIFICATIONS_MANAGE"), broadcastNotificationHandler)

// Content
router.get("/blog", requirePermission("BLOG_MANAGE"), listBlogPostsHandler)
router.post("/blog", requirePermission("BLOG_MANAGE"), createBlogPostHandler)
router.patch("/blog/:id", requirePermission("BLOG_MANAGE"), updateBlogPostHandler)
router.delete("/blog/:id", requirePermission("BLOG_MANAGE"), deleteBlogPostHandler)
router.get("/faq", requirePermission("FAQ_MANAGE"), listFaqHandler)
router.post("/faq", requirePermission("FAQ_MANAGE"), createFaqHandler)
router.patch("/faq/:id", requirePermission("FAQ_MANAGE"), updateFaqHandler)
router.delete("/faq/:id", requirePermission("FAQ_MANAGE"), deleteFaqHandler)
router.get("/testimonials", requirePermission("TESTIMONIALS_MANAGE"), listTestimonialsHandler)
router.post("/testimonials", requirePermission("TESTIMONIALS_MANAGE"), createTestimonialHandler)
router.patch("/testimonials/:id", requirePermission("TESTIMONIALS_MANAGE"), updateTestimonialHandler)
router.delete("/testimonials/:id", requirePermission("TESTIMONIALS_MANAGE"), deleteTestimonialHandler)
router.get("/portfolio", requirePermission("PORTFOLIO_MANAGE"), listPortfolioHandler)
router.post("/portfolio", requirePermission("PORTFOLIO_MANAGE"), createPortfolioHandler)
router.patch("/portfolio/:id", requirePermission("PORTFOLIO_MANAGE"), updatePortfolioHandler)
router.delete("/portfolio/:id", requirePermission("PORTFOLIO_MANAGE"), deletePortfolioHandler)
router.get("/inquiries", requirePermission("INQUIRIES_MANAGE"), listInquiriesHandler)
router.patch("/inquiries/:id", requirePermission("INQUIRIES_MANAGE"), updateInquiryHandler)
router.get("/jobs", requirePermission("BLOG_MANAGE"), listJobsHandler)
router.post("/jobs", requirePermission("BLOG_MANAGE"), createJobHandler)
router.patch("/jobs/:id", requirePermission("BLOG_MANAGE"), updateJobHandler)
router.delete("/jobs/:id", requirePermission("BLOG_MANAGE"), deleteJobHandler)
router.get("/applications", requirePermission("BLOG_MANAGE"), listApplicationsHandler)
router.patch("/applications/:id", requirePermission("BLOG_MANAGE"), updateApplicationHandler)
router.get("/reviews", requirePermission("REVIEWS_MANAGE"), listReviewsHandler)
router.patch("/reviews/:id/approve", requirePermission("REVIEWS_MANAGE"), approveReviewHandler)
router.delete("/reviews/:id", requirePermission("REVIEWS_MANAGE"), deleteReviewHandler)

// Audit logs
router.get("/audit-logs", requirePermission("AUDIT_LOGS_VIEW"), listAuditLogsHandler)

export default router