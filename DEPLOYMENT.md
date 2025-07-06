# QuickOrder Web Form - Deployment Guide

## 🚀 **Your Web Form is Ready!**

Your QuickOrder web form with dual pricing system has been successfully created. Here's how to deploy it:

## **Option 1: Deploy to Vercel (Recommended)**

### Step 1: Login to Vercel
```bash
npx vercel login
```
Follow the prompts to authenticate with your GitHub account.

### Step 2: Deploy
```bash
npx vercel --yes
```

### Step 3: Set Environment Variables
After deployment, go to your Vercel dashboard:
1. Navigate to your project settings
2. Add these environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## **Option 2: Deploy to Netlify**

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/quickorder-web.git
git push -u origin main
```

### Step 2: Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `.next`

### Step 3: Set Environment Variables
In Netlify dashboard → Site settings → Environment variables

## **Option 3: Deploy to Railway**

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Deploy
```bash
railway login
railway init
railway up
```

## **Features Included**

✅ **Dual Pricing System**: Price 1 (Standard) and Price 2 (VIP)  
✅ **Product Catalog**: Browse and search products  
✅ **Client Information Form**: Collect comprehensive client details  
✅ **PDF Generation**: Professional PDF orders matching iOS app format  
✅ **Responsive Design**: Works on all devices  
✅ **Modern UI**: Clean, professional interface  

## **How Clients Will Use It**

1. **Select Pricing Type**: Choose between Price 1 or Price 2
2. **Browse Products**: Search and add products to cart
3. **Fill Client Info**: Complete the client information form
4. **Generate PDF**: Download the professional PDF order

## **Customization**

### Adding Your Products
Edit `components/ProductCatalog.tsx` and update the `mockProducts` array:

```typescript
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Your Product Name',
    brand: 'Your Brand',
    color: 'Color',
    price1: 25.99,
    price2: 22.99,
    reference: 'REF001'
  }
  // Add more products...
];
```

### Firebase Integration
Replace mock data with real Firebase integration in `components/ProductCatalog.tsx`.

### Custom Domain
After deployment, you can set up a custom domain in your hosting provider's dashboard.

## **URLs for Clients**

Once deployed, your clients can access the web form at:
- **Vercel**: `https://your-project.vercel.app`
- **Netlify**: `https://your-project.netlify.app`
- **Railway**: `https://your-project.railway.app`

## **QR Codes**

Generate QR codes linking to your web form for easy client access:
- Use any QR code generator
- Link to your deployed URL
- Print and display in your business

## **Support**

If you encounter any issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Test PDF generation locally before deployment

## **Next Steps**

1. **Deploy** using one of the options above
2. **Customize** products and branding
3. **Share** the URL with your clients
4. **Monitor** usage and orders

Your QuickOrder web form is ready to help your clients place orders easily! 🎉 