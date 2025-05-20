import axios from 'axios';
import { Suspense } from 'react';
import ProductDetails from '@/components/ProductDetails';
import ProductSkeleton from '@/components/ProductSkeleton';
import ProductNotFound from '@/components/ProductNotFound';

export async function generateMetadata({ params }) {
  try {
    const res = await axios.get(`http://localhost:5000/api/products/${params.id}`);
    const product = res.data;

    return {
      title: `${product.name} | Product Shop`,
      description: product.description || `Details about ${product.name}`,
      openGraph: {
        title: product.name,
        description: product.description || `Details about ${product.name}`,
        images: [
          {
            url: product.image_url || '/placeholder.png',
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
        locale: 'en_US',
        type: 'website',
        siteName: 'Product Shop',
        url: `https://localhost:5000/product/${params.id}`,
      },
      other: {
        'product:price:amount': product.price || '',
        'product:price:currency': 'USD',
        'product:availability': product.in_stock ? 'in stock' : 'out of stock',
      },
      alternates: {
        canonical: `https://localhost:5000/product/${params.id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Details about ${product.name}`,
        images: [product.image_url || '/placeholder.png'],
        creator: '@yourhandle',
      },
    };
  } catch (error) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found',
      robots: 'noindex',
    };
  }
}

export default async function ProductPage({ params }) {
  try {
    const res = await axios.get(`http://localhost:5000/api/products/${params.id}`);
    const product = res.data;

    return (
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<ProductSkeleton />}>
          <ProductDetails product={product} />
        </Suspense>

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              image: product.image_url,
              description: product.description,
              sku: product.sku || params.id,
              mpn: product.mpn || params.id,
              brand: {
                '@type': 'Brand',
                name: product.brand || 'Product Shop',
              },
              offers: {
                '@type': 'Offer',
                url: `https://your-domain.com/product/${params.id}`,
                price: product.price || '',
                priceCurrency: 'USD',
                availability: product.in_stock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                seller: {
                  '@type': 'Organization',
                  name: 'Product Shop',
                },
              },
              aggregateRating: product.ratings && {
                '@type': 'AggregateRating',
                ratingValue: product.ratings.average || '4.5',
                reviewCount: product.ratings.count || '100',
              },
            }),
          }}
        />
      </div>
    );
  } catch (error) {
    return <ProductNotFound />;
  }
}
