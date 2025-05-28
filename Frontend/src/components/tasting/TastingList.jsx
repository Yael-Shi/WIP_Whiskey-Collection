// src/components/tasting/TastingList.jsx
import React from 'react';
import TastingCard from './TastingCard';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { GlassWater, PlusCircle, Loader2 } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function TastingList({
  tastings,
  whiskeyMap = {}, // Map of whiskey_id to whiskey_name (e.g., { "1": "Lagavulin 16", "2": "Glenfiddich 12" })
  onEditTasting, // Callback for edit action: (tastingId) => void
  onDeleteTasting, // Callback for delete action: (tastingId) => void
  isLoading,
  showEmptyState = true,
  emptyStateTitle = "עדיין לא תיעדת טעימות.",
  emptyStateMessage = "הוסף את הטעימה הראשונה שלך כדי להתחיל!",
  addTastingUrl = "/tastings/add" // URL for the "Add Tasting" page/modal trigger
}) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
        {[...Array(3)].map((_, index) => (
          // Skeleton Card
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2 rtl:space-x-reverse">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (showEmptyState && (!tastings || tastings.length === 0)) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg" dir="rtl">
        <GlassWater className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{emptyStateTitle}</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{emptyStateMessage}</p>
        {addTastingUrl && (
            <Button asChild className="mt-6 bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-600">
                <Link to={addTastingUrl}>
                    <PlusCircle className="ml-2 rtl:mr-2 rtl:ml-0 h-5 w-5" />
                    הוסף טעימה חדשה
                </Link>
            </Button>
        )}
      </div>
    );
  }

  if (!tastings || tastings.length === 0) {
    // If empty state is disabled and no tastings, render nothing or a minimal message
    return null; 
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="rtl">
      {tastings.map((tasting) => {
        if (!tasting || !tasting.id) {
            console.warn("TastingList: Encountered a tasting item without an ID.", tasting);
            return null; // Skip rendering this item
        }
        const whiskeyName = whiskeyMap[tasting.whiskey_id] || 'ויסקי לא ידוע';
        return (
            <TastingCard
            key={tasting.id}
            tasting={tasting}
            whiskeyName={whiskeyName}
            // Pass callbacks to TastingCard if actions are directly on the card
            // Otherwise, TastingCard might use Link for navigation and actions handled on detail page
            onEdit={onEditTasting ? () => onEditTasting(tasting.id) : undefined} 
            onDelete={onDeleteTasting ? () => onDeleteTasting(tasting.id) : undefined}
            />
        );
      })}
    </div>
  );
}