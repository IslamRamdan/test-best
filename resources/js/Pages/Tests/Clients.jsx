import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowRight,
    CalendarDays,
    Clock,
    MapPin,
    Search,
    Users,
    User,
    X,
    ClipboardList,
    CheckCircle2,
    AlertCircle,
    XCircle,
    FileText,
    Trash2,
    Edit3,
    MoreVertical,
    Landmark,
    Building2,
} from "lucide-react";

export default function Clients({
    auth,
    test,
    clients,
    filters = {},
    flash,
    stats,
}) {
    const search = filters.search || "";

    // حالة التحكم في نافذة التقييم
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);

    // قايمة الإجراءات المنسدلة
    const MENU_WIDTH = 192;
    const ITEM_HEIGHT = 40;
    const [menu, setMenu] = useState(null); // { client, top, left }
    const menuRef = useRef(null);

    const toggleMenu = (e, client) => {
        if (menu?.client.id === client.id) {
            setMenu(null);
            return;
        }
        const r = e.currentTarget.getBoundingClientRect();
        // عدد العناصر: 2 عادي، 4 لو العميل مقبول (عقد الوزارة + عقد الشركة)
        const itemsCount = client.pivot?.evaluation === "مقبول" ? 4 : 2;
        const MENU_HEIGHT = itemsCount * ITEM_HEIGHT + 14;
        const openUp = window.innerHeight - r.bottom < MENU_HEIGHT + 12;
        setMenu({
            client,
            top: openUp ? r.top - MENU_HEIGHT - 4 : r.bottom + 4,
            left: Math.max(8, r.right - MENU_WIDTH),
        });
    };

    useEffect(() => {
        if (!menu) return;

        const close = () => setMenu(null);

        const onClickOutside = (e) => {
            if (
                menuRef.current?.contains(e.target) ||
                e.target.closest("[data-menu-btn]")
            )
                return;
            close();
        };

        const onKey = (e) => e.key === "Escape" && close();

        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onKey);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);

        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [menu]);

    const { data, setData, patch, processing, errors, reset } = useForm({
        evaluation: "",
        notes: "",
    });

    // إحصائيات التقييم: لو الباك اند باعت stats هنستخدمها، لو لأ هنحسبها من الصفحة الحالية (fallback)
    const evaluationStats =
        stats ||
        (clients?.data || []).reduce(
            (acc, client) => {
                const ev = client.pivot?.evaluation;
                if (ev === "مقبول") acc.accepted++;
                else if (ev === "احتياطي") acc.reserve++;
                else if (ev === "راسب") acc.failed++;
                return acc;
            },
            { accepted: 0, reserve: 0, failed: 0 },
        );

    const handleSearch = (e) => {
        router.get(
            route("tests.clients", test.id),
            {
                search: e.target.value,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const clearSearch = () => {
        router.get(
            route("tests.clients", test.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const formatDate = (date) => {
        if (!date) return "-";
        const value = String(date).split("T")[0];
        const [year, month, day] = value.split("-");
        if (!year || !month || !day) return date;
        return `${day}-${month}-${year}`;
    };

    const formatTime = (time) => {
        if (!time) return "-";
        return String(time).substring(0, 5);
    };

    const getEvaluationStyle = (evaluation) => {
        switch (evaluation) {
            case "مقبول":
                return {
                    className:
                        "bg-emerald-50 text-emerald-700 border-emerald-200",
                    icon: CheckCircle2,
                };
            case "احتياطي":
                return {
                    className: "bg-amber-50 text-amber-700 border-amber-200",
                    icon: AlertCircle,
                };
            case "راسب":
                return {
                    className: "bg-red-50 text-red-700 border-red-200",
                    icon: XCircle,
                };
            default:
                return {
                    className: "bg-gray-50 text-gray-500 border-gray-200",
                    icon: Clock,
                };
        }
    };

    // فتح نافذة التقييم
    const openEvaluationModal = (client) => {
        setSelectedClient(client);
        setData({
            evaluation: client.pivot?.evaluation || "",
            notes: client.pivot?.notes || "",
        });
        setIsEvaluationModalOpen(true);
    };

    const closeEvaluationModal = () => {
        setIsEvaluationModalOpen(false);
        setSelectedClient(null);
        reset();
    };

    // إرسال التقييم
    const handleUpdateEvaluation = (e) => {
        e.preventDefault();
        if (!selectedClient) return;

        patch(
            route("tests.clients.update-evaluation", [
                test.id,
                selectedClient.id,
            ]),
            {
                preserveScroll: true,
                onSuccess: () => closeEvaluationModal(),
            },
        );
    };

    // حذف العميل من الاختبار
    const handleDeleteClient = (client) => {
        if (
            confirm(
                `هل أنت تأكد من إزالة العميل "${client.name}" من هذا الاختبار؟`,
            )
        ) {
            router.delete(
                route("tests.clients.destroy", [test.id, client.id]),
                {
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`عملاء اختبار ${test?.name || ""}`} />

            <div className="py-6 font-sans text-slate-900" dir="rtl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-teal-light">
                                    <ClipboardList className="h-7 w-7 text-brand-teal" />
                                </div>

                                <div>
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-black text-slate-900">
                                            {test?.name}
                                        </h1>

                                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                            اختبار #{test?.id}
                                        </span>
                                    </div>

                                    <p className="text-sm font-semibold text-slate-500">
                                        العملاء المسجلون داخل هذا الاختبار
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={route(
                                        "tests.clients.create",
                                        test.id,
                                    )}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 4v16m8-8H4"
                                        />
                                    </svg>
                                    <span>إضافة عميل جديد</span>
                                </Link>
                                <Link
                                    href={route("tests.evaluations", {
                                        test: test?.id,
                                    })}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <svg
                                        className="w-5 h-5 ml-2 -mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                        />
                                    </svg>
                                    وضع التقييمات
                                </Link>

                                <Link
                                    href={route("tests.index")}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    <ArrowRight className="h-5 w-5" />
                                    العودة للاختبارات
                                </Link>
                            </div>
                        </div>

                        {/* Test Info */}
                        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400">
                                        التاريخ
                                    </p>
                                    <p className="mt-0.5 text-sm font-black text-slate-700">
                                        {formatDate(test?.test_date)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400">
                                        الوقت
                                    </p>
                                    <p className="mt-0.5 text-sm font-black text-slate-700">
                                        {formatTime(test?.test_time)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-slate-400">
                                        المكان
                                    </p>
                                    <p className="mt-0.5 truncate text-sm font-black text-slate-700">
                                        {test?.location || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 rounded-2xl bg-brand-teal-light p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-teal">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-500">
                                        عدد العملاء
                                    </p>
                                    <p className="mt-0.5 text-sm font-black text-brand-teal">
                                        {clients?.total || 0} عميل
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* إحصائيات التقييم */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-600">
                                    مقبول
                                </p>
                                <p className="mt-0.5 text-2xl font-black text-emerald-700">
                                    {evaluationStats.accepted}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-amber-600">
                                    احتياطي
                                </p>
                                <p className="mt-0.5 text-2xl font-black text-amber-700">
                                    {evaluationStats.reserve}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-3xl border border-red-200 bg-red-50 p-5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-red-600">
                                    راسب
                                </p>
                                <p className="mt-0.5 text-2xl font-black text-red-700">
                                    {evaluationStats.failed}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {/* Search */}
                    <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-base font-black text-slate-900">
                                    قائمة العملاء
                                </h2>
                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                    يمكنك البحث بالاسم أو الهاتف أو الرقم القومي
                                    أو كود العميل
                                </p>
                            </div>

                            <div className="relative w-full md:max-w-md">
                                <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="ابحث عن عميل..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-10 text-sm font-semibold outline-none transition focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/10"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-right">
                                <thead className="border-b border-slate-100 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-4 text-xs font-black text-slate-500">
                                            الكود
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black text-slate-500">
                                            العميل
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black text-slate-500">
                                            الهاتف
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black text-slate-500">
                                            المحافظة
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black text-slate-500">
                                            التقييم
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black text-slate-500">
                                            الملاحظات
                                        </th>
                                        <th className="px-5 py-4 text-center text-xs font-black text-slate-500">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {clients?.data?.length > 0 ? (
                                        clients.data.map((client) => {
                                            const evaluation =
                                                getEvaluationStyle(
                                                    client.pivot?.evaluation,
                                                );
                                            const EvaluationIcon =
                                                evaluation.icon;

                                            return (
                                                <tr
                                                    key={client.id}
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    {/* Code */}
                                                    <td className="px-5 py-5">
                                                        <span className="inline-flex min-w-[55px] items-center justify-center rounded-xl bg-brand-teal-light px-3 py-2 text-sm font-black text-brand-teal">
                                                            {client.pivot
                                                                ?.code || "-"}
                                                        </span>
                                                    </td>

                                                    {/* Client */}
                                                    <td className="px-5 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                                                {client.personal_photo_url ? (
                                                                    <img
                                                                        src={
                                                                            client.personal_photo_url
                                                                        }
                                                                        alt={
                                                                            client.name
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                                        <User className="h-6 w-6" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <Link
                                                                    href={route(
                                                                        "clients.edit",
                                                                        client.id,
                                                                    )}
                                                                    className="truncate text-sm font-black text-slate-800 hover:text-brand-teal hover:underline transition"
                                                                >
                                                                    {
                                                                        client.name
                                                                    }
                                                                </Link>
                                                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                                                    عميل #
                                                                    {client.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Phone */}
                                                    <td className="px-5 py-5">
                                                        <span className="text-sm font-bold text-slate-700">
                                                            {client.phone ||
                                                                "-"}
                                                        </span>
                                                    </td>

                                                    {/* Governorate */}
                                                    <td className="px-5 py-5">
                                                        <span className="text-sm font-semibold text-slate-600">
                                                            {client.governorate ||
                                                                "-"}
                                                        </span>
                                                    </td>

                                                    {/* Evaluation */}
                                                    <td className="px-5 py-5">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black ${evaluation.className}`}
                                                        >
                                                            <EvaluationIcon className="h-4 w-4" />
                                                            {client.pivot
                                                                ?.evaluation ||
                                                                "لم يتم التقييم"}
                                                        </span>
                                                    </td>

                                                    {/* Notes */}
                                                    <td className="px-5 py-5">
                                                        <div className="flex max-w-[220px] items-start gap-2 text-sm font-semibold text-slate-500">
                                                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                            <span className="line-clamp-2">
                                                                {client.pivot
                                                                    ?.notes ||
                                                                    "لا توجد ملاحظات"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-5 text-center">
                                                        <button
                                                            type="button"
                                                            data-menu-btn
                                                            onClick={(e) =>
                                                                toggleMenu(
                                                                    e,
                                                                    client,
                                                                )
                                                            }
                                                            title="الإجراءات"
                                                            aria-haspopup="menu"
                                                            aria-expanded={
                                                                menu?.client
                                                                    .id ===
                                                                client.id
                                                            }
                                                            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition ${
                                                                menu?.client
                                                                    .id ===
                                                                client.id
                                                                    ? "bg-slate-200 text-slate-800"
                                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                            }`}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-20 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50">
                                                        <Users className="h-10 w-10 text-slate-300" />
                                                    </div>
                                                    <h3 className="text-lg font-black text-slate-700">
                                                        {search
                                                            ? "لا توجد نتائج"
                                                            : "لا يوجد عملاء داخل الاختبار"}
                                                    </h3>
                                                    <p className="mt-2 max-w-md text-sm font-semibold text-slate-400">
                                                        {search
                                                            ? "لم نجد أي عميل مطابق لبيانات البحث."
                                                            : "لم يتم إضافة أي عملاء إلى هذا الاختبار حتى الآن."}
                                                    </p>
                                                    {search && (
                                                        <button
                                                            type="button"
                                                            onClick={
                                                                clearSearch
                                                            }
                                                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-teal px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            مسح البحث
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {clients?.links && clients.links.length > 3 && (
                            <div className="flex flex-wrap justify-center gap-2 border-t border-slate-100 px-6 py-5">
                                {clients.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || "#"}
                                        preserveScroll
                                        className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                                            link.active
                                                ? "bg-brand-teal text-white shadow-sm"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                        } ${!link.url ? "pointer-events-none opacity-40" : ""}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* قايمة الإجراءات */}
            {menu &&
                createPortal(
                    <div
                        ref={menuRef}
                        dir="rtl"
                        role="menu"
                        style={{
                            position: "fixed",
                            top: menu.top,
                            left: menu.left,
                            width: MENU_WIDTH,
                        }}
                        className="z-[60] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
                    >
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                const c = menu.client;
                                setMenu(null);
                                openEvaluationModal(c);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Edit3 className="h-4 w-4" />
                            تعديل التقييم
                        </button>

                        {menu.client.pivot?.evaluation === "مقبول" && (
                            <>
                                <Link
                                    href={route(
                                        "contracts.ministry",
                                        menu.client.id,
                                    )}
                                    target="_blank"
                                    role="menuitem"
                                    onClick={() => setMenu(null)}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Landmark className="h-4 w-4 text-emerald-600" />
                                    عقد الوزارة
                                </Link>

                                <Link
                                    href={route(
                                        "contracts.company",
                                        menu.client.id,
                                    )}
                                    target="_blank"
                                    role="menuitem"
                                    onClick={() => setMenu(null)}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Building2 className="h-4 w-4 text-indigo-600" />
                                    عقد الشركة
                                </Link>
                            </>
                        )}

                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                const c = menu.client;
                                setMenu(null);
                                handleDeleteClient(c);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-right text-sm font-bold text-red-600 transition hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            حذف من الاختبار
                        </button>
                    </div>,
                    document.body,
                )}

            {/* Modal التقييم والملاحظات */}
            {isEvaluationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl transition-all">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-black text-slate-900">
                                تقييم العميل: {selectedClient?.name}
                            </h3>
                            <button
                                type="button"
                                onClick={closeEvaluationModal}
                                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleUpdateEvaluation}
                            className="mt-5 space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2">
                                    التقييم
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData("evaluation", "مقبول")
                                        }
                                        className={`rounded-2xl border-2 px-3 py-3 text-sm font-black transition ${
                                            data.evaluation === "مقبول"
                                                ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200"
                                                : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-100"
                                        }`}
                                    >
                                        مقبول
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData("evaluation", "احتياطي")
                                        }
                                        className={`rounded-2xl border-2 px-3 py-3 text-sm font-black transition ${
                                            data.evaluation === "احتياطي"
                                                ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200"
                                                : "border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-400 hover:bg-amber-100"
                                        }`}
                                    >
                                        احتياطي
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData("evaluation", "راسب")
                                        }
                                        className={`rounded-2xl border-2 px-3 py-3 text-sm font-black transition ${
                                            data.evaluation === "راسب"
                                                ? "border-red-500 bg-red-500 text-white shadow-md shadow-red-200"
                                                : "border-red-200 bg-red-50 text-red-600 hover:border-red-400 hover:bg-red-100"
                                        }`}
                                    >
                                        راسب
                                    </button>
                                </div>
                                {errors.evaluation && (
                                    <p className="mt-1 text-xs font-semibold text-red-500">
                                        {errors.evaluation}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700">
                                    الملاحظات
                                </label>
                                <textarea
                                    rows="4"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData("notes", e.target.value)
                                    }
                                    placeholder="اكتب ملاحظات التقييم هنا..."
                                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold outline-none transition focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/10"
                                ></textarea>
                                {errors.notes && (
                                    <p className="mt-1 text-xs font-semibold text-red-500">
                                        {errors.notes}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEvaluationModal}
                                    className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-2xl bg-brand-teal px-5 py-2.5 text-sm font-black text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    حفظ التغييرات
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
