import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

import { AlertTriangle, Home, Compass, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-6 bg-gray-50 dark:bg-gray-900"
      dir="rtl"
    >
      <AlertTriangle className="w-24 h-24 md:w-32 md:h-32 text-amber-500 dark:text-amber-400 mb-8 animate-pulse" />

      <h1 className="text-5xl md:text-7xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">
        404
      </h1>

      <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
        אופס! הדף שחיפשת לא נמצא.
      </h2>

      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-md">
        יתכן שהקישור שגוי, הדף הוסר, או שמעולם לא היה קיים.
        אל דאגה, אפשר לחזור למסלול!
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          asChild
          className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 text-lg px-8 py-3 rounded-lg shadow-md transition-transform hover:scale-105"
        >
          <Link to="/">
            <Home className="ml-2 rtl:mr-2 h-5 w-5" />
            חזרה לדף הבית
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="text-amber-700 border-amber-600 hover:bg-amber-50 dark:text-amber-300 dark:border-amber-500 dark:hover:bg-gray-800 text-lg px-8 py-3 rounded-lg shadow-md transition-transform hover:scale-105"
        >
          <Link to="/discover">
            <Compass className="ml-2 rtl:mr-2 h-5 w-5" />
            גלה ויסקי חדש
          </Link>
        </Button>
      </div>

      <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
        אם אתה חושב שזו טעות, אנא <Link to="/contact" className="text-amber-600 dark:text-amber-400 hover:underline">צור איתנו קשר</Link>.
      </p>
    </div>
  );
}
