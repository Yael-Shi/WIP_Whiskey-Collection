// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { AuthProvider, useAuth } from './components/auth/AuthContext';
// import { createPageUrl } from './utils';

// import { Home, Library, GlassWater, User as UserIcon, LogOut, Menu, X, Settings, Wine, LogIn } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Skeleton } from "@/components/ui/skeleton";

// const NavLink = ({ to, icon: Icon, label, onClick, currentPageName, pageName }) => (
//   <Link
//     to={to}
//     onClick={onClick}
//     className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors rtl:space-x-reverse ${
//       currentPageName === pageName
//         ? 'bg-amber-600 text-white'
//         : 'text-gray-300 hover:bg-gray-700 hover:text-white'
//     }`}
//   >
//     <Icon className="w-5 h-5 ml-3" />
//     <span>{label}</span>
//   </Link>
// );

// function AppLayout({ children, currentPageName }) {
//   const { isAuthenticated, user, loading, logoutUser, loginUser } = useAuth();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

//   const sidebarContent = (
//     <nav className="flex-1 px-2 py-4 space-y-1">
//       <NavLink to={createPageUrl("Dashboard")} icon={Home} label="דף הבית" onClick={() => setMobileMenuOpen(false)} currentPageName={currentPageName} pageName="Dashboard" />
//       <NavLink to={createPageUrl("Collection")} icon={Library} label="האוסף שלי" onClick={() => setMobileMenuOpen(false)} currentPageName={currentPageName} pageName="Collection"/>
//       <NavLink to={createPageUrl("Tastings")} icon={GlassWater} label="טעימות" onClick={() => setMobileMenuOpen(false)} currentPageName={currentPageName} pageName="Tastings"/>
//       {/* <NavLink to={createPageUrl("Discover")} icon={Search} label="גילוי" onClick={() => setMobileMenuOpen(false)} /> */}
//     </nav>
//   );

//   // Handling loading state and unauthenticated state
//   // The platform should ideally handle redirection for unauthenticated access to protected pages.
//   // This component (Layout.js) is likely only rendered for pages that are part of the authenticated app experience.
//   // If a page is public, it might not use this Layout.js or this Layout.js needs to be more conditional.
//   // For now, assume this Layout is for the core authenticated app.
//   // A "Login" button is shown if not authenticated (though platform might redirect before this).

//   if (loading) {
//     return (
//         <div className="flex h-screen bg-gray-100" dir="rtl">
//              <aside className="hidden md:flex md:flex-shrink-0">
//                 <div className="flex flex-col w-64 bg-gray-800">
//                     <div className="flex items-center justify-center h-16 bg-gray-900">
//                         <Wine className="h-8 w-8 text-amber-400" />
//                         <span className="ml-2 text-white text-lg font-semibold">אוסף הוויסקי</span>
//                     </div>
//                      <div className="flex-1 px-2 py-4 space-y-2">
//                         <Skeleton className="h-10 w-full" />
//                         <Skeleton className="h-10 w-full" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                 </div>
//             </aside>
//             <div className="flex-1 flex flex-col overflow-hidden">
//                 <header className="bg-white shadow-sm h-16 flex items-center justify-end px-4 sm:px-6 lg:px-8">
//                     <Skeleton className="h-10 w-10 rounded-full" />
//                 </header>
//                 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
//                     <Skeleton className="h-32 w-full mb-4" />
//                     <Skeleton className="h-64 w-full" />
//                 </main>
//             </div>
//         </div>
//     );
//   }

//   // If not authenticated, show a minimal layout or a login prompt.
//   // However, base44 platform might handle global unauth redirects.
//   // If this Layout is *always* for auth-only pages, this block might change.
//   if (!isAuthenticated && (currentPageName !== 'Login' && currentPageName !== 'Register')) {
//      // Assuming 'Login' and 'Register' pages don't use this Layout or handle their own simple layout
//      // If platform handles redirect, this might not be visible.
//      // If this Layout *can* be shown for public pages (e.g. a landing page), content here would change.
//      // For now, this provides a basic "please login" state if somehow reached.
//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4" dir="rtl">
//             <Wine className="h-12 w-12 text-amber-500 mb-4" />
//             <h1 className="text-3xl font-bold mb-2 text-gray-700">אוסף הוויסקי</h1>
//             <p className="text-gray-600 mb-6">אנא התחבר כדי להמשיך.</p>
//             <Button onClick={loginUser} size="lg">
//                 <LogIn className="ml-2 h-5 w-5" />
//                 התחברות
//             </Button>
//         </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-100" dir="rtl">
//       {/* Desktop Sidebar */}
//       <aside className="hidden md:flex md:flex-shrink-0">
//         <div className="flex flex-col w-64 bg-gray-800">
//           <div className="flex items-center justify-center h-16 bg-gray-900">
//             <Link to={createPageUrl("Dashboard")} className="flex items-center">
//               <Wine className="h-8 w-8 text-amber-400" />
//               <span className="ml-2 text-white text-lg font-semibold">אוסף הוויסקי</span>
//             </Link>
//           </div>
//           <div className="flex-1 flex flex-col overflow-y-auto">
//             {sidebarContent}
//           </div>
//            <div className="p-2 border-t border-gray-700">
//               <NavLink to={createPageUrl("Profile")} icon={Settings} label="הגדרות ופרופיל" onClick={() => setMobileMenuOpen(false)} currentPageName={currentPageName} pageName="Profile"/>
//            </div>
//         </div>
//       </aside>

//       {/* Mobile Sidebar (Sheet) */}
//        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
//         <SheetContent side="right" className="w-64 bg-gray-800 p-0 text-white md:hidden">
//            <div className="flex items-center justify-between h-16 bg-gray-900 px-4">
//             <Link to={createPageUrl("Dashboard")} className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
//               <Wine className="h-8 w-8 text-amber-400" />
//               <span className="ml-2 text-white text-lg font-semibold">אוסף הוויסקי</span>
//             </Link>
//             <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-amber-400">
//               <X className="h-6 w-6" />
//             </Button>
//           </div>
//           <div className="py-4">
//             {sidebarContent}
//           </div>
//           <div className="p-2 border-t border-gray-700">
//              <NavLink to={createPageUrl("Profile")} icon={Settings} label="הגדרות ופרופיל" onClick={() => setMobileMenuOpen(false)} currentPageName={currentPageName} pageName="Profile"/>
//           </div>
//         </SheetContent>
//       </Sheet>

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <header className="bg-white shadow-sm">
//           <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8"> {/* Changed max-w-7xl to full for wider header */}
//             <div className="flex items-center justify-between h-16">
//               <div className="flex items-center">
//                 <SheetTrigger asChild className="md:hidden mr-2">
//                    <Button variant="ghost" size="icon">
//                     <Menu className="h-6 w-6" />
//                   </Button>
//                 </SheetTrigger>
//                  <h1 className="text-xl font-semibold text-gray-800">{currentPageName || "דף"}</h1>
//               </div>
//               <div className="flex items-center">
//                 {isAuthenticated && user ? (
//                     <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" className="relative h-10 w-10 rounded-full">
//                         <Avatar className="h-9 w-9">
//                             <AvatarImage src={user?.profile_image_url} alt={user?.full_name || user?.email} />
//                             <AvatarFallback>{userInitial}</AvatarFallback>
//                         </Avatar>
//                         </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent className="w-56" align="end" forceMount>
//                         <DropdownMenuLabel className="font-normal">
//                         <div className="flex flex-col space-y-1">
//                             <p className="text-sm font-medium leading-none">{user?.full_name || "משתמש"}</p>
//                             <p className="text-xs leading-none text-muted-foreground">
//                             {user?.email}
//                             </p>
//                         </div>
//                         </DropdownMenuLabel>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem onSelect={() => window.location.href = createPageUrl('Profile')}>
//                             <UserIcon className="ml-2 h-4 w-4" />
//                             <span>פרופיל</span>
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onSelect={() => window.location.href = createPageUrl('SettingsPageName')}> {/* Replace with actual settings page name */}
//                             <Settings className="ml-2 h-4 w-4" />
//                             <span>הגדרות</span>
//                         </DropdownMenuItem>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem onSelect={logoutUser}>
//                             <LogOut className="ml-2 h-4 w-4" />
//                             <span>התנתקות</span>
//                         </DropdownMenuItem>
//                     </DropdownMenuContent>
//                     </DropdownMenu>
//                 ) : (
//                   <Button onClick={loginUser}>
//                     <LogIn className="ml-2 h-5 w-5" /> התחברות
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </header>
//         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// // The final export must be the Layout component wrapped with AuthProvider
// export default function WrappedLayout({ children, currentPageName }) {
//   return (
//     <AuthProvider>
//       <AppLayout currentPageName={currentPageName}>
//         {children}
//       </AppLayout>
//     </AuthProvider>
//   );
// }
