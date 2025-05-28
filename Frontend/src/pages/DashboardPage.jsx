import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ודא נתיב נכון

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// ייבוא אייקונים (אופציונלי)
import { Library, GlassWater, TrendingUp, PlusCircle, BarChart3, ListOrdered, Eye, Search, UserCircle } from 'lucide-react';

// דמה של פונקציות API - החלף בקריאות API אמיתיות
const fetchDashboardStats = async (userId) => {
  // userId יכול לשמש לסינון נתונים אם ה-API תומך בכך
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        totalWhiskeys: Math.floor(Math.random() * 50) + 5, // 5-54
        totalTastings: Math.floor(Math.random() * 200) + 10, // 10-209
        uniqueDistilleries: Math.floor(Math.random() * 20) + 3, // 3-22
        averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0-4.9
      });
    }, 800);
  });
};

const fetchRecentWhiskeys = async (limit = 3) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 'w1', name: 'Lagavulin 16 Year Old', distillery: 'Lagavulin', image_url: 'https://via.placeholder.com/150/F0E68C/000000?Text=Whiskey1' },
        { id: 'w2', name: 'Glenfiddich 12 Year Old', distillery: 'Glenfiddich', image_url: 'https://via.placeholder.com/150/FFD700/000000?Text=Whiskey2' },
        { id: 'w3', name: 'Ardbeg Uigeadail', distillery: 'Ardbeg', image_url: 'https://via.placeholder.com/150/D2B48C/000000?Text=Whiskey3' },
      ].slice(0, limit));
    }, 700);
  });
};

const fetchRecentTastings = async (limit = 3) => {
   return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 't1', whiskeyName: 'Lagavulin 16 Year Old', rating: 4.5, date: '2024-07-15' },
        { id: 't2', whiskeyName: 'Glenfiddich 12 Year Old', rating: 4.0, date: '2024-07-10' },
        { id: 't3', whiskeyName: 'Yamazaki 12 Year Old', rating: 4.8, date: '2024-06-28' },
      ].slice(0, limit));
    }, 900);
  });
};


export default function DashboardPage() {
  const { user } = useAuth(); // מניחים ש-user מכיל full_name או email
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentWhiskeys, setRecentWhiskeys] = useState([]);
  const [recentTastings, setRecentTastings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // במקביל, טען את כל הנתונים הדרושים
        const [statsData, whiskeysData, tastingsData] = await Promise.all([
          fetchDashboardStats(user?.id), // שלח userId אם ה-API דורש
          fetchRecentWhiskeys(3),
          fetchRecentTastings(3)
        ]);
        setStats(statsData);
        setRecentWhiskeys(whiskeysData);
        setRecentTastings(tastingsData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("שגיאה בטעינת נתוני לוח הבקרה.");
      } finally {
        setLoading(false);
      }
    };

    if (user) { // רק אם המשתמש קיים (כלומר, מאומת)
        loadDashboardData();
    }
  }, [user]);

  const StatCard = ({ icon: Icon, title, value, description, linkTo, linkText, bgColorClass = "bg-amber-500", iconColorClass = "text-white" }) => (
    // אם אין לך קומפוננטת Card כללית, תצטרך לעצב את זה ישירות כאן
    <div className={`p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 ${bgColorClass} text-white`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold opacity-90">{title}</h3>
        <div className={`p-2 rounded-full ${iconColorClass} bg-black/10 dark:bg-white/10`}>
            <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="text-4xl font-bold mb-1">{value}</p>
      {description && <p className="text-sm opacity-80 mb-3">{description}</p>}
      {linkTo && (
        <Link to={linkTo} className="text-sm font-medium opacity-90 hover:opacity-100 transition-opacity flex items-center">
          {linkText || "צפה בכל"} <Eye className="mr-1 rtl:ml-1 h-4 w-4" />
        </Link>
      )}
    </div>
  );


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]" dir="rtl">
        <LoadingSpinner size="lg" message="טוען לוח בקרה..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500" dir="rtl">{error}</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8" dir="rtl">
      <header className="pb-6 border-b dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
          ברוך הבא, {user?.fullName || user?.email || 'אורח'}!
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          זהו לוח הבקרה שלך. מכאן תוכל לנהל את אוסף הוויסקי והטעימות שלך.
        </p>
      </header>

      {/* Stats Section */}
      {stats && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            icon={Library}
            title="סה״כ באוסף"
            value={stats.totalWhiskeys}
            description="בקבוקי ויסקי שונים"
            linkTo="/collection"
            bgColorClass="bg-sky-600 dark:bg-sky-700"
          />
          <StatCard
            icon={GlassWater}
            title="סה״כ טעימות"
            value={stats.totalTastings}
            description="טעימות שתועדו"
            linkTo="/tastings"
            bgColorClass="bg-teal-500 dark:bg-teal-600"
          />
          <StatCard
            icon={ListOrdered}
            title="מזקקות שונות"
            value={stats.uniqueDistilleries}
            description="מזקקות באוסף שלך"
            // linkTo="/distilleries" // אם יש דף מזקקות
            bgColorClass="bg-indigo-500 dark:bg-indigo-600"
          />
          <StatCard
            icon={BarChart3}
            title="דירוג ממוצע"
            value={stats.averageRating > 0 ? stats.averageRating : "N/A"}
            description="מכלל הטעימות"
            bgColorClass="bg-purple-500 dark:bg-purple-600"
          />
        </section>
      )}

      {/* Quick Actions Section */}
       <section className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg shadow">
         <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">פעולות מהירות</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Button 
                onClick={() => navigate('/collection?action=add')}
                variant="default"
                className="w-full justify-center py-3 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
                <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5" /> הוסף ויסקי חדש
            </Button>
            <Button 
                onClick={() => navigate('/tastings?action=add')}
                variant="default"
                className="w-full justify-center py-3 bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
            >
                <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5" /> הוסף טעימה חדשה
            </Button>
             <Button 
                onClick={() => navigate('/discover')}
                variant="outline"
                className="w-full justify-center py-3 border-slate-400 text-slate-600 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-300 dark:hover:bg-slate-700"
            >
                <Search className="ml-2 rtl:mr-2 h-5 w-5" /> גלה המלצות ויסקי
            </Button>
         </div>
       </section>


      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Whiskeys */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">נוספו לאחרונה לאוסף</h2>
            <Link to="/collection" className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center">
              צפה בכל האוסף <Eye className="mr-1 rtl:ml-1 h-4 w-4" />
            </Link>
          </div>
          {recentWhiskeys.length > 0 ? (
            <div className="space-y-3">
              {recentWhiskeys.map(whiskey => (
                <div key={whiskey.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center space-x-4 rtl:space-x-reverse">
                  <img src={whiskey.image_url || 'https://via.placeholder.com/60/gray/white?text=W'} alt={whiskey.name} className="h-14 w-14 rounded-md object-cover flex-shrink-0" />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{whiskey.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{whiskey.distillery}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/whiskey/${whiskey.id}`)} className="text-amber-600 dark:text-amber-400">
                    פרטים
                  </Button>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <Library className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">עדיין לא הוספת ויסקי לאוסף.</p>
                <Button onClick={() => navigate('/collection?action=add')} className="mt-3" variant="outline">הוסף ויסקי ראשון</Button>
            </div>
          )}
        </section>

        {/* Recent Tastings */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">טעימות אחרונות</h2>
            <Link to="/tastings" className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center">
              צפה בכל הטעימות <Eye className="mr-1 rtl:ml-1 h-4 w-4" />
            </Link>
          </div>
          {recentTastings.length > 0 ? (
            <div className="space-y-3">
              {recentTastings.map(tasting => (
                <div key={tasting.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{tasting.whiskeyName}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(tasting.date).toLocaleDateString('he-IL', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center text-yellow-500 dark:text-yellow-400">
                        <BarChart3 className="h-4 w-4 mr-1 rtl:ml-1" />
                        <span className="font-semibold text-sm">{tasting.rating.toFixed(1)}</span>
                    </div>
                  </div>
                   <div className="mt-2 text-right rtl:text-left">
                     <Button variant="ghost" size="sm" onClick={() => navigate(`/tasting/${tasting.id}`)} className="text-amber-600 dark:text-amber-400">
                        צפה בטעימה
                     </Button>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <GlassWater className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">עדיין לא תיעדת טעימות.</p>
                 <Button onClick={() => navigate('/tastings?action=add')} className="mt-3" variant="outline">הוסף טעימה ראשונה</Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}