import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom'; // For "Add New Whiskey" button if it navigates
import { Library, PlusCircle, Loader2 } from 'lucide-react';
import WhiskeyCard from './WhiskeyCard';

const WhiskeyList = ({
  whiskeys,
  onEdit, // Callback for edit action on a whiskey card
  onDelete, // Callback for delete action on a whiskey card
  isLoading,
  showEmptyState = true,
  emptyStateTitle = 'אוסף הוויסקי שלך ריק כרגע.',
  emptyStateMessage = 'הוסף את הוויסקי הראשון שלך כדי להתחיל!',
  // You might pass a URL or a callback for adding a new whiskey
  addNewWhiskeyPath, // e.g., "/collection/new" or similar to navigate to a form page
}) => {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        dir="rtl"
      >
        {[...Array(8)].map((_, index) => (
          <div
            key={crypto.randomUUID()}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-300 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20" />
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (showEmptyState && (!whiskeys || whiskeys.length === 0)) {
    return (
      <div
        className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
        dir="rtl"
      >
        <Library className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          {emptyStateTitle}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {emptyStateMessage}
        </p>
        {addNewWhiskeyPath && (
          <Button
            asChild
            className="mt-6 bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600"
          >
            <Link to={addNewWhiskeyPath}>
              <PlusCircle className="ml-2 rtl:mr-2 rtl:ml-0 h-5 w-5" />
              הוסף ויסקי חדש
            </Link>
          </Button>
        )}
      </div>
    );
  }

  if (!whiskeys || whiskeys.length === 0) {
    // If empty state is disabled and no whiskeys, render nothing or a minimal message
    return null;
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      dir="rtl"
    >
      {whiskeys.map((whiskey) => (
        <WhiskeyCard
          key={whiskey.id}
          whiskey={whiskey}
          onEdit={() => onEdit && onEdit(whiskey)} // Pass the whiskey object to edit handler
          onDelete={() => onDelete && onDelete(whiskey.id)} // Pass whiskey ID to delete handler
        />
      ))}
    </div>
  );
};

export default WhiskeyList;
