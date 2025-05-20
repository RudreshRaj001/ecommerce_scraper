'use client';
// components/ProductDetails.jsx
import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetails({ product, category }) {
  const [imgError, setImgError] = useState(false);
  
  // Extract product details or set defaults
  const { 
    id,
    name, 
    price, 
    description = "No description available", 
    image_url, 
    availability,
    brand = "Unknown",
    rating = null,
    reviews_count = 0,
    specifications
  } = product;

  // Format price correctly
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
  
  // Determine availability status and styling
  const isInStock = availability?.toLowerCase().includes('in stock');
  const availabilityClass = isInStock ? 'text-green-600' : 'text-red-600';
  
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
          </li>
          <li>
            <span className="text-gray-500 mx-2">/</span>
          </li>
          <li>
            <Link href={`/?category=${encodeURIComponent(category)}`} className="text-gray-500 hover:text-gray-700">
              {category}
            </Link>
          </li>
          <li>
            <span className="text-gray-500 mx-2">/</span>
          </li>
          <li className="text-gray-900 font-medium truncate max-w-xs">
            {name}
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imgError ? '/placeholder.png' : (image_url || '/placeholder.png')}
              alt={name}
              className="max-h-96 w-full object-contain"
              onError={() => setImgError(true)}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
            
            {/* Brand */}
            <div className="mb-4">
              <span className="text-gray-600">Brand: </span>
              <span className="font-medium">{brand}</span>
            </div>
            
            {/* Rating */}
            {rating && (
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-5 w-5" 
                      fill={i < Math.floor(rating) ? "currentColor" : "none"} 
                    />
                  ))}
                </div>
                <span className="text-gray-600 ml-2">
                  {rating} out of 5 ({reviews_count} {reviews_count === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="text-3xl font-bold text-indigo-600 mb-4">
              ${formattedPrice}
            </div>
            
            {/* Availability */}
            <div className={`font-medium mb-6 ${availabilityClass}`}>
              {availability}
            </div>
            
            {/* Add to Cart Button */}
            <button 
              className={`flex items-center justify-center px-6 py-3 rounded-md shadow-md text-white font-medium mb-6 ${
                isInStock 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!isInStock}
              onClick={() => alert(`Added ${name} to cart!`)}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            
            {/* Product Features */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-gray-500 mr-3" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-500 mr-3" />
                <span>2-year warranty included</span>
              </div>
              <div className="flex items-center">
                <RefreshCw className="h-5 w-5 text-gray-500 mr-3" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="px-6 py-8 border-t border-gray-200">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-line">
            {description}
          </div>
        </div>
        
        {/* Product Details/Specifications */}
        {specifications && (
          <div className="px-6 py-8 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium text-gray-700 w-1/3">{key}</span>
                  <span className="text-gray-600 w-2/3">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
