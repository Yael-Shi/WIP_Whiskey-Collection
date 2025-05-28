import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wine, Edit, Trash2, Star as StarIcon, Eye, Percent, MapPin } from 'lucide-react';

export default function WhiskeyCard({ whiskey, onEdit, onDelete }) {
  // Ensure all expected properties have default fallbacks to prevent errors
  const {
    id,
    name = 'שם לא ידוע',
    distillery = 'מזקקה לא ידועה', // Changed from distillery_name for typical standalone app schema
    region = '',
    type = '',
    age = null, // Use null for missing age for clearer conditional logic
    abv = null, // Alcohol By Volume, use null for missing
    image_url = '',
    bottle_status = null, // Percentage, e.g., 80 for 80% full, null if unknown
    is_favorite = false
  } = whiskey || {}; // Fallback to empty object if whiskey is undefined

  // Ensure id is present for routing and keys
  if (!id) {
    // You might want to log an error or render a specific "invalid data" card
    console.error("WhiskeyCard: Whiskey object is missing an 'id'.", whiskey);
    return (
        <Card className="flex flex-col items-center justify-center h-full shadow-lg p-4 dark:bg-gray-800 text-center" dir="rtl">
            <Wine className="w-16 h-16 text-red-300 dark:text-red-500 mb-2"/>
            <p className="text-red-600 dark:text-red-400">שגיאה: נתוני וויסקי חסרים או לא תקינים.</p>
        </Card>
    );
  }

  // Ensure bottle_status is a number for width calculation and display
  let numericBottleStatus = null;
  let displayBottleStatus = 'לא ידוע';

  if (typeof bottle_status === 'number') {
    numericBottleStatus = Math.max(0, Math.min(100, bottle_status)); // Clamp between 0 and 100
    displayBottleStatus = `${numericBottleStatus}%`;
  } else if (typeof bottle_status === 'string') {
    const parsed = parseFloat(bottle_status.replace('%', ''));
    if (!isNaN(parsed)) {
      numericBottleStatus = Math.max(0, Math.min(100, parsed));
      displayBottleStatus = `${numericBottleStatus}%`;
    }
  }
  
  const detailPagePath = `/collection/${id}`; // Ensure this route is defined in your React Router setup

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Link to={detailPagePath} className="group">
            <CardTitle className="text-lg md:text-xl font-bold text-amber-700 dark:text-amber-300 line-clamp-2 leading-tight group-hover:underline group-hover:text-amber-600 dark:group-hover:text-amber-200">
              {name}
            </CardTitle>
          </Link>
          {is_favorite && <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" title="מועדף" />}
        </div>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <MapPin size={14} className="ml-1 rtl:mr-1 rtl:ml-0 text-gray-500" />
            {distillery}
            {region && `, ${region}`}
        </CardDescription>
      </CardHeader>

      <Link to={detailPagePath} className="block group flex-grow">
        <div className="h-48 w-full bg-amber-50 dark:bg-gray-700/50 rounded-md flex items-center justify-center overflow-hidden relative group-hover:opacity-80 transition-opacity mx-4">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="w-auto h-full max-h-48 object-contain p-2"
              onError={(e) => {
                e.target.style.display = 'none'; // Hide broken image
                const placeholder = e.target.parentElement.querySelector('.placeholder-icon');
                if (placeholder) {
                    placeholder.style.display = 'flex';
                }
              }}
            />
          ) : null}
          {/* Placeholder Icon - shown if image_url is missing OR if image fails to load */}
          <div 
            className={`placeholder-icon w-full h-full items-center justify-center ${image_url ? 'hidden' : 'flex'}`}
            style={{ display: image_url ? 'none' : 'flex' }} 
          >
            <Wine className="w-20 h-20 text-amber-300 dark:text-amber-500" />
          </div>
           {image_url && ( // Show eye icon for hover effect only if image exists
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-10 h-10 text-white"/>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="space-y-2 pt-4 pb-3 px-4">
        <div className="flex flex-wrap gap-1.5">
          {type && <Badge variant="secondary">{type}</Badge>}
          {age != null && age !== '' && <Badge variant="outline">{Number(age) === 0 ? 'NAS' : `${age} שנים`}</Badge>}
          {abv != null && abv !== '' && <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">{abv}% ABV</Badge>}
        </div>
        
        {numericBottleStatus !== null && (
          <div className="pt-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
              <Percent size={14} className="ml-1 rtl:mr-1 rtl:ml-0"/> כמות נותרת: {displayBottleStatus}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 dark:bg-amber-400 h-2 transition-all duration-500 ease-out"
                style={{ width: `${numericBottleStatus}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 pt-2 pb-3 border-t dark:border-gray-700/50">
        <div className="flex w-full justify-between items-center gap-2">
          <Link to={detailPagePath} className="flex-1">
            <Button variant="outline" size="sm" className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <Eye className="ml-1 rtl:mr-1 rtl:ml-0 h-4 w-4" /> פרטים
            </Button>
          </Link>
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(whiskey)} className="text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400" title="ערוך">
              <Edit className="h-5 w-5" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(id)} className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400" title="מחק">
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}