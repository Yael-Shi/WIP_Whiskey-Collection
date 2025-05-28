import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit3, Trash2, CalendarDays, Settings2, Palette, TextQuote, ImageOff, Eye } from 'lucide-react';

// Helper function to format date (can be moved to a utils file)
const formatDate = (dateString) => {
  if (!dateString) return 'תאריך לא ידוע';
  try {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    // If dateString is already formatted or invalid, return as is
    return dateString.toString(); 
  }
};

export default function TastingCard({ tasting, whiskeyName, onEdit, onDelete }) {
  // Destructure with defaults to prevent errors if tasting or its properties are undefined
  const {
    id,
    tasting_date,
    rating = 0, // Default to 0 if no rating
    overall_impression = '',
    setting = '',
    glassware = '',
    color = '',
    image_url = '', // Optional image for the tasting itself
  } = tasting || {}; // Fallback to empty object if tasting is undefined

  // Ensure id is present, critical for keys and navigation
  if (!id) {
    console.error("TastingCard: Tasting object is missing an 'id'.", tasting);
    return (
        <Card className="p-4 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-800 border border-red-200 dark:border-red-700" dir="rtl">
            שגיאה: נתוני טעימה חסרים או לא תקינים.
        </Card>
    );
  }

  const detailPagePath = `/tastings/${id}`; // Make sure this route is configured in your React Router

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
            <Link to={detailPagePath} className="group">
                <CardTitle className="text-xl font-semibold text-sky-700 dark:text-sky-300 group-hover:underline group-hover:text-sky-600 dark:group-hover:text-sky-200">
                טעימה של: {whiskeyName || 'ויסקי לא ידוע'}
                </CardTitle>
            </Link>
            {/* Display star rating */}
            {rating > 0 && (
                <div className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400" title={`דירוג: ${rating} כוכבים`}>
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={i < Math.floor(rating) ? 'fill-current' : (i < rating ? 'fill-current opacity-60' : 'stroke-current opacity-50')} />
                    ))}
                    <span className="text-xs ml-1 rtl:mr-1">({rating.toFixed(1)})</span>
                </div>
            )}
        </div>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400 flex items-center pt-1">
            <CalendarDays size={14} className="ml-1 rtl:mr-1 rtl:ml-0" />
            {formatDate(tasting_date)}
        </CardDescription>
      </CardHeader>

      {/* Image Section */}
      <Link to={detailPagePath} className="block group">
        <div className="h-40 w-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden relative group-hover:opacity-90 transition-opacity mx-4 rounded-md">
          {image_url ? (
            <img
              src={image_url}
              alt={`תמונת טעימה - ${whiskeyName || 'ויסקי'}`}
              className="w-full h-full object-cover"
              onError={(e) => { 
                e.target.style.display = 'none'; // Hide broken image
                const placeholder = e.target.parentElement.querySelector('.placeholder-icon');
                if(placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Placeholder shown if no image_url OR if image fails to load */}
          <div 
            className={`placeholder-icon w-full h-full flex-col items-center justify-center text-gray-400 dark:text-gray-500 ${image_url ? 'hidden' : 'flex'}`}
            style={{ display: image_url ? 'none' : 'flex'}}
          >
            <ImageOff size={48} />
            <p className="text-xs mt-1">אין תמונה</p>
          </div>
          {image_url && ( // Eye icon for hover effect
             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-8 h-8 text-white"/>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="flex-grow pt-4 px-4 space-y-2">
        {overall_impression && (
          <div className="flex items-start">
            <TextQuote size={16} className="ml-2 rtl:mr-2 rtl:ml-0 mt-0.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
              {overall_impression}
            </p>
          </div>
        )}
        {/* Badges for additional info */}
        <div className="flex flex-wrap gap-2 pt-1">
            {setting && <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300"><Settings2 size={12}/> {setting}</Badge>}
            {glassware && <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 22h8"/><path d="M5 12v10h14V12"/><path d="M5.52 4.22a7 7 0 0 1 12.96 0"/></svg> {glassware}</Badge>}
            {color && <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300"><Palette size={12}/> {color}</Badge>}
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t dark:border-gray-700/50 flex justify-end space-x-2 rtl:space-x-reverse">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(tasting)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            <Edit3 size={16} className="ml-1 rtl:mr-1" /> ערוך
          </Button>
        )}
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
            <Trash2 size={16} className="ml-1 rtl:mr-1" /> מחק
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}