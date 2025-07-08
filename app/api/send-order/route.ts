import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Resend } from 'resend';

// Firebase configuration - you'll need to add these environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY); // Move instantiation here
  try {
    const { client, cartItems, selectedPriceType, comentario, fileUrl, fileName, pdfBuffer } = await request.json();

    // Create order details string similar to iOS app
    const total = cartItems.reduce((sum: number, item: { selectedPrice: 'price1' | 'price2'; product: { price1: number; price2: number }; quantity: number }) => {
      const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
      return sum + (price * item.quantity);
    }, 0);

    const orderDetails = `Cliente: ${client.companyName || 'N/A'} | Total: ${Math.round(total).toLocaleString('de-DE')} | Tipo: ${selectedPriceType === 'price1' ? 'Precio 1' : 'Precio 2'} | Comentario: ${comentario || 'N/A'}`;

    // Create order object matching iOS FirestoreOrder structure
    const orderData = {
      userId: 'web-client', // Web clients don't have Firebase Auth, so we use a special identifier
      userName: client.companyName || client.name || 'Cliente Web',
      timestamp: serverTimestamp(),
      orderDetails: orderDetails,
      fileUrl: fileUrl || '',
      fileName: fileName || '',
      deliveredTo: ['web-client'],
      readBy: []
    };

    // Add to Firestore orders collection
    const docRef = await addDoc(collection(db, 'orders'), orderData);

    // Create dynamic sender name using client's company name
    const companyName = client.companyName || client.name || 'Cliente Web';
    const senderName = `${companyName} <info@resend.dev>`;
    const clientName = client.name ? `${client.name}${client.surname ? ' ' + client.surname : ''}` : companyName;

    // Send email notification with PDF attachment
    try {
      // Create HTML email template
      const getImageUrl = (product: any) => {
        if (product.imageURLs && product.imageURLs.length > 0) return product.imageURLs[0];
        if (product.imageURL && product.imageURL.length > 0) return product.imageURL[0];
        return 'https://via.placeholder.com/48';
      };

      // Before constructing emailHtml, convert comentario newlines to <br> for HTML display
      const comentarioHtml = comentario ? comentario.replace(/\n/g, '<br/>') : '';

      // Before constructing emailHtml, set the color and font size for Total Precio
      const totalColor = selectedPriceType === 'price1' ? '#28a745' : '#007bff'; // green or blue
      const totalFontSize = '28px';

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nuevo Pedido Recibido</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .header h2 { font-size: 24px; margin: 0 0 8px 0; }
            @media (max-width: 600px) {
              .header h2 { font-size: 22px !important; }
            }
            .order-info { background: #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .client-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #dee2e6; padding: 8px; text-align: left; font-size: 14px; }
            .items-table th { background: #f1f3f5; font-weight: bold; }
            .items-table td { background: #fff; }
            .total-row td { font-size: 16px; font-weight: bold; color: #28a745; text-align: right; border: none; background: none; }
            .price-type-row td { font-size: 14px; color: #007bff; text-align: right; border: none; background: none; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📋 Nuevo Pedido Recibido</h2>
              <p>Se ha recibido un nuevo pedido desde la aplicación web.</p>
            </div>
            
            <div class="client-info">
              <h2>👤 Información del Cliente</h2>
              <table style="width:100%; border-collapse:collapse;">
                <tbody>
                  <tr>
                    <td style="padding:6px 8px; font-weight:bold; width:40%;">Empresa:</td>
                    <td style="padding:6px 8px;">${client.companyName || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 8px; font-weight:bold;">Nombre Completo:</td>
                    <td style="padding:6px 8px;">${client.name || 'N/A'} ${client.surname || ''}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 8px; font-weight:bold;">Cédula:</td>
                    <td style="padding:6px 8px;">${client.identification || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 8px; font-weight:bold;">Teléfono:</td>
                    <td style="padding:6px 8px;">${client.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 8px; font-weight:bold;">Dirección:</td>
                    <td style="padding:6px 8px;">${client.address || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 8px; font-weight:bold;">Ciudad:</td>
                    <td style="padding:6px 8px;">${client.city || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 8px; font-weight:bold;">Departamento:</td>
                    <td style="padding:6px 8px;">${client.department || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="order-info">
              <h2>📦 Artículos del Pedido</h2>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Nombre</th>
                    <th>Color</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${cartItems.map((item: any) => {
                    const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
                    const subtotal = price * item.quantity;
                    return `
                      <tr>
                        <td><img src="${getImageUrl(item.product)}" alt="Foto" style="width:48px;height:48px;object-fit:cover;border-radius:6px;" /></td>
                        <td>${item.product.brand} - ${item.product.name}</td>
                        <td>${item.selectedColor || '-'}</td>
                        <td>$${Math.round(price).toLocaleString('de-DE')}</td>
                        <td style="text-align:center;">${item.quantity}</td>
                        <td>$${Math.round(subtotal).toLocaleString('de-DE')}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr class="footer-row">
                    <td colspan="4" style="vertical-align:top; background:#e9ecef;">
                      ${comentario ? `<div><strong>Comentarios:</strong><br/><span>${comentarioHtml}</span></div>` : ''}
                    </td>
                    <td colspan="2" style="text-align:right; vertical-align:top; background:#e9ecef;">
                      <div><strong>Total Precio:</strong> <span style="color:${totalColor}; font-size:${totalFontSize}; font-weight:bold;">$${Math.round(total).toLocaleString('de-DE')}</span></div>
                      <div style="font-size:13px; color:#007bff; margin-top:4px;">
                        Tipo de Precio: ${selectedPriceType === 'price1' ? 'Precio 1' : 'Precio 2'}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div class="footer">
              <p>Este pedido ha sido guardado en Firestore y el PDF adjunto contiene todos los detalles.</p>
              <p>ID del Pedido: ${docRef.id}</p>
              <p>Fecha: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send email with PDF attachment
      await resend.emails.send({
        from: `${companyName} <info@resend.dev>`, // Dynamic company name as sender
        to: ['marizulynaranjo@gmail.com', 'orimhanre@gmail.com'],
        subject: `${clientName} - $${Math.round(total).toLocaleString('de-DE')}`,
        html: emailHtml,
        attachments: pdfBuffer ? [{
          filename: fileName || 'pedido.pdf',
          content: Buffer.from(pdfBuffer, 'base64'),
          contentType: 'application/pdf'
        }] : undefined
      });

      console.log('✅ Email notification sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending email notification:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({ 
      success: true, 
      orderId: docRef.id,
      message: 'Pedido enviado exitosamente a DistriNaranjos'
    });

  } catch (error) {
    console.error('Error sending order to Firestore:', error);
    return NextResponse.json(
      { success: false, error: 'Error al enviar el pedido' },
      { status: 500 }
    );
  }
} 