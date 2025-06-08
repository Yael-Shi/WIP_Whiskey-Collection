import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Star as StarIcon,
  Percent,
  MapPin,
  CalendarDays,
  Tag,
  Info,
  FileText,
  ImageOff,
  ChevronLeft,
  ListOrdered,
  Droplets,
  Settings2,
  AlertCircle,
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  fetchWhiskeyByIdApiCall,
  deleteWhiskeyApiCall,
} from '../../services/whiskeysApi';

// InfoRow Component - Moved outside WhiskeyDetailView to prevent nesting errors
const InfoRow = ({
  icon: Icon,
  label,
  value,
  valueClass = 'text-gray-800 dark:text-gray-100',
  isBadge = false,
  badgeVariant = 'outline',
}) => {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-start py-3 border-b border-gray-200 dark:border-gray-700/50 last:border-b-0">
      <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-1 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0" />
      <div className="flex-grow">
        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        {isBadge ? (
          <Badge variant={badgeVariant} className={`mt-0.5 ${valueClass}`}>
            {value}
          </Badge>
        ) : (
          <span className={`block text-md ${valueClass}`}>{value}</span>
        )}
      </div>
    </div>
  );
};

const WhiskeyDetailView = () => {
  const { whiskeyId } = useParams();
  const navigate = useNavigate();
  const [whiskey, setWhiskey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWhiskey = async () => {
      if (!whiskeyId) {
        setError('לא סופק מזהה וויסקי.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await fetchWhiskeyByIdApiCall(whiskeyId);
        setWhiskey(data);
      } catch (err) {
        setError(err.message || 'שגיאה בטעינת פרטי הוויסקי.');
        console.error('Error fetching whiskey details:', err);
      }
      setLoading(false);
    };
    loadWhiskey();
  }, [whiskeyId]);

  const handleEdit = () => {
    navigate(`/collection/edit/${whiskeyId}`);
  };

  const handleDelete = async () => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${whiskey?.name}?`)) {
      try {
        await deleteWhiskeyApiCall(whiskeyId);
        alert(`${whiskey?.name} נמחק בהצלחה.`);
        navigate('/collection');
      } catch (err) {
        setError(err.message || 'שגיאה במחיקת הוויסקי.');
        console.error('Error deleting whiskey:', err);
      }
    }
  };

  let numericBottleStatus = null;
  let displayBottleStatus = 'לא ידוע';

  if (typeof whiskey?.bottle_status === 'number') {
    numericBottleStatus = Math.max(0, Math.min(100, whiskey.bottle_status));
    displayBottleStatus = `${numericBottleStatus}%`;
  } else if (typeof whiskey?.bottle_status === 'string') {
    const parsed = parseFloat(whiskey.bottle_status.replace('%', ''));
    if (!Number.isNaN(parsed)) {
      numericBottleStatus = Math.max(0, Math.min(100, parsed));
      displayBottleStatus = `${numericBottleStatus}%`;
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" message="טוען פרטי וויסקי..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center" dir="rtl">
        <Card className="max-w-md mx-auto mt-10 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              אופס! שגיאה
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
            <Button
              onClick={() => navigate('/collection')}
              className="mt-6 bg-amber-600 hover:bg-amber-700"
            >
              <ChevronLeft className="ml-1 rtl:mr-1 h-4 w-4" /> חזור לאוסף
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!whiskey) {
    return (
      <div className="container mx-auto p-4 text-center" dir="rtl">
        <Info className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold">וויסקי לא נמצא</h2>
        <p className="mt-2 text-gray-500">
          יתכן שהוויסקי שחיפשת נמחק או שהקישור אינו תקין.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/collection">
            <ListOrdered size={18} className="ml-1 rtl:mr-1" /> כל הוויסקים
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl" dir="rtl">
      <Button
        variant="outline"
        onClick={() => navigate('/collection')}
        className="mb-6 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronLeft className="ml-2 rtl:mr-2 h-4 w-4" />
        חזרה לאוסף
      </Button>

      <Card className="shadow-xl dark:bg-gray-800 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-[3/4] md:aspect-auto bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center p-4 md:p-8">
            {whiskey.image_url ? (
              <img
                src={whiskey.image_url}
                alt={whiskey.name}
                className="max-w-full max-h-[400px] md:max-h-full object-contain rounded-lg shadow-md"
              />
            ) : (
              <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                <ImageOff size={64} />
                <p className="mt-2">אין תמונה זמינה</p>
              </div>
            )}
            {whiskey.is_favorite && (
              <div
                className="absolute top-4 right-4 rtl:left-4 rtl:right-auto bg-yellow-400 text-white p-2 rounded-full shadow-lg"
                title="מועדף"
              >
                <StarIcon size={24} className="fill-white" />
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl lg:text-4xl font-extrabold text-amber-700 dark:text-amber-300">
                {whiskey.name}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400 pt-1">
                {whiskey.distillery}
                {whiskey.region && `, ${whiskey.region}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-1 px-6 pb-6 flex-grow overflow-y-auto">
              <div className="grid grid-cols-1 gap-x-6">
                <InfoRow icon={Tag} label="סוג" value={whiskey.type} isBadge />
                {whiskey.age != null && whiskey.age !== '' && (
                  <InfoRow
                    icon={CalendarDays}
                    label="גיל"
                    value={
                      Number(whiskey.age) === 0
                        ? 'NAS (No Age Statement)'
                        : `${whiskey.age} שנים`
                    }
                  />
                )}
                {whiskey.abv != null && whiskey.abv !== '' && (
                  <InfoRow
                    icon={Droplets}
                    label="אחוז אלכוהול (ABV)"
                    value={`${whiskey.abv}%`}
                    valueClass="text-red-600 dark:text-red-400 font-semibold"
                    isBadge
                    badgeVariant="destructive"
                  />
                )}
                <InfoRow icon={MapPin} label="מדינה" value={whiskey.country} />
                {whiskey.cask_type && (
                  <InfoRow
                    icon={Settings2}
                    label="סוג חבית יישון"
                    value={whiskey.cask_type}
                  />
                )}
              </div>

              {numericBottleStatus !== null && (
                <div className="py-3 border-b border-gray-200 dark:border-gray-700/50">
                  <div className="flex items-center mb-1.5">
                    <Percent className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0" />
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      כמות נותרת בבקבוק
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${numericBottleStatus}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-10 text-left rtl:text-right">
                      {displayBottleStatus}
                    </span>
                  </div>
                </div>
              )}

              {whiskey.notes && (
                <div className="py-3 border-b border-gray-200 dark:border-gray-700/50">
                  <div className="flex items-center mb-1.5">
                    <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0" />
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      הערות אישיות
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {whiskey.notes}
                  </p>
                </div>
              )}

              <InfoRow
                icon={ListOrdered}
                label="ברקוד"
                value={whiskey.barcode}
              />

              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 pt-4 pb-1">
                פרטי רכישה:
              </h4>
              <InfoRow
                icon={CalendarDays}
                label="תאריך רכישה"
                value={
                  whiskey.purchase_date
                    ? new Date(whiskey.purchase_date).toLocaleDateString(
                        'he-IL',
                      )
                    : '-'
                }
              />
              {whiskey.purchase_price != null && (
                <InfoRow
                  icon={Tag}
                  label="מחיר רכישה"
                  value={`₪${whiskey.purchase_price.toFixed(2)}`}
                />
              )}
              {whiskey.bottle_size_ml != null && (
                <InfoRow
                  icon={Info}
                  label="גודל בקבוק"
                  value={`${whiskey.bottle_size_ml} מ"ל`}
                />
              )}
            </CardContent>

            <CardFooter className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-end items-center gap-3">
              <Button
                as={Link}
                to={`/tastings/new?whiskeyId=${whiskeyId}&whiskeyName=${encodeURIComponent(whiskey.name)}`}
                variant="default"
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Droplets className="ml-2 rtl:mr-2 h-4 w-4" /> הוסף טעימה
              </Button>
              <Button
                onClick={handleEdit}
                variant="outline"
                className="w-full sm:w-auto dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="ml-2 rtl:mr-2 h-4 w-4" /> ערוך פרטי ויסקי
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <Trash2 className="ml-2 rtl:mr-2 h-4 w-4" /> מחק ויסקי
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WhiskeyDetailView;
