import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Users,
    Building2,
    FileSpreadsheet,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    UserCheck,
    FileText,
} from "lucide-react";

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // عناصر القائمة الجانبية
    const navItems = [
        {
            name: "لوحة التحكم",
            href: route("dashboard"),
            icon: LayoutDashboard,
            active: route().current("dashboard"),
        },
        {
            name: "إدارة السائقين",
            href: "/clients",
            icon: Users,
            active: false,
            badge: "جديد",
        },
        {
            name: "إدارة الاختبارات",
            href: route("tests.index"),
            icon: UserCheck,
            active: false,
        },
        {
            name: "المناديب",
            href: route("delegates.index"),
            icon: Building2,
            active: false,
        },
        {
            name: "بيانات المنشأة",
            href: "/company/dashboard",
            icon: Building2,
            active: false,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
            {/* OVERLAY FOR MOBILE */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed top-0 bottom-0 right-0 z-50 flex flex-col border-l border-slate-200/70 bg-white shadow-xl shadow-slate-900/5 transition-all duration-300 ease-in-out ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "translate-x-full lg:translate-x-0"
                } ${isCollapsed ? "w-20" : "w-64"}`}
            >
                {/* BRAND HEADER */}
                <div
                    className={`relative flex h-16 shrink-0 items-center border-b border-slate-100 px-3 ${
                        isCollapsed ? "justify-center" : "justify-between"
                    }`}
                >
                    {/* LINK & LOGO */}
                    <Link href="/" className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal to-brand-teal/80 text-white shadow-md shadow-brand-teal/25 ring-1 ring-black/5 overflow-hidden">
                            <img
                                src="/logo.jpg"
                                alt="تيست البيست"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-base font-black leading-none text-slate-900 truncate">
                                    تيست{" "}
                                    <span className="text-brand-teal">
                                        البيست
                                    </span>
                                </span>
                                <span className="mt-1.5 text-[10px] font-bold tracking-wide text-slate-400 truncate">
                                    إدارة السائقين
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* DESKTOP COLLAPSE TOGGLE */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`hidden items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-all duration-200 hover:text-brand-teal hover:border-brand-teal/30 lg:flex ${
                            isCollapsed
                                ? "absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2"
                                : "h-7 w-7"
                        }`}
                        title={isCollapsed ? "توسيع" : "طي"}
                    >
                        <ChevronLeft
                            className={`h-3.5 w-3.5 transition-transform duration-300 ${
                                isCollapsed ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {/* MOBILE CLOSE BUTTON */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* NAVIGATION LINKS */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-150 ${
                                    item.active
                                        ? "bg-brand-teal-light text-brand-teal"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                } ${isCollapsed ? "justify-center" : ""}`}
                                title={isCollapsed ? item.name : undefined}
                            >
                                {item.active && (
                                    <span className="absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-teal" />
                                )}

                                <Icon
                                    className={`h-5 w-5 shrink-0 transition-colors ${
                                        item.active
                                            ? "text-brand-teal"
                                            : "text-slate-400 group-hover:text-slate-600"
                                    }`}
                                />
                                {!isCollapsed && (
                                    <div className="flex flex-1 items-center justify-between min-w-0">
                                        <span className="truncate">
                                            {item.name}
                                        </span>
                                        {item.badge && (
                                            <span className="rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-extrabold text-brand-teal">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* USER PROFILE & LOGOUT */}
                <div className="border-t border-slate-100 p-3">
                    <div
                        className={`flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-200/60 ${
                            isCollapsed ? "justify-center" : ""
                        }`}
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-black text-slate-700">
                            <img
                                src="/logo.jpg"
                                alt="تيست البيست"
                                className="h-full w-full rounded-2xl object-cover"
                            />
                        </div>

                        {!isCollapsed && (
                            <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-xs font-extrabold text-slate-900">
                                    {user.name}
                                </span>
                                <span className="truncate text-[10px] font-semibold text-slate-400">
                                    {user.email}
                                </span>
                            </div>
                        )}

                        {!isCollapsed && (
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                title="تسجيل الخروج"
                            >
                                <LogOut className="h-4 w-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div
                className={`flex flex-col transition-all duration-300 ${
                    isCollapsed ? "lg:mr-20" : "lg:mr-64"
                }`}
            >
                {/* TOP MOBILE BAR */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm lg:hidden">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-black text-slate-900">
                            تيست البيست
                        </span>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal/10 text-xs font-bold text-brand-teal">
                        {user.name.charAt(0)}
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
