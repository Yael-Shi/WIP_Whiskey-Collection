import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Edit, Trash2, Star as StarIcon, Percent, MapPin, CalendarDays, Tag, Info, FileText, ImageOff, ChevronLeft, ListOrdered, Droplets, Settings2 } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner'; // Assuming you have a LoadingSpinner component

// Dummy fetch function - replace with your actual API call
const fetchWhiskeyById = async (id) => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Replace with your actual data fetching logic
      // This is just example data structure
      const mockWhiskeys = {
        "1": {
          id: "1",
          name: "Lagavulin 16 Year Old",
          distillery: "Lagavulin",
          region: "איילה, סקוטלנד",
          type: "סינגל מאלט סקוטי",
          age: 16,
          abv: 43,
          purchase_price: 350,
          purchase_date: "2023-05-15",
          bottle_size_ml: 700,
          bottle_status: 60, // percentage
          notes: "קלאסיקה מעושנת מאיילה. רשמים של עשן כבול, יוד, מתיקות פירותית עדינה ואצות ים. סיומת ארוכה ומחממת עם רמזים למלח.",
          image_url: "https://cdn11.bigcommerce.com/s-b012t/images/stencil/1280x1280/products/3000/6218/Lagavulin16yr__39689.1669679390.jpg?c=2", // Replace with a real image URL
          is_favorite: true,
          cask_type: "חביות ברבן ושרי",
          country: "סקוטלנד",
          barcode: "5000281003778"
        },
        "2": {
          id: "2",
          name: "Glenfiddich 12 Year Old",
          distillery: "Glenfiddich",
          region: "ספייסייד, סקוטלנד",
          type: "סינגל מאלט סקוטי",
          age: 12,
          abv: 40,
          purchase_price: 180,
          purchase_date: "2022-11-20",
          bottle_size_ml: 700,
          bottle_status: 90,
          notes: "אחד הסינגל מאלטים הנמכרים בעולם. קליל ופירותי עם רמזים לאגס ואלון עדין. נגיש ומהנה.",
          image_url: "https://www.totalwine.com/dynamic/x490,sq/media/sys_master/twmmedia/h79/h2f/12229298192414.png", // Replace with a real image URL
          is_favorite: false,
          cask_type: "חביות ברבן אמריקאיות וחביות שרי ספרדיות",
          country: "סקוטלנד"
        },
      };
      const whiskey = mockWhiskeys[id];
      if (whiskey) {
        resolve(whiskey);
      } else {
        reject(new Error("Whiskey not found"));
      }
    }, 1000);
  });
};


export default function WhiskeyDetailView() {
  const { whiskeyId } = useParams(); // Get whiskeyId from URL parameters
  const navigate = useNavigate();
  const [whiskey, setWhiskey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWhiskey = async () => {
      if (!whiskeyId) {
        setError("לא סופק מזהה וויסקי.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const data = await fetchWhiskeyById(whiskeyId); // Replace with your actual data fetching
        setWhiskey(data);
      } catch (err) {
        setError(err.message || "שגיאה בטעינת פרטי הוויסקי.");
        console.error("Error fetching whiskey details:", err);
      }
      setLoading(false);
    };
    loadWhiskey();
  }, [whiskeyId]);

  const handleEdit = () => {
    // Navigate to an edit page, passing the whiskey ID or state
    navigate(`/collection/edit/${whiskeyId}`); // Ensure this route exists and handles editing
  };

  const handleDelete = async () => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${whiskey?.name}?`)) {
      try {
        // Replace with your actual delete API call
        console.log(`Deleting whiskey with ID: ${whiskeyId}`);
        // await deleteWhiskeyApiCall(whiskeyId); 
        alert(`${whiskey?.name} נמחק בהצלחה.`);
        navigate('/collection'); // Navigate back to the collection list
      } catch (err) {
        setError(err.message || "שגיאה במחיקת הוויסקי.");
        console.error("Error deleting whiskey:", err);
      }
    }
  };

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
            <CardTitle className="text-red-600 dark:text-red-400">אופס! שגיאה</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{error}</p>
            <Button onClick={() => navigate('/collection')} className="mt-6 bg-amber-600 hover:bg-amber-700">
              <ChevronLeft className="ml-1 rtl:mr-1 h-4 w-4"/> חזור לאוסף
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!whiskey) {
    // This case should ideally be caught by the error state if fetch fails
    return (
        <div className="container mx-auto p-4 text-center" dir="rtl">
            <p className="text-xl text-gray-700 dark:text-gray-300">הוויסקי המבוקש לא נמצא.</p>
            <Button onClick={() => navigate('/collection')} className="mt-6 bg-amber-600 hover:bg-amber-700">
               <ChevronLeft className="ml-1 rtl:mr-1 h-4 w-4"/> חזור לאוסף
            </Button>
        </div>
    );
  }

  // Ensure bottle_status is a number for width calculation and display
  let numericBottleStatus = null;
  let displayBottleStatus = 'לא ידוע';

  if (typeof whiskey.bottle_status === 'number') {
    numericBottleStatus = Math.max(0, Math.min(100, whiskey.bottle_status));
    displayBottleStatus = `${numericBottleStatus}%`;
  } else if (typeof whiskey.bottle_status === 'string') {
    const parsed = parseFloat(whiskey.bottle_status.replace('%', ''));
    if (!isNaN(parsed)) {
      numericBottleStatus = Math.max(0, Math.min(100, parsed));
      displayBottleStatus = `${numericBottleStatus}%`;
    }
  }
  
  const InfoRow = ({ icon: Icon, label, value, valueClass = "text-gray-800 dark:text-gray-100", isBadge = false, badgeVariant = "outline" }) => {
    if (value == null || value === '') return null;
    return (
      <div className="flex items-start py-3 border-b border-gray-200 dark:border-gray-700/50 last:border-b-0">
        <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-1 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0" />
        <div className="flex-grow">
          <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
          {isBadge ? (
            <Badge variant={badgeVariant} className={`mt-0.5 ${valueClass}`}>{value}</Badge>
          ) : (
            <span className={`block text-md ${valueClass}`}>{value}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl" dir="rtl">
      <Button variant="outline" onClick={() => navigate('/collection')} className="mb-6 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
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
              <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto bg-yellow-400 text-white p-2 rounded-full shadow-lg" title="מועדף">
                <StarIcon size={24} className="fill-white"/>
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
                {whiskey.distillery}{whiskey.region && `, ${whiskey.region}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-1 px-6 pb-6 flex-grow overflow-y-auto">
                <div className="grid grid-cols-1 gap-x-6">
                    <InfoRow icon={Tag} label="סוג" value={whiskey.type} isBadge={true} />
                    {whiskey.age != null && whiskey.age !== '' && <InfoRow icon={CalendarDays} label="גיל" value={Number(whiskey.age) === 0 ? 'NAS (No Age Statement)' : `${whiskey.age} שנים`} />}
                    {whiskey.abv != null && whiskey.abv !== '' && <InfoRow icon={Droplets} label="אחוז אלכוהול (ABV)" value={`${whiskey.abv}%`} valueClass="text-red-600 dark:text-red-400 font-semibold" isBadge={true} badgeVariant="destructive" />}
                    <InfoRow icon={MapPin} label="מדינה" value={whiskey.country} />
                    {whiskey.cask_type && <InfoRow icon={Settings2} label="סוג חבית יישון" value={whiskey.cask_type} />}
                </div>
              
              {numericBottleStatus !== null && (
                <div className="py-3 border-b border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center mb-1.5">
                        <Percent className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0" />
                        <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">כמות נותרת בבקבוק</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div
                            className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${numericBottleStatus}%` }}
                        ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 w-10 text-left rtl:text-right">{displayBottleStatus}</span>
                    </div>
                </div>
              )}

              {whiskey.notes && (
                <div className="py-3 border-b border-gray-200 dark:border-gray-700/50">
                  <div className="flex items-center mb-1.5">
                    <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0" />
                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">הערות אישיות</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{whiskey.notes}</p>
                </div>
              )}
              
              <InfoRow icon={ListOrdered} label="ברקוד" value={whiskey.barcode} />

              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 pt-4 pb-1">פרטי רכישה:</h4>
              <InfoRow icon={CalendarDays} label="תאריך רכישה" value={whiskey.purchase_date ? new Date(whiskey.purchase_date).toLocaleDateString('he-IL') : '-'} />
              {whiskey.purchase_price != null && <InfoRow icon={Tag} label="מחיר רכישה" value={`₪${whiskey.purchase_price.toFixed(2)}`} />}
              {whiskey.bottle_size_ml != null && <InfoRow icon={Info} label="גודל בקבוק" value={`${whiskey.bottle_size_ml} מ"ל`} />}

            </CardContent>

            <CardFooter className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-end items-center gap-3">
                {/* This button would navigate to a page for adding a new tasting for this specific whiskey */}
                <Button 
                    as={Link} 
                    to={`/tastings/new?whiskeyId=${whiskeyId}&whiskeyName=${encodeURIComponent(whiskey.name)}`}
                    variant="default"
                    className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white"
                >
                    <Droplets className="ml-2 rtl:mr-2 h-4 w-4"/> הוסף טעימה
                </Button>
              <Button onClick={handleEdit} variant="outline" className="w-full sm:w-auto dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Edit className="ml-2 rtl:mr-2 h-4 w-4" /> ערוך פרטי ויסקי
              </Button>
              <Button onClick={handleDelete} variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="ml-2 rtl:mr-2 h-4 w-4" /> מחק ויסקי
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}