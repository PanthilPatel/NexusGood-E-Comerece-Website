const PDFDocument = require('pdfkit');

/**
 * Generates a professional PDF invoice for an order.
 * @param {Object} order - The populated order object.
 * @param {Object} user - The user object.
 * @param {Object} res - Express response object to stream the PDF to.
 */
exports.generateInvoicePDF = (order, user, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order._id.toString().slice(-8).toUpperCase()}.pdf`);

  doc.pipe(res);

  // --- Header ---
  doc.fillColor('#444444')
    .fontSize(20)
    .text('NEXUSGOOD', 50, 57)
    .fontSize(10)
    .text('Premium Digital Marketplace', 50, 80)
    .fillColor('#444444')
    .fontSize(10)
    .text('support@nexusgood.com', 200, 65, { align: 'right' })
    .text('www.nexusgood.com', 200, 80, { align: 'right' })
    .moveDown();

  // --- Line ---
  doc.strokeColor('#eeeeee')
    .lineWidth(1)
    .moveTo(50, 100)
    .lineTo(550, 100)
    .stroke();

  // --- Customer & Order Info ---
  const customerTop = 120;
  doc.fontSize(10)
    .text('INVOICE TO:', 50, customerTop, { bold: true })
    .font('Helvetica-Bold').text(user.name, 50, customerTop + 15).font('Helvetica')
    .text(order.shippingAddress.address, 50, customerTop + 30)
    .text(`${order.shippingAddress.city}, ${order.shippingAddress.pincode}`, 50, customerTop + 45)
    .text(`Phone: ${order.shippingAddress.phone}`, 50, customerTop + 60);

  doc.text('ORDER DETAILS:', 350, customerTop, { bold: true })
    .text(`Invoice #: ${order._id.toString().slice(-8).toUpperCase()}`, 350, customerTop + 15)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, customerTop + 30)
    .text(`Status: ${order.status.toUpperCase()}`, 350, customerTop + 45)
    .text(`Payment: ${order.paymentMethod}`, 350, customerTop + 60);

  doc.moveDown(4);

  // --- Items Table ---
  let tableTop = 220;
  doc.font('Helvetica-Bold');
  generateTableRow(doc, tableTop, 'Item', 'Quantity', 'Price', 'Total');
  doc.font('Helvetica');
  generateHr(doc, tableTop + 20);

  let i = 0;
  order.items.forEach(item => {
    i++;
    const position = tableTop + (i * 30);
    generateTableRow(
      doc, 
      position, 
      item.product.name, 
      item.quantity.toString(), 
      `INR ${item.price.toLocaleString()}`, 
      `INR ${(item.price * item.quantity).toLocaleString()}`
    );
    generateHr(doc, position + 20);
  });

  const subtotalPosition = tableTop + ((i + 1) * 30) + 20;
  doc.font('Helvetica-Bold');
  generateTableRow(doc, subtotalPosition, '', '', 'Subtotal', `INR ${(order.totalAmount + order.discount - order.codCharge).toLocaleString()}`);
  
  if (order.discount > 0) {
    generateTableRow(doc, subtotalPosition + 25, '', '', 'Discount', `- INR ${order.discount.toLocaleString()}`);
  }
  
  if (order.codCharge > 0) {
    generateTableRow(doc, subtotalPosition + 50, '', '', 'COD Charge', `INR ${order.codCharge.toLocaleString()}`);
  }

  const totalPosition = subtotalPosition + 75;
  doc.fontSize(14).text('Total Amount:', 350, totalPosition);
  doc.fontSize(14).text(`INR ${order.totalAmount.toLocaleString()}`, 450, totalPosition, { align: 'right' });

  // --- Footer ---
  doc.fontSize(10)
    .fillColor('#aaaaaa')
    .text('Thank you for shopping with NexusGood. This is a computer-generated invoice.', 50, 700, { align: 'center', width: 500 });

  doc.end();
};

function generateTableRow(doc, y, c1, c2, c3, c4) {
  doc.fontSize(10)
    .text(c1, 50, y)
    .text(c2, 280, y, { width: 90, align: 'right' })
    .text(c3, 370, y, { width: 90, align: 'right' })
    .text(c4, 0, y, { align: 'right' });
}

function generateHr(doc, y) {
  doc.strokeColor('#eeeeee')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}
