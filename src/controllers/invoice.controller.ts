import { NextFunction, Request, Response } from "express";
import PDFDocument from "pdfkit";
import path from "path";
import { asyncHandler } from "@utils/asyncHandler";

export const downloadInvoice = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { invoiceNumber, customerName, items } = req.body;

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoiceNumber}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Pipe PDF to response
    doc.pipe(res);

    // Invoice Header
    doc.fontSize(20).text("Invoice", { align: "center" }).moveDown();
    doc
      .fontSize(12)
      .text(`Invoice Number: ${invoiceNumber}`)
      .text(`Customer Name: ${customerName}`)
      .moveDown();

    // Table Header
    doc.text("Items:", { underline: true });

    let total = 0;
    items.forEach((item: { name: string; qty: number; price: number }) => {
      const lineTotal = item.qty * item.price;
      total += lineTotal;
      doc.text(`${item.name} (${item.qty} × ${item.price}) - ${lineTotal}`);
    });

    // Total
    doc.moveDown().fontSize(14).text(`Total: ₹${total}`, { bold: true });

    // Footer
    doc
      .moveDown()
      .fontSize(10)
      .text("Thank you for your business!", { align: "center" });

    doc->download('invoice-' . $order->id . '.pdf');
    // Finalize PDF
    doc.end();
  }
);

export const invoiceController = {
  downloadInvoice,
};
