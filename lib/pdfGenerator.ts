import PDFDocument from 'pdfkit';
import { OrderData } from '@/types';

export async function generateOrderPDF(orderData: OrderData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#1e40af')
         .text('QuickOrder', { align: 'center' });

      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Professional Order Management', { align: 'center' });

      doc.moveDown(2);

      // Order Information
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('ORDER DETAILS');

      doc.moveDown(1);

      // Order ID and Date
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#374151')
         .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

      doc.moveDown(1);

      // Price Type with correct color
      const priceTypeColor = orderData.selectedPriceType === 'price1' ? '#059669' : '#1e40af';
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor(priceTypeColor)
         .text(`Pricing Type: ${orderData.selectedPriceType === 'price1' ? 'Price 1 (Standard)' : 'Price 2 (VIP)'}`);

      doc.moveDown(2);

      // Client Information
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('CLIENT INFORMATION');

      doc.moveDown(1);

      const client = orderData.client;
      const clientInfo = [
        `Name: ${client.name || ''} ${client.surname || ''}`,
        `Phone: ${client.phone || ''}`,
        `Company: ${client.companyName || ''}`,
        `City: ${client.city || ''}`,
        `Department: ${client.department || ''}`,
        `Address: ${client.address || ''}`,
        `ID: ${client.identification || ''}`
      ].filter(info => info.split(': ')[1] !== '');

      clientInfo.forEach(info => {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#374151')
           .text(info);
      });

      doc.moveDown(2);

      // Products Table
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('ORDER ITEMS');

      doc.moveDown(1);

      // Table Header
      const tableTop = doc.y;
      const colX = [50, 250, 330, 410];

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#374151');

      doc.text('Product', colX[0], tableTop);
      doc.text('Price', colX[1], tableTop);
      doc.text('Qty', colX[2], tableTop);
      doc.text('Total', colX[3], tableTop);

      doc.moveDown(1);

      // Table Rows
      orderData.cartItems.forEach((item, index) => {
        const rowY = doc.y + (index * 25);
        const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;

        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#374151');

        // Product name and details
        doc.text(item.product.name, colX[0], rowY);
        doc.fontSize(8)
           .fillColor('#6b7280')
           .text(`${item.product.brand} - ${item.selectedColor}`, colX[0], rowY + 12);
        doc.fontSize(7)
           .text(`Ref: ${item.product.id}`, colX[0], rowY + 20);

        // Price
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#374151')
           .text(`$${price.toFixed(2)}`, colX[1], rowY);

        // Quantity
        doc.text(item.quantity.toString(), colX[2], rowY);

        // Total
        doc.text(`$${(price * item.quantity).toFixed(2)}`, colX[3], rowY);
      });

      doc.moveDown(2);

      // Total
      const totalY = doc.y;
      const total = orderData.cartItems.reduce((sum, item) => {
        const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
        return sum + (price * item.quantity);
      }, 0);
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#111827')
         .text('TOTAL:', colX[2], totalY)
         .text(`$${total.toFixed(2)}`, colX[3], totalY);

      doc.moveDown(2);

      // Comentario section (if exists)
      if (orderData.comentario && orderData.comentario.trim() !== '') {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#1e40af')
           .text('Comentarios:');
        doc.moveDown(0.5);
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#374151');
        // Split comentario by line breaks and render each line
        orderData.comentario.split(/\r?\n/).forEach(line => {
          doc.text(line);
        });
        doc.moveDown(1.5);
      }

      doc.moveDown(3);

      // Footer
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#6b7280')
         .text('Generated by QuickOrder Web Form', { align: 'center' });

      doc.fontSize(8)
         .text(`Date: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `QO-${timestamp}-${random}`;
} 