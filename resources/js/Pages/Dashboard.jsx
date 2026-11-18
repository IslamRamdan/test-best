import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import {
    Building2,
    Users,
    CheckCircle2,
    UserPlus,
    FileSpreadsheet,
    ShieldCheck,
    ArrowUpLeft,
    CalendarDays,
    MapPin,
    Clock,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Dashboard({ tests = [] }) {
    const { auth } = usePage().props;

    const user = auth.user;

    /*
    |--------------------------------------------------------------------------
    | Statistics
    |--------------------------------------------------------------------------
    */

    const totalTests = tests.length;

    const totalClients = tests.reduce(
        (total, test) => total + Number(test.clients_count || 0),
        0,
    );

    /*
    |--------------------------------------------------------------------------
    | Accepted Clients
    |--------------------------------------------------------------------------
    |
    | إذا كان الـ Dashboard يرجع clients مع الاختبارات
    | سيتم حساب المقبولين.
    |
    */

    const acceptedClients = tests.reduce((total, test) => {
        const accepted = (test.clients || []).filter(
            (client) => client.pivot?.evaluation === "مقبول",
        ).length;

        return total + accepted;
    }, 0);

    const stats = [
        {
            title: "إجمالي العملاء",
            value: totalClients,
            icon: Users,
            color: "text-brand-teal",
            bgColor: "bg-brand-teal-light",
        },
        {
            title: "إجمالي الاختبارات",
            value: totalTests,
            icon: ClipboardList,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "العملاء المقبولين",
            value: acceptedClients,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Format Date
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) return "-";

        const value = String(date).split("T")[0];

        const [year, month, day] = value.split("-");

        if (!year || !month || !day) {
            return date;
        }

        return `${day}-${month}-${year}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Format Time
    |--------------------------------------------------------------------------
    */

    const formatTime = (time) => {
        if (!time) return "-";

        const value = String(time).substring(0, 5);

        const [hours, minutes] = value.split(":");

        if (!hours || !minutes) {
            return value;
        }

        let hour = Number(hours);

        const period = hour >= 12 ? "م" : "ص";

        hour = hour % 12;

        if (hour === 0) {
            hour = 12;
        }

        return `${hour}:${minutes} ${period}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="لوحة التحكم — تيست البيست" />

            <div className="min-h-full py-8 font-sans text-slate-900" dir="rtl">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* =====================================================
                        TITLE
                    ====================================================== */}

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">
                                لوحة التحكم
                            </h2>

                            <p className="text-xs font-semibold text-slate-500">
                                مرحباً بك مجدداً، {user?.name || "المسؤول"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs">
                                <Building2 className="h-4 w-4 text-brand-teal" />

                                <span>{user?.company?.name || "المنشأة"}</span>
                            </span>
                        </div>
                    </div>

                    {/* =====================================================
                        BANNER
                    ====================================================== */}

                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-teal-light via-white to-brand-purple-light p-6 shadow-xs sm:p-8">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-brand-teal/5" />

                        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/80 px-3 py-1 text-xs font-bold text-brand-teal shadow-xs">
                                    <ShieldCheck className="h-4 w-4" />

                                    <span>نظام إدارة السائقين للحج</span>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
                                    أهلاً بك في منصة{" "}
                                    <span className="text-brand-teal">
                                        تيست البيست
                                    </span>
                                </h3>

                                <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">
                                    يمكنك متابعة الاختبارات والعملاء المسجلين
                                    بكل سهولة من لوحة التحكم.
                                </p>
                            </div>

                            <Link
                                href={route("clients.create")}
                                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(0,122,120,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95"
                            >
                                <UserPlus className="h-4 w-4" />

                                <span>إضافة عميل جديد</span>
                            </Link>
                        </div>
                    </div>

                    {/* =====================================================
                        STATS
                    ====================================================== */}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:border-slate-300"
                                >
                                    <div className="space-y-1">
                                        <p className="text-xs font-extrabold text-slate-500">
                                            {stat.title}
                                        </p>

                                        <p className="text-3xl font-black text-slate-900">
                                            {stat.value}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bgColor} ${stat.color}`}
                                    >
                                        <Icon className="h-6 w-6" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* =====================================================
                        TESTS SWIPER
                    ====================================================== */}

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                        {/* Header */}

                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                                    <ClipboardList className="h-5 w-5 text-blue-600" />
                                </div>

                                <div>
                                    <h4 className="text-lg font-extrabold text-slate-900">
                                        الاختبارات
                                    </h4>

                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                        اضغط على الاختبار لعرض جميع العملاء
                                    </p>
                                </div>
                            </div>

                            {/* Navigation */}

                            <div className="hidden items-center gap-2 sm:flex">
                                <button
                                    type="button"
                                    className="test-swiper-prev flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-brand-teal hover:bg-brand-teal-light hover:text-brand-teal"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>

                                <button
                                    type="button"
                                    className="test-swiper-next flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-brand-teal hover:bg-brand-teal-light hover:text-brand-teal"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Tests */}

                        {tests.length > 0 ? (
                            <Swiper
                                modules={[Navigation, Pagination]}
                                navigation={{
                                    nextEl: ".test-swiper-next",
                                    prevEl: ".test-swiper-prev",
                                }}
                                pagination={{
                                    clickable: true,
                                }}
                                spaceBetween={18}
                                slidesPerView={1}
                                breakpoints={{
                                    640: {
                                        slidesPerView: 2,
                                    },
                                    1024: {
                                        slidesPerView: 3,
                                    },
                                }}
                                className="tests-swiper !pb-10"
                            >
                                {tests.map((test) => (
                                    <SwiperSlide key={test.id}>
                                        <Link
                                            href={route(
                                                "tests.clients",
                                                test.id,
                                            )}
                                            className="group block w-full rounded-2xl border border-slate-200 bg-slate-50 p-5 text-right transition-all duration-200 hover:-translate-y-1 hover:border-brand-teal/30 hover:bg-white hover:shadow-lg"
                                        >
                                            {/* Top */}

                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-brand-teal-light group-hover:text-brand-teal">
                                                        <ClipboardList className="h-5 w-5" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h5 className="truncate text-sm font-black text-slate-800">
                                                            {test.name}
                                                        </h5>

                                                        <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                                            اختبار #{test.id}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Number */}

                                                <div className="flex shrink-0 flex-col items-center rounded-xl bg-brand-teal-light px-3 py-2">
                                                    <span className="text-lg font-black text-brand-teal">
                                                        {test.clients_count ||
                                                            0}
                                                    </span>

                                                    <span className="text-[9px] font-bold text-brand-teal">
                                                        عميل
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Info */}

                                            <div className="mt-5 space-y-2.5 border-t border-slate-200 pt-4">
                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                                    <CalendarDays className="h-4 w-4 text-blue-500" />

                                                    <span>
                                                        {formatDate(
                                                            test.test_date,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                                    <Clock className="h-4 w-4 text-emerald-500" />

                                                    <span>
                                                        {formatTime(
                                                            test.test_time,
                                                        )}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                                    <MapPin className="h-4 w-4 text-rose-500" />

                                                    <span className="truncate">
                                                        {test.location}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bottom */}

                                            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                                                <span className="text-[11px] font-bold text-slate-400">
                                                    عرض جميع العملاء
                                                </span>

                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition group-hover:bg-brand-teal group-hover:text-white">
                                                    <ArrowUpLeft className="h-4 w-4" />
                                                </span>
                                            </div>
                                        </Link>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        ) : (
                            /* Empty */

                            <div className="flex flex-col items-center justify-center py-14 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                    <ClipboardList className="h-8 w-8" />
                                </div>

                                <h5 className="text-base font-extrabold text-slate-800">
                                    لا توجد اختبارات
                                </h5>

                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                    قم بإضافة اختبار لعرضه هنا
                                </p>

                                <Link
                                    href={route("tests.create")}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-xs font-bold text-white transition hover:opacity-90"
                                >
                                    <ClipboardList className="h-4 w-4" />
                                    إضافة اختبار
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* =====================================================
                        LATEST TESTS + QUICK ACTIONS
                    ====================================================== */}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Latest Tests */}

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 lg:col-span-2">
                            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                                <h4 className="text-lg font-extrabold text-slate-900">
                                    أحدث الاختبارات
                                </h4>

                                <Link
                                    href={route("tests.index")}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:underline"
                                >
                                    <span>عرض الكل</span>

                                    <ArrowUpLeft className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            {tests.length > 0 ? (
                                <div className="space-y-3">
                                    {tests.slice(0, 5).map((test) => (
                                        <Link
                                            href={route(
                                                "tests.clients",
                                                test.id,
                                            )}
                                            key={test.id}
                                            className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-right transition hover:border-brand-teal/20 hover:bg-white hover:shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                    <ClipboardList className="h-5 w-5" />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-black text-slate-800">
                                                        {test.name}
                                                    </p>

                                                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                                                        {formatDate(
                                                            test.test_date,
                                                        )}

                                                        {" • "}

                                                        {formatTime(
                                                            test.test_time,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="rounded-xl bg-brand-teal-light px-3 py-2 text-xs font-black text-brand-teal">
                                                    {test.clients_count || 0}{" "}
                                                    عميل
                                                </span>

                                                <ArrowUpLeft className="h-4 w-4 text-slate-400" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Users className="mb-3 h-8 w-8 text-slate-300" />

                                    <p className="text-sm font-bold text-slate-500">
                                        لا توجد بيانات حالياً
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            QUICK ACTIONS
                        ================================================== */}

                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                                <h4 className="mb-4 text-base font-extrabold text-slate-900">
                                    إجراءات سريعة
                                </h4>

                                <div className="space-y-3">
                                    <Link
                                        href={route("clients.index")}
                                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-right text-xs font-extrabold text-slate-700 transition-all hover:border-brand-teal hover:bg-white hover:text-brand-teal"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <Users className="h-4 w-4 text-brand-teal" />

                                            <span>إدارة العملاء</span>
                                        </span>

                                        <ArrowUpLeft className="h-4 w-4 text-slate-400" />
                                    </Link>

                                    <Link
                                        href={route("tests.index")}
                                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-right text-xs font-extrabold text-slate-700 transition-all hover:border-brand-teal hover:bg-white hover:text-brand-teal"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <ClipboardList className="h-4 w-4 text-blue-600" />

                                            <span>إدارة الاختبارات</span>
                                        </span>

                                        <ArrowUpLeft className="h-4 w-4 text-slate-400" />
                                    </Link>

                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-right text-xs font-extrabold text-slate-700 transition-all hover:border-brand-teal hover:bg-white hover:text-brand-teal"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />

                                            <span>استيراد من Excel</span>
                                        </span>

                                        <ArrowUpLeft className="h-4 w-4 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
