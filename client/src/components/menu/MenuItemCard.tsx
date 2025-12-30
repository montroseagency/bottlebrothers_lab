'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/lib/api';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MenuItemCardProps {
  item: MenuItem;
  viewMode: 'grid' | 'list';
  onSelect: (item: MenuItem) => void;
}

export function MenuItemCard({ item, viewMode, onSelect }: MenuItemCardProps) {
  const [imageError, setImageError] = useState(false);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-md hover:shadow-luxury transition-all duration-300 overflow-hidden cursor-pointer group"
        onClick={() => onSelect(item)}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-48 flex-shrink-0 overflow-hidden">
            {item.image && !imageError ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
            {/* Tags Overlay */}
            {item.tags && item.tags.length > 0 && (
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary-800"
                  >
                    {tag.replace('_', ' ').toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-neutral-600 mb-4 line-clamp-2">{item.description}</p>

              {/* Dietary Info */}
              {item.dietary_info && item.dietary_info.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.dietary_info.map((info) => (
                    <span
                      key={info}
                      className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
                    >
                      {info.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Allergens Warning */}
              {item.allergens && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Contains: {item.allergens}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
              <div>
                <span className="font-display text-3xl font-bold text-primary-600">${item.price}</span>
                {item.preparation_time && (
                  <span className="ml-3 text-sm text-neutral-500">⏱️ {item.preparation_time}</span>
                )}
              </div>
              <button className="px-6 py-2 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors">
                Order Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-luxury transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={() => onSelect(item)}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        {item.image && !imageError ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary-800"
              >
                {tag.replace('_', ' ').toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-xl font-bold text-neutral-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {item.name}
        </h3>
        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{item.description}</p>

        {/* Dietary Info */}
        {item.dietary_info && item.dietary_info.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.dietary_info.slice(0, 3).map((info) => (
              <span
                key={info}
                className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
              >
                {info.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
          <span className="font-display text-2xl font-bold text-primary-600">${item.price}</span>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 transition-colors">
            Order
          </button>
        </div>
      </div>
    </motion.div>
  );
}
