import { Router } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../config/prisma.js";
import { protect } from "../middleware/auth.middleware.js";
import path from "path";
import fs from "fs";

const router = Router();

router.get("/:bookingId", protect, asyncHandler(async (req, res) => {

    const booking = await prisma.booking.findUnique({
        where: {
            id: req.params.bookingId
        }
    });

    if (!booking) {
        return res.status(404).json({
            error: "Booking not found"
        });
    }

    if (!booking.invoicePdfUrl) {
        return res.status(404).json({
            error: "Invoice not generated yet"
        });
    }

    const filePath = path.join(process.cwd(), "public", booking.invoicePdfUrl);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: "Invoice file not found"
        });
    }

    res.download(filePath);

}));

export default router;