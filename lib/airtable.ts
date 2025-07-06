import { Product } from '../types';

// Airtable configuration matching your iOS app
const AIRTABLE_CONFIG = {
  baseURL: 'https://api.airtable.com/v0',
  baseID: 'appDCsBKlJPhUVcMr',
  apiKey: 'patgZ21oWPGsS9fGo.e7d83631d502b1e0cd2ef7f016a47eb901b319d59bccc13c4ef14ba7dbcc988d',
  productsTable: 'Products'
};

// Airtable attachment structure
interface AirtableAttachment {
  url: string;
}

export interface AirtableProduct {
  id: string;
  name: string;
  brand: string;
  imageURL?: AirtableAttachment[];
  imageURLs?: AirtableAttachment[];
  productDescription: string;
  colors: string[];
  price1: number;
  price2: number;
  isProductStarred?: boolean;
  quantity?: number;
  lastUpdated?: string;
}

export interface AirtableResponse {
  records: Array<{
    id: string;
    createdTime: string;
    fields: {
      name: string;
      brand: string;
      imageURL?: AirtableAttachment[];
      imageURLs?: AirtableAttachment[];
      productDescription?: string;
      colors?: string[];
      price1: number;
      price2: number;
      isProductStarred?: boolean;
      quantity?: number;
      lastUpdated?: string;
    };
  }>;
  offset?: string;
}

export async function fetchProductsFromAirtable(): Promise<AirtableProduct[]> {
  try {
    const allProducts: AirtableProduct[] = [];
    let offset: string | undefined;
    
    do {
      // Build URL with pagination parameters
      const url = new URL(`${AIRTABLE_CONFIG.baseURL}/${AIRTABLE_CONFIG.baseID}/${AIRTABLE_CONFIG.productsTable}`);
      url.searchParams.set('pageSize', '100'); // Maximum page size
      if (offset) {
        url.searchParams.set('offset', offset);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data: AirtableResponse = await response.json();
      
      // Add products from this page
      const pageProducts = data.records.map(record => ({
        id: record.id,
        name: record.fields.name,
        brand: record.fields.brand,
        imageURL: record.fields.imageURL,
        imageURLs: record.fields.imageURLs,
        productDescription: record.fields.productDescription || '',
        colors: record.fields.colors || [],
        price1: record.fields.price1,
        price2: record.fields.price2,
        isProductStarred: record.fields.isProductStarred || false,
        quantity: record.fields.quantity || 0,
        lastUpdated: record.fields.lastUpdated
      }));
      
      allProducts.push(...pageProducts);
      
      // Update offset for next page
      offset = data.offset;
      
    } while (offset); // Continue while there are more pages
    
    console.log(`✅ Fetched ${allProducts.length} products from Airtable`);
    return allProducts;
  } catch (error) {
    console.error('Error fetching products from Airtable:', error);
    throw error;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const airtableProducts = await fetchProductsFromAirtable();
  
  return airtableProducts.map(airtableProduct => ({
    id: airtableProduct.id,
    name: airtableProduct.name,
    brand: airtableProduct.brand,
    imageURL: airtableProduct.imageURL?.map(attachment => attachment.url) || [],
    imageURLs: airtableProduct.imageURLs?.map(attachment => attachment.url) || [],
    productDescription: airtableProduct.productDescription,
    colors: airtableProduct.colors,
    price1: airtableProduct.price1,
    price2: airtableProduct.price2,
    isProductStarred: airtableProduct.isProductStarred,
    quantity: airtableProduct.quantity,
    lastUpdated: airtableProduct.lastUpdated
  }));
} 