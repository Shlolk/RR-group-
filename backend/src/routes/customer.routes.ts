import { Router } from "express"
import { requireAuth } from "@/middlewares/auth"
import * as customer from "@/controllers/customer.controller"

const router = Router()

router.use(requireAuth)

// Profile
router.patch("/profile", customer.updateProfileHandler)
router.patch("/password", customer.changePasswordHandler)
router.get("/profile/customer", customer.getCustomerHandler)
router.patch("/profile/customer", customer.updateCustomerHandler)

// Addresses
router.get("/addresses", customer.listAddressesHandler)
router.post("/addresses", customer.createAddressHandler)
router.patch("/addresses/:id", customer.updateAddressHandler)
router.delete("/addresses/:id", customer.deleteAddressHandler)

// Notifications
router.get("/notifications", customer.getMyNotificationsHandler)
router.patch("/notifications/:id/read", customer.markNotificationReadHandler)
router.post("/notifications/read-all", customer.markAllNotificationsReadHandler)

// Support tickets (customer-facing)
router.post("/support", customer.createSupportTicketHandler)
router.get("/support", customer.getMyTicketsHandler)
router.get("/support/:id", customer.getMyTicketHandler)
router.post("/support/:id/reply", customer.replyToMyTicketHandler)

// Messages
router.get("/messages", customer.getMyMessagesHandler)

// Service requests
router.post("/service-requests", customer.createServiceRequestHandler)
router.get("/service-requests", customer.getMyServiceRequestsHandler)

export default router