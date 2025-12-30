'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MenuFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDietary: string[];
  onDietaryChange: (dietary: string[]) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const dietaryOptions = [
  { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { value: 'vegan', label: 'Vegan', icon: '🌱' },
  { value: 'gluten_free', label: 'Gluten Free', icon: '🌾' },
  { value: 'dairy_free', label: 'Dairy Free', icon: '🥛' },
  { value: 'keto', label: 'Keto', icon: '🥑' },
  { value: 'halal', label: 'Halal', icon: '☪️' },
];

const tagOptions = [
  { value: 'signature', label: 'Signature', color: 'primary' },
  { value: 'popular', label: 'Popular', color: 'accent-emerald' },
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'spicy', label: 'Spicy', color: 'red' },
];

export function MenuFilters({
  searchTerm,
  onSearchChange,
  selectedDietary,
  onDietaryChange,
  selectedTags,
  onTagsChange,
  viewMode,
  onViewModeChange,
}: MenuFiltersProps) {
  const toggleDietary = (value: string) => {
    if (selectedDietary.includes(value)) {
      onDietaryChange(selectedDietary.filter((d) => d !== value));
    } else {
      onDietaryChange([...selectedDietary, value]);
    }
  };

  const toggleTag = (value: string) => {
    if (selectedTags.includes(value)) {
      onTagsChange(selectedTags.filter((t) => t !== value));
    } else {
      onTagsChange([...selectedTags, value]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-6">
      {/* Search Bar and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-3 pl-12 border-2 border-neutral-200 rounded-full focus:border-primary-500 focus:outline-none transition-colors"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-full">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Dietary Filters */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Dietary Preferences</h3>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleDietary(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedDietary.includes(option.value)
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tag Filters */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-700 mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleTag(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTags.includes(option.value)
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedDietary.length > 0 || selectedTags.length > 0 || searchTerm) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 pt-4 border-t border-neutral-200"
        >
          <span className="text-sm text-neutral-600">Active filters:</span>
          {searchTerm && (
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              Search: "{searchTerm}"
            </span>
          )}
          {selectedDietary.map((d) => (
            <span key={d} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              {dietaryOptions.find((o) => o.value === d)?.label}
            </span>
          ))}
          {selectedTags.map((t) => (
            <span key={t} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
              {tagOptions.find((o) => o.value === t)?.label}
            </span>
          ))}
          <button
            onClick={() => {
              onSearchChange('');
              onDietaryChange([]);
              onTagsChange([]);
            }}
            className="ml-auto text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear All
          </button>
        </motion.div>
      )}
    </div>
  );
}
