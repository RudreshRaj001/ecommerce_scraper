'use client';
// components/ProductNotFound.jsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProductNotFound() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
      <p className="text-gray-600 mb-6">We couldn't find the product you're looking for.</p>
      <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
        <ArrowLeft className="h-5 w-5 mr-2" /> Return to Product List
      </Link>
    </div>
  );
}
