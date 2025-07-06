import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, FieldValue, serverTimestamp } from 'firebase/firestore';

// Firebase configuration - you'll need to add these environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const { client, cartItems, selectedPriceType, comentario, fileUrl, fileName } = await request.json();

    // Create order details string similar to iOS app
    const total = cartItems.reduce((sum: number, item: any) => {
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