'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-3xl shadow-luxury-lg max-w-4xl w-full overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white transition-all shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="grid md:grid-cols-2">
                  {/* Image Section */}
                  <div className="relative h-80 md:h-full">
                    {item.image && !imageError ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-200 to-primary-400 flex items-center justify-center">
                        <span className="text-8xl">🍽️</span>
                      </div>
                    )}

                    {/* Tags Overlay */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-primary-800"
                          >
                            {tag.replace('_', ' ').toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-8 flex flex-col">
                    <div className="flex-1">
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                        {item.name}
                      </h2>

                      <p className="text-neutral-600 text-lg leading-relaxed mb-6">{item.description}</p>

                      {/* Ingredients */}
                      {item.ingredients && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-neutral-900 mb-2">Ingredients</h3>
                          <p className="text-neutral-600">{item.ingredients}</p>
                        </div>
                      )}

                      {/* Dietary Info */}
                      {item.dietary_info && item.dietary_info.length > 0 && (
                        <div className="mb-6">
                          <h3 className="font-semibold text-neutral-900 mb-2">Dietary Information</h3>
                          <div className="flex flex-wrap gap-2">
                            {item.dietary_info.map((info) => (
                              <span
                                key={info}
                                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                              >
                                {info.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Allergens */}
                      {item.allergens && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div>
                              <h3 className="font-semibold text-red-900 mb-1">Allergen Warning</h3>
                              <p className="text-red-700 text-sm">Contains: {item.allergens}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {item.calories && (
                          <div className="text-center p-3 bg-neutral-50 rounded-xl">
                            <p className="text-2xl font-bold text-primary-600">{item.calories}</p>
                            <p className="text-xs text-neutral-600">Calories</p>
                          </div>
                        )}
                        {item.preparation_time && (
                          <div className="text-center p-3 bg-neutral-50 rounded-xl">
                            <p className="text-lg font-bold text-primary-600">{item.preparation_time}</p>
                            <p className="text-xs text-neutral-600">Prep Time</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Section */}
                    <div className="border-t border-neutral-200 pt-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-sm text-neutral-600 mb-1">Price</p>
                          <p className="font-display text-4xl font-bold text-primary-600">${item.price}</p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-primary-500 text-white rounded-full text-lg font-bold hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl">
                        Add to Order - ${(parseFloat(item.price) * quantity).toFixed(2)}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
