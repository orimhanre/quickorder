import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import { v2 as cloudinary } from 'cloudinary';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Firebase configuration - optional for now
let app: any = null;
let db: any = null;

try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  // Only initialize if all required env vars are present
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.log('⚠️ Firebase environment variables not configured - orders will not be sent to Firestore');
  }
} catch (error) {
  console.log('⚠️ Firebase initialization failed - orders will not be sent to Firestore');
}

export async function POST(request: NextRequest) {
  try {
    const { client, cartItems, selectedPriceType, comentario } = await request.json();

    // Create PDF document - Letter size (8.5 x 11 inches)
    const doc = new jsPDF('p', 'pt', 'letter');
    
    const pageWidth = 612; // 8.5 * 72
    const pageHeight = 792; // 11 * 72
    const margin = 50;
    const contentWidth = pageWidth - 2 * margin;

    let yPosition = 30;
    const lineHeight = 14;
    let currentPage = 0;

    // Helper function to add new page if needed
    const addNewPageIfNeeded = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - 100) {
        doc.addPage();
        currentPage++;
        yPosition = 30;
        drawHeader();
      }
    };

    // Draw header with logo and company info
    const drawHeader = () => {
      yPosition = 15;
      
      // Company title (left side)
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 51, 51);
      doc.text('DISTRINARANJOS S.A.S.', margin + 10, yPosition + 20);
      
      // Order text (right side)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(77, 77, 77);
      const orderText = 'Pedido';
      const orderTextWidth = doc.getTextWidth(orderText);
      doc.text(orderText, pageWidth - margin - orderTextWidth, yPosition + 20);
      
      // Invoice number (right side)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(77, 77, 77);
      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;
      const invoiceWidth = doc.getTextWidth(invoiceNumber);
      doc.text(invoiceNumber, pageWidth - margin - invoiceWidth, yPosition + 35);
      
      // Date (right side)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 80, 0);
      const dateString = new Date().toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const dateWidth = doc.getTextWidth(dateString);
      doc.text(dateString, pageWidth - margin - dateWidth, yPosition + 50);
      
      // Time (right side)
      const timeString = new Date().toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      const timeWidth = doc.getTextWidth(timeString);
      doc.text(timeString, pageWidth - margin - timeWidth, yPosition + 65);
      
      yPosition = 85;
      
      // Separator line under time
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
    };

    // Start first page
    drawHeader();

    // Add client information
    if (client) {
      addNewPageIfNeeded(150);
      
      const totalBoxWidth = pageWidth - margin * 2 - 20;
      const clientBoxWidth = totalBoxWidth * 0.6; // 60% for client
      const commentBoxWidth = totalBoxWidth * 0.4; // 40% for comment
      
      // Client box (left side) - wider
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin, yPosition, clientBoxWidth, 140, 5, 5, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(margin, yPosition, clientBoxWidth, 140, 5, 5, 'S');
      
      // Client title inside the box
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('CLIENTE:', margin + 10, yPosition + 15);
      
      // Client information
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (client.companyName) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 0, 0);
        doc.text(client.companyName, margin + 10, yPosition + 35);
      }
      
      if (client.identification) {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(client.identification, margin + 10, yPosition + 50);
      }
      
      if (client.name || client.surname) {
        const fullName = `${client.name || ''} ${client.surname || ''}`.trim();
        doc.text(fullName, margin + 10, yPosition + 65);
      }
      
      if (client.phone) {
        doc.setTextColor(0, 122, 255);
        doc.text(client.phone, margin + 10, yPosition + 80);
      }
      
      if (client.address) {
        doc.setTextColor(128, 80, 0);
        doc.text(client.address, margin + 10, yPosition + 95);
      }
      
      if (client.city) {
        doc.text(client.city, margin + 10, yPosition + 110);
      }
      
      if (client.department) {
        doc.text(client.department, margin + 10, yPosition + 125);
      }
      
      // Comments box (right side) - narrower
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(margin + clientBoxWidth + 20, yPosition, commentBoxWidth, 140, 5, 5, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(margin + clientBoxWidth + 20, yPosition, commentBoxWidth, 140, 5, 5, 'S');
      
      // Comments title inside the box
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('COMENTARIO:', margin + clientBoxWidth + 30, yPosition + 15);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('N/A', margin + clientBoxWidth + 30, yPosition + 35);
      
      yPosition += 170; // More space after client section
    }

    // Add products table header
    addNewPageIfNeeded(50);
    
    // Table header background
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 30, 5, 5, 'F');
    
    // Table headers - vertically centered
    const columnWidths = [210, 80, 80, 80, 80];
    const columnX = [margin + 10, margin + 220, margin + 300, margin + 380, margin + 460];
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('Referencia', columnX[0], yPosition + 15);
    doc.text('Color', columnX[1] + 20, yPosition + 15);
    doc.text('Cantidad', columnX[2], yPosition + 15);
    doc.text('Precio', columnX[3], yPosition + 15);
    doc.text('Subtotal', columnX[4], yPosition + 15);
    yPosition += 40; // More space after table header

    // Add products
    let total = 0;
    let totalItems = 0;
    let isEvenRow = false;

    // Sort items by brand and name (like iOS app)
    const sortedItems = cartItems.sort((a: any, b: any) => {
      if (a.product.brand.toLowerCase() === b.product.brand.toLowerCase()) {
        return a.product.name.toLowerCase().localeCompare(b.product.name.toLowerCase());
      }
      return a.product.brand.toLowerCase().localeCompare(b.product.brand.toLowerCase());
    });

    sortedItems.forEach((item: any) => {
      const price = item.selectedPrice === 'price1' ? item.product.price1 : item.product.price2;
      const itemTotal = price * item.quantity;
      total += itemTotal;
      totalItems += item.quantity;

      addNewPageIfNeeded(25);

      // Row background for even rows
      if (isEvenRow) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
        // Set text color to black for gray background
        doc.setTextColor(0, 0, 0);
      } else {
        // Set text color to black for white background
        doc.setTextColor(0, 0, 0);
      }
      isEvenRow = !isEvenRow;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      // Product name with brand
      const productText = `${item.product.brand} (${item.product.name})`;
      doc.text(productText, columnX[0], yPosition + 8);

      // Color
      doc.text(item.selectedColor || '', columnX[1] + 20, yPosition + 8);

      // Quantity
      const quantityColor = item.selectedPrice === 'price1' ? [0, 128, 0] : [0, 122, 255]; // Green for price1, blue for price2
      doc.setTextColor(quantityColor[0], quantityColor[1], quantityColor[2]);
      doc.text(item.quantity.toString(), columnX[2] + 20, yPosition + 8);

      // Reset text color to black for other columns
      doc.setTextColor(0, 0, 0);

      // Price
      const priceText = `$${Math.round(price).toLocaleString('de-DE')}`;
      doc.text(priceText, columnX[3], yPosition + 8);

      // Total
      const totalText = `$${Math.round(itemTotal).toLocaleString('de-DE')}`;
      doc.text(totalText, columnX[4], yPosition + 8);

      yPosition += 25;
    });

    // Add total box
    addNewPageIfNeeded(80);

    const totalBoxWidth = 200;
    const totalBoxHeight = 55;
    const totalBoxX = pageWidth - margin - totalBoxWidth;
    const totalBoxY = yPosition + 20;

    // Total box background
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 5, 5, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 5, 5, 'S');

    // Total quantity
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const totalQuantityColor = selectedPriceType === 'price1' ? [0, 128, 0] : [0, 122, 255]; // Green for price1, blue for price2
    doc.setTextColor(totalQuantityColor[0], totalQuantityColor[1], totalQuantityColor[2]);
    doc.text('Total Cantidad:', totalBoxX + 15, totalBoxY + 15);
    doc.text(totalItems.toString(), totalBoxX + totalBoxWidth - 80, totalBoxY + 15);

    // Separator line in total box
    doc.setDrawColor(200, 200, 200);
    doc.line(totalBoxX + 15, totalBoxY + 28, totalBoxX + totalBoxWidth - 15, totalBoxY + 28);

    // Total price
    doc.setTextColor(255, 0, 0);
    doc.text('Total Precio:', totalBoxX + 15, totalBoxY + 40);
    doc.text(`$${Math.round(total).toLocaleString('de-DE')}`, totalBoxX + totalBoxWidth - 80, totalBoxY + 40);

    // Generate current date and time for filename
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const companyName = client?.companyName || 'Cliente';
    const filename = `${companyName} - ${day}.${month}.${year}_${hours}.${minutes}.pdf`;

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Upload to Cloudinary (optional)
    let cloudinaryResponse: any = null;
    try {
      const base64PDF = pdfBuffer.toString('base64');
      const dataURI = `data:application/pdf;base64,${base64PDF}`;
      
      cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'raw',
        public_id: filename,
        folder: 'pdfs'
      });
      console.log('✅ PDF uploaded to Cloudinary successfully');
    } catch (cloudinaryError) {
      console.error('❌ Error uploading to Cloudinary:', cloudinaryError);
      console.log('ℹ️ PDF will be generated but not uploaded to Cloudinary');
    }

    // Send order to Firestore (matching iOS app structure) - only if Firebase is configured
    if (db && cloudinaryResponse) {
      try {
        const orderDetails = `Cliente: ${client.companyName || 'N/A'} | Total: ${Math.round(total).toLocaleString('de-DE')} | Tipo: ${selectedPriceType === 'price1' ? 'Precio 1' : 'Precio 2'} | Comentario: ${comentario || 'N/A'}`;

        const orderData = {
          userId: 'web-client',
          userName: client.companyName || client.name || 'Cliente Web',
          timestamp: serverTimestamp(),
          orderDetails: orderDetails,
          fileUrl: cloudinaryResponse.secure_url,
          fileName: filename,
          deliveredTo: ['ZXV4MSAsQEeGUzSm5YMj7FICXII3'], // iOS app user ID
          readBy: []
        };

        const docRef = await addDoc(collection(db, 'orders'), orderData);
        console.log('✅ Order sent to Firestore successfully');
        console.log('📄 PDF URL:', cloudinaryResponse.secure_url);
        console.log('📄 Filename:', filename);
        console.log('📄 Order ID:', docRef.id);
        console.log('📄 Order Data:', JSON.stringify(orderData, null, 2));
        console.log('📄 Collection: orders');
        console.log('📄 Firestore Project ID: quickorder-b33b4');
        console.log('📄 Test: Order should be visible to iOS app');
        console.log('📄 iOS User ID: ZXV4MSAsQEeGUzSm5YMj7FICXII3');
        console.log('📄 Web Order User ID: web-client');
        console.log('📄 Delivered To: ZXV4MSAsQEeGUzSm5YMj7FICXII3');
      } catch (firestoreError) {
        console.error('❌ Error sending to Firestore:', firestoreError);
        // Continue with PDF generation even if Firestore fails
      }
    } else {
      if (!db) {
        console.log('ℹ️ Firebase not configured - order not sent to Firestore');
      }
      if (!cloudinaryResponse) {
        console.log('ℹ️ Cloudinary upload failed - order not sent to Firestore');
      }
    }

    const headers: any = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`
    };

    if (cloudinaryResponse) {
      headers['X-Cloudinary-URL'] = cloudinaryResponse.secure_url;
      headers['X-Cloudinary-Public-ID'] = cloudinaryResponse.public_id;
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Error al generar PDF. Por favor intente de nuevo.' },
      { status: 500 }
    );
  }
} 