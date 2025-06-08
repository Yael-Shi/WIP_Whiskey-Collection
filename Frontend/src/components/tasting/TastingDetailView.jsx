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
  Edit3,
  Trash2,
  Star,
  CalendarDays,
  Palette,
  List,
  Info,
  FileText,
  ImageOff,
  ChevronLeft,
  Wine,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { deleteTastingApiCall } from '../../services/tastingsApi';

// Dummy fetch functions - replace with your actual API calls
const fetchTastingById = async (id) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockTastings = {
        t1: {
          id: 't1',
          whiskey_id: '1', // Corresponds to a whiskey in your whiskey data
          tasting_date: '2024-03-10',
          rating: 4.5,
          setting: 'ערב שקט בבית, ליד האח',
          glassware: 'גלנקיירן (Glencairn)',
          color: 'ענבר עמוק',
          nose_notes: [
            'עשן כבול מתוק',
            'פירות יבשים (צימוקים, תאנים)',
            'וניל',
            'קרמל מלוח',
            'אצות ים',
          ],
          palate_notes: [
            'מתיקות עשירה של טופי',
            'תבלינים חמים (קינמון, פלפל שחור)',
            'עשן עוצמתי אך מאוזן',
            'רמזים לשוקולד מריר',
            'אלון קלוי',
          ],
          finish_notes: [
            'ארוכה מאוד',
            'מחממת',
            'עשן מתמשך',
            'מרירות קפה עדינה',
          ],
          nose_manual: 'ריח מורכב ומזמין, העשן משתלב נפלא עם המתיקות.',
          palate_manual: 'גוף מלא ועשיר. כל לגימה חושפת רבדים נוספים.',
          finish_manual: 'הסיומת נשארת דקות ארוכות, משאירה טעם מעושן ומתקתק.',
          overall_impression:
            'טעימה פנומנלית. הלגאבולין 16 במיטבו, מורכב, מאוזן ומהנה ביותר. כל חובב וויסקי מעושן חייב לנסות.',
          image_url:
            'https://www.thewhiskyworld.com/images/lagavulin-16-year-old-p5 Lagavulin-16-Year-Old-p5406-11448_medium.jpg', // Example image URL
        },
        t2: {
          id: 't2',
          whiskey_id: '2',
          tasting_date: '2024-01-20',
          rating: 3.8,
          setting: 'עם חברים, אחרי ארוחת ערב',
          glassware: 'טמבלר / אולד פאשנד / רוקס',
          color: 'זהב חיוור',
          nose_notes: [
            'פירותי (תפוח ירוק, אגס)',
            'דבש עדין',
            'פרחוניות קלה',
            'רמז לאלון',
          ],
          palate_notes: ['קליל ונגיש', 'מתיקות פירותית', 'וניל', 'מעט עץ אלון'],
          finish_notes: ['קצרה עד בינונית', 'נקייה', 'מתיקות נעימה'],
          nose_manual: 'אף קליל ומרענן, לא מאתגר מדי.',
          palate_manual: 'קל לשתייה, מתאים גם למתחילים בעולם הסינגל מאלטים.',
          finish_manual: 'סיומת פשוטה אך מספקת.',
          overall_impression:
            'וויסקי יומיומי נחמד מאוד. לא מורכב מדי אבל עושה את העבודה. תמורה טובה למחיר.',
          image_url: '',
        },
      };
      const tasting = mockTastings[id];
      if (tasting) {
        resolve(tasting);
      } else {
        reject(new Error('Tasting not found'));
      }
    }, 800);
  });

const fetchWhiskeyDetailsForTasting = async (whiskeyId) =>
  new Promise((resolve) => {
    setTimeout(() => {
      const whiskeys = {
        1: {
          name: 'Lagavulin 16 Year Old',
          distillery: 'Lagavulin Distillery',
          region: 'Islay',
        },
        2: {
          name: 'Glenfiddich 12 Year Old',
          distillery: 'Glenfiddich Distillery',
          region: 'Speyside',
        },
      };
      resolve(
        whiskeys[whiskeyId] || {
          name: 'ויסקי לא ידוע',
          distillery: '',
          region: '',
        },
      );
    }, 300);
  });

const TastingDetailView = () => {
  const { tastingId } = useParams();
  const navigate = useNavigate();
  const [tasting, setTasting] = useState(null);
  const [whiskeyDetails, setWhiskeyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTastingData = async () => {
      if (!tastingId) {
        setError('לא סופק מזהה טעימה.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const tastingData = await fetchTastingById(tastingId);
        setTasting(tastingData);
        if (tastingData && tastingData.whiskey_id) {
          const whiskeyData = await fetchWhiskeyDetailsForTasting(
            tastingData.whiskey_id,
          );
          setWhiskeyDetails(whiskeyData);
        }
      } catch (err) {
        setError(err.message || 'שגיאה בטעינת פרטי הטעימה.');
        console.error('Error fetching tasting details:', err);
      }
      setLoading(false);
    };
    loadTastingData();
  }, [tastingId]);

  const handleEdit = () => {
    navigate(`/tastings/edit/${tastingId}`);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `האם אתה בטוח שברצונך למחוק טעימה זו של ${whiskeyDetails?.name || 'הוויסקי'}?`,
      )
    ) {
      try {
        await deleteTastingApiCall(tastingId);
        alert(`הטעימה נמחקה בהצלחה.`);
        navigate('/tastings');
      } catch (err) {
        setError(err.message || 'שגיאה במחיקת הטעימה.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא ידוע';
    try {
      return new Date(dateString).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" message="טוען פרטי טעימה..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center" dir="rtl">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-red-700 dark:text-red-400">
          שגיאה
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-6">
          <ChevronLeft size={18} className="ml-1 rtl:mr-1" /> חזור
        </Button>
      </div>
    );
  }

  if (!tasting) {
    return (
      <div className="container mx-auto p-4 text-center" dir="rtl">
        <Info className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold">טעימה לא נמצאה</h2>
        <p className="mt-2 text-gray-500">
          יתכן שהטעימה שחיפשת נמחקה או שהקישור אינו תקין.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/tastings">
            <List size={18} className="ml-1 rtl:mr-1" /> כל הטעימות
          </Link>
        </Button>
      </div>
    );
  }

  // Helper to render notes section
  const renderNotesSection = (title, notesArray, manualNote) => {
    if ((!notesArray || notesArray.length === 0) && !manualNote) return null;
    return (
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {title}:
        </h4>
        {notesArray && notesArray.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {notesArray.map((note, index) => (
              <Badge
                // eslint-disable-next-line react/no-array-index-key
                key={note + index}
                variant="secondary"
                className="font-normal bg-sky-100 text-sky-800 dark:bg-sky-800/50 dark:text-sky-200"
              >
                {note}
              </Badge>
            ))}
          </div>
        )}
        {manualNote && (
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
            {manualNote}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-3xl p-2 sm:p-4" dir="rtl">
      <Card className="overflow-hidden shadow-xl dark:bg-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 border-b dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="mb-2 text-sky-600 dark:text-sky-400 hover:bg-sky-100/50 dark:hover:bg-sky-700/50 px-2 py-1"
              >
                <ChevronLeft size={20} className="ml-1 rtl:mr-1" /> חזור לרשימה
              </Button>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-sky-700 dark:text-sky-300">
                טעימה של: {whiskeyDetails?.name || 'ויסקי לא ידוע'}
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                {whiskeyDetails?.distillery}
                {whiskeyDetails?.region && `, ${whiskeyDetails.region}`}
              </CardDescription>
            </div>
            {tasting.rating > 0 && (
              <div
                className="flex items-center gap-1.5 text-yellow-500 dark:text-yellow-400 self-start sm:self-center mt-2 sm:mt-0"
                title={`דירוג: ${tasting.rating}/5`}
              >
                {/* eslint-disable-next-line react/no-array-index-key */}
                {[...Array(5)].map((_, i) => {
                  let starClassName = 'stroke-current opacity-40';
                  if (i < Math.floor(tasting.rating)) {
                    starClassName = 'fill-current';
                  } else if (i < tasting.rating) {
                    starClassName = 'fill-current opacity-60';
                  }
                  // eslint-disable-next-line react/no-array-index-key
                  return <Star key={i} size={22} className={starClassName} />;
                })}
                <span className="text-lg font-semibold ml-1 rtl:mr-1">
                  ({tasting.rating.toFixed(1)})
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {tasting.image_url && (
            <div className="mb-6 rounded-lg overflow-hidden border dark:border-gray-700 max-h-[400px] flex justify-center bg-gray-50 dark:bg-gray-700/30">
              <img
                src={tasting.image_url}
                alt={`תמונת טעימה - ${whiskeyDetails?.name}`}
                className="object-contain h-full w-auto max-h-[400px]"
              />
            </div>
          )}
          {!tasting.image_url && (
            <div className="mb-6 p-6 rounded-lg border-2 border-dashed dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 text-center text-gray-400 dark:text-gray-500">
              <ImageOff size={48} className="mx-auto mb-2" />
              <p>לא הועלתה תמונה לטעימה זו.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
            <InfoItem
              icon={CalendarDays}
              label="תאריך טעימה"
              value={formatDate(tasting.tasting_date)}
            />
            {tasting.setting && (
              <InfoItem
                icon={MapPin}
                label="מיקום / אווירה"
                value={tasting.setting}
              />
            )}
            {tasting.glassware && (
              <InfoItem icon={Wine} label="סוג כוס" value={tasting.glassware} />
            )}
            {tasting.color && (
              <InfoItem
                icon={Palette}
                label="צבע הוויסקי"
                value={tasting.color}
              />
            )}
          </div>

          <div className="border-t dark:border-gray-700 pt-5 space-y-4">
            {renderNotesSection(
              'אף (Nose)',
              tasting.nose_notes,
              tasting.nose_manual,
            )}
            {renderNotesSection(
              'חיך (Palate)',
              tasting.palate_notes,
              tasting.palate_manual,
            )}
            {renderNotesSection(
              'סיומת (Finish)',
              tasting.finish_notes,
              tasting.finish_manual,
            )}
          </div>

          {tasting.overall_impression && (
            <div className="border-t dark:border-gray-700 pt-5">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <FileText
                  size={20}
                  className="ml-2 rtl:mr-2 rtl:ml-0 text-sky-600 dark:text-sky-400"
                />
                התרשמות כללית
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                {tasting.overall_impression}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-end items-center gap-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="w-full sm:w-auto dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Edit3 size={16} className="ml-2 rtl:mr-2" /> ערוך טעימה
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            <Trash2 size={16} className="ml-2 rtl:mr-2" /> מחק טעימה
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TastingDetailView;

// Helper component for displaying info items consistently
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start">
    <Icon
      size={18}
      className="ml-2 rtl:mr-2 rtl:ml-0 mt-0.5 text-sky-600 dark:text-sky-400 flex-shrink-0"
    />
    <div>
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {label}:
      </span>
      <span className="text-gray-600 dark:text-gray-400 ml-1 rtl:mr-1">
        {value}
      </span>
    </div>
  </div>
);
