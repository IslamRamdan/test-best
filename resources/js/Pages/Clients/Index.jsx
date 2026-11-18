import React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import {
    Plus,
    Search,
    Trash2,
    Edit,
    Eye,
    User,
    Users,
    Briefcase,
    MapPin,
    CreditCard,
    Phone,
    Hash,
    ChevronDown,
    ClipboardList,
    X,
    Check,
    Loader2,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Test Select Component
|--------------------------------------------------------------------------
*/

function TestSelect({ tests, selectedTest, setSelectedTest }) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const selectRef = React.useRef(null);
    const searchInputRef = React.useRef(null);

    /*
    |--------------------------------------------------------------------------
    | Close when click outside
    |--------------------------------------------------------------------------
    */

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Open Select
    |--------------------------------------------------------------------------
    */

    const handleOpen = () => {
        setOpen((prev) => !prev);

        setTimeout(() => {
            searchInputRef.current?.focus();
        }, 100);
    };

    /*
    |--------------------------------------------------------------------------
    | Selected Test
    |--------------------------------------------------------------------------
    */

    const selectedTestData = tests.find(
        (test) => String(test.id) === String(selectedTest),
    );

    /*
    |--------------------------------------------------------------------------
    | Filter Tests
    |--------------------------------------------------------------------------
    */

    const filteredTests = tests.filter((test) => {
        const value = search.toLowerCase().trim();

        if (!value) {
            return true;
        }

        return (
            String(test.name || "")
                .toLowerCase()
                .includes(value) ||
            String(test.location || "")
                .toLowerCase()
                .includes(value)
        );
    });

    /*
    |--------------------------------------------------------------------------
    | Format Date
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) return "";

        const cleanDate = String(date).split("T")[0];
        const parts = cleanDate.split("-");

        if (parts.length !== 3) {
            return date;
        }

        const [year, month, day] = parts;

        const months = [
            "يناير",
            "فبراير",
            "مارس",
            "أبريل",
            "مايو",
            "يونيو",
            "يوليو",
            "أغسطس",
            "سبتمبر",
            "أكتوبر",
            "نوفمبر",
            "ديسمبر",
        ];

        const monthName = months[Number(month) - 1];

        return monthName
            ? `${Number(day)} ${monthName} ${year}`
            : `${day}/${month}/${year}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Format Time
    |--------------------------------------------------------------------------
    */

    const formatTime = (time) => {
        if (!time) return "";

        const cleanTime = String(time).substring(0, 5);
        const parts = cleanTime.split(":");

        if (parts.length < 2) {
            return time;
        }

        let hour = Number(parts[0]);
        const minute = parts[1];

        const period = hour >= 12 ? "م" : "ص";

        hour = hour % 12;

        if (hour === 0) {
            hour = 12;
        }

        return `${hour}:${minute} ${period}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Select Test
    |--------------------------------------------------------------------------
    */

    const handleSelect = (test) => {
        setSelectedTest(String(test.id));
        setOpen(false);
        setSearch("");
    };

    return (
        <div ref={selectRef} className="relative">
            {/* Select Button */}

            <button
                type="button"
                onClick={handleOpen}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border bg-white px-5 py-4 text-right transition-all ${
                    open
                        ? "border-teal-500 ring-4 ring-teal-500/10"
                        : "border-slate-200 hover:border-teal-300"
                }`}
            >
                <div className="flex min-w-0 items-center gap-4">
                    {/* Icon */}

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                        <ClipboardList className="h-5 w-5" />
                    </div>

                    {/* Selected Test */}

                    {selectedTestData ? (
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-800">
                                {selectedTestData.name}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                {selectedTestData.test_date && (
                                    <span>
                                        {formatDate(selectedTestData.test_date)}
                                    </span>
                                )}

                                {selectedTestData.test_time && (
                                    <span>
                                        {formatTime(selectedTestData.test_time)}
                                    </span>
                                )}

                                {selectedTestData.location && (
                                    <span className="truncate">
                                        {selectedTestData.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm font-bold text-slate-500">
                                اختر الاختبار
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                اضغط للبحث واختيار الاختبار
                            </p>
                        </div>
                    )}
                </div>

                <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                        open ? "rotate-180 text-teal-600" : ""
                    }`}
                />
            </button>

            {/* Dropdown */}

            {open && (
                <div className="absolute right-0 top-full z-[120] mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    {/* Search */}

                    <div className="border-b border-slate-100 bg-slate-50/70 p-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث عن الاختبار..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                            />
                        </div>
                    </div>

                    {/* Tests */}

                    <div className="max-h-[330px] overflow-y-auto p-2">
                        {filteredTests.length > 0 ? (
                            filteredTests.map((test) => {
                                const isSelected =
                                    String(test.id) === String(selectedTest);

                                return (
                                    <button
                                        key={test.id}
                                        type="button"
                                        onClick={() => handleSelect(test)}
                                        className={`flex w-full items-center gap-3 rounded-xl p-3 text-right transition-all ${
                                            isSelected
                                                ? "bg-teal-50"
                                                : "hover:bg-slate-50"
                                        }`}
                                    >
                                        {/* Icon */}

                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                isSelected
                                                    ? "bg-teal-100 text-teal-600"
                                                    : "bg-slate-100 text-slate-400"
                                            }`}
                                        >
                                            <ClipboardList className="h-5 w-5" />
                                        </div>

                                        {/* Info */}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <p
                                                    className={`truncate text-sm font-black ${
                                                        isSelected
                                                            ? "text-teal-700"
                                                            : "text-slate-700"
                                                    }`}
                                                >
                                                    {test.name}
                                                </p>

                                                {isSelected && (
                                                    <Check className="h-5 w-5 shrink-0 text-teal-600" />
                                                )}
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                                                {test.test_date && (
                                                    <span>
                                                        {formatDate(
                                                            test.test_date,
                                                        )}
                                                    </span>
                                                )}

                                                {test.test_time && (
                                                    <span>
                                                        {formatTime(
                                                            test.test_time,
                                                        )}
                                                    </span>
                                                )}

                                                {test.location && (
                                                    <span className="truncate">
                                                        {test.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-10 text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                                    <Search className="h-6 w-6 text-slate-300" />
                                </div>

                                <p className="text-sm font-bold text-slate-600">
                                    لا توجد نتائج
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    لم يتم العثور على اختبار بهذا الاسم
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}

                    <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">
                                عدد الاختبارات
                            </span>

                            <span className="font-black text-teal-600">
                                {filteredTests.length}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Clients Index
|--------------------------------------------------------------------------
*/

export default function Index({ clients, filters, tests = [] }) {
    const { flash } = usePage().props;

    /*
     * States
     */

    const [selectedClients, setSelectedClients] = React.useState([]);

    const [showActions, setShowActions] = React.useState(false);

    const [showTestModal, setShowTestModal] = React.useState(false);

    const [selectedTest, setSelectedTest] = React.useState("");

    const [processing, setProcessing] = React.useState(false);

    const actionsRef = React.useRef(null);

    /*
     * Search Clients
     */

    const handleSearch = (e) => {
        router.get(
            route("clients.index"),
            {
                search: e.target.value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    /*
     * Delete Client
     */

    const handleDelete = (id) => {
        if (confirm("هل أنت متأكد من رغبتك في حذف هذا العميل؟")) {
            router.delete(route("clients.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    /*
     * Select Client
     */

    const toggleClient = (id) => {
        setSelectedClients((prev) =>
            prev.includes(id)
                ? prev.filter((clientId) => clientId !== id)
                : [...prev, id],
        );
    };

    /*
     * Select All Clients
     */

    const toggleAllClients = () => {
        const currentIds = clients?.data?.map((client) => client.id) || [];

        const allSelected =
            currentIds.length > 0 &&
            currentIds.every((id) => selectedClients.includes(id));

        if (allSelected) {
            setSelectedClients((prev) =>
                prev.filter((id) => !currentIds.includes(id)),
            );
        } else {
            setSelectedClients((prev) => [
                ...new Set([...prev, ...currentIds]),
            ]);
        }
    };

    /*
     * Current Page Selection
     */

    const currentIds = clients?.data?.map((client) => client.id) || [];

    const allCurrentSelected =
        currentIds.length > 0 &&
        currentIds.every((id) => selectedClients.includes(id));

    /*
     * Open Test Modal
     */

    const openTestModal = () => {
        if (selectedClients.length === 0) {
            return;
        }

        setShowActions(false);
        setSelectedTest("");
        setShowTestModal(true);
    };

    /*
     * Close Test Modal
     */

    const closeTestModal = () => {
        if (processing) return;

        setShowTestModal(false);
        setSelectedTest("");
    };

    /*
     * Add Clients To Test
     */

    const addClientsToTest = () => {
        if (!selectedTest) {
            alert("من فضلك اختر الاختبار أولاً");
            return;
        }

        if (selectedClients.length === 0) {
            alert("من فضلك حدد عميل واحد على الأقل");
            return;
        }

        setProcessing(true);

        router.post(
            route("tests.clients.attach"),
            {
                test_id: selectedTest,
                client_ids: selectedClients,
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowTestModal(false);
                    setSelectedTest("");
                    setSelectedClients([]);
                    setShowActions(false);
                },

                onFinish: () => {
                    setProcessing(false);
                },
            },
        );
    };

    /*
     * Close Actions Dropdown
     */

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                actionsRef.current &&
                !actionsRef.current.contains(event.target)
            ) {
                setShowActions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /*
     * Total Clients
     */

    const totalClients = clients?.total ?? clients?.data?.length ?? 0;

    /*
     * Render
     */

    return (
        <AuthenticatedLayout>
            <div dir="rtl" className="min-h-full bg-slate-50/40 text-slate-800">
                <div className="space-y-6">
                    {/* =====================================================
                        Header
                    ====================================================== */}

                    <div className="relative overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-teal-500/5 blur-3xl" />

                        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />

                        <div className="relative p-6 lg:p-7">
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                {/* Title */}

                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-600 shadow-sm">
                                        <Users className="h-7 w-7" />
                                    </div>

                                    <div>
                                        <h1 className="text-xl font-black text-slate-900 lg:text-2xl">
                                            إدارة العملاء
                                        </h1>

                                        <p className="mt-1 text-sm text-slate-500">
                                            إدارة ومتابعة بيانات العملاء
                                            والمرفقات الشخصية
                                        </p>
                                    </div>
                                </div>

                                {/* Buttons */}

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Operations */}

                                    <div ref={actionsRef} className="relative">
                                        <button
                                            type="button"
                                            disabled={
                                                selectedClients.length === 0
                                            }
                                            onClick={() =>
                                                setShowActions((prev) => !prev)
                                            }
                                            className={`inline-flex items-center justify-center gap-2.5 rounded-2xl border px-5 py-3.5 text-sm font-bold transition-all ${
                                                selectedClients.length > 0
                                                    ? "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                                                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                            }`}
                                        >
                                            <ClipboardList className="h-5 w-5" />
                                            العمليات
                                            {selectedClients.length > 0 && (
                                                <span className="flex h-6 min-w-6 items-center justify-center rounded-lg bg-teal-100 px-1.5 text-xs font-black text-teal-700">
                                                    {selectedClients.length}
                                                </span>
                                            )}
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform ${
                                                    showActions
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />
                                        </button>

                                        {/* Operations Dropdown */}

                                        {showActions &&
                                            selectedClients.length > 0 && (
                                                <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                                    <button
                                                        type="button"
                                                        onClick={openTestModal}
                                                        className="flex w-full items-center gap-3 px-4 py-4 text-right transition-all hover:bg-teal-50"
                                                    >
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                                                            <ClipboardList className="h-5 w-5 text-teal-600" />
                                                        </div>

                                                        <div>
                                                            <div className="text-sm font-black text-slate-700">
                                                                إضافة العملاء
                                                                إلى اختبار
                                                            </div>

                                                            <div className="mt-1 text-[11px] text-slate-400">
                                                                سيتم إضافة{" "}
                                                                {
                                                                    selectedClients.length
                                                                }{" "}
                                                                عميل للاختبار
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                    </div>

                                    {/* Add Client */}

                                    <Link
                                        href={route("clients.create")}
                                        className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition-all hover:bg-teal-700 active:scale-[0.98]"
                                    >
                                        <Plus className="h-5 w-5" />
                                        إضافة عميل جديد
                                    </Link>
                                </div>
                            </div>

                            {/* Stats */}

                            <div className="mt-6 border-t border-slate-100 pt-5">
                                <div className="inline-flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                                        <Users className="h-4 w-4 text-slate-500" />
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-medium text-slate-400">
                                            إجمالي العملاء
                                        </p>

                                        <p className="text-lg font-black leading-5 text-slate-900">
                                            {totalClients}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        Selected Clients
                    ====================================================== */}

                    {selectedClients.length > 0 && (
                        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100">
                                    <Users className="h-4 w-4 text-teal-600" />
                                </div>

                                <div>
                                    <p className="text-sm font-black text-teal-800">
                                        تم تحديد {selectedClients.length} عميل
                                    </p>

                                    <p className="mt-0.5 text-xs text-teal-600">
                                        يمكنك تنفيذ العمليات على العملاء
                                        المحددين
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedClients([]);
                                    setShowActions(false);
                                }}
                                className="text-xs font-bold text-teal-700 hover:text-teal-900"
                            >
                                إلغاء التحديد
                            </button>
                        </div>
                    )}

                    {/* =====================================================
                        Flash
                    ====================================================== */}

                    {flash?.success && (
                        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 shadow-sm">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                                <span className="text-sm font-black">✓</span>
                            </div>

                            <span className="text-sm font-semibold">
                                {flash.success}
                            </span>
                        </div>
                    )}

                    {/* =====================================================
                        Search
                    ====================================================== */}

                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div className="relative w-full md:max-w-xl">
                                <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    defaultValue={filters?.search || ""}
                                    onChange={handleSearch}
                                    placeholder="ابحث بالاسم، الهاتف، الرقم القومي..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                                />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>عدد النتائج:</span>

                                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 px-2 font-black text-teal-700">
                                    {totalClients}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        Table
                    ====================================================== */}

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        {/* Select All */}

                                        <th className="w-12 px-4 py-4">
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={allCurrentSelected}
                                                    onChange={toggleAllClients}
                                                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                />
                                            </div>
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-4 text-xs font-black text-slate-500">
                                            العميل
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-4 text-xs font-black text-slate-500">
                                            رقم الهاتف
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-4 text-xs font-black text-slate-500">
                                            الرقم القومي
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-4 text-xs font-black text-slate-500">
                                            الوظيفة
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-4 text-xs font-black text-slate-500">
                                            المحافظة
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-4 text-xs font-black text-slate-500">
                                            الرخصة
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-4 text-center text-xs font-black text-slate-500">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {clients?.data?.length > 0 ? (
                                        clients.data.map((client) => {
                                            const photo =
                                                client.personal_photo_url;

                                            const isSelected =
                                                selectedClients.includes(
                                                    client.id,
                                                );

                                            return (
                                                <tr
                                                    key={client.id}
                                                    className={`group transition-all duration-200 ${
                                                        isSelected
                                                            ? "bg-teal-50/60"
                                                            : "hover:bg-teal-50/30"
                                                    }`}
                                                >
                                                    {/* Checkbox */}

                                                    <td className="px-4 py-4">
                                                        <div className="flex justify-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    isSelected
                                                                }
                                                                onChange={() =>
                                                                    toggleClient(
                                                                        client.id,
                                                                    )
                                                                }
                                                                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* Client */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex min-w-[260px] items-center gap-3">
                                                            <div className="relative shrink-0">
                                                                {photo ? (
                                                                    <img
                                                                        src={
                                                                            photo
                                                                        }
                                                                        alt={
                                                                            client.name
                                                                        }
                                                                        className="h-14 w-14 rounded-2xl object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                                                                        <User className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}

                                                                <span className="absolute -bottom-1 -left-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                                                            </div>

                                                            <div className="min-w-0">
                                                                <Link
                                                                    href={route(
                                                                        "clients.show",
                                                                        client.id,
                                                                    )}
                                                                    className="block max-w-[200px] truncate text-sm font-black text-slate-900 transition-colors hover:text-teal-600"
                                                                >
                                                                    {
                                                                        client.name
                                                                    }
                                                                </Link>

                                                                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                                                                    <Hash className="h-3 w-3" />

                                                                    <span>
                                                                        #
                                                                        {
                                                                            client.id
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Phone */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                            </div>

                                                            <span className="whitespace-nowrap text-sm font-semibold">
                                                                {client.phone ||
                                                                    "-"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* National ID */}

                                                    <td className="px-5 py-4">
                                                        {client.national_id ? (
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="h-4 w-4 shrink-0 text-slate-400" />

                                                                <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-700">
                                                                    {
                                                                        client.national_id
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Job */}

                                                    <td className="px-5 py-4">
                                                        {client.job_title ? (
                                                            <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                                                                <Briefcase className="h-3.5 w-3.5 text-slate-400" />

                                                                {
                                                                    client.job_title
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Governorate */}

                                                    <td className="px-5 py-4">
                                                        {client.governorate ? (
                                                            <div className="flex items-center gap-2 text-slate-700">
                                                                <MapPin className="h-4 w-4 shrink-0 text-teal-500" />

                                                                <span className="whitespace-nowrap text-sm font-semibold">
                                                                    {
                                                                        client.governorate
                                                                    }
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* License */}

                                                    <td className="px-5 py-4">
                                                        {client.license_grade ? (
                                                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-700">
                                                                {
                                                                    client.license_grade
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {/* Show */}

                                                            <Link
                                                                href={route(
                                                                    "clients.show",
                                                                    client.id,
                                                                )}
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
                                                                title="عرض التفاصيل"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>

                                                            {/* Edit */}

                                                            <Link
                                                                href={route(
                                                                    "clients.edit",
                                                                    client.id,
                                                                )}
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                                                title="تعديل"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>

                                                            {/* Delete */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        client.id,
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                                                title="حذف"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="py-20">
                                                <div className="flex flex-col items-center justify-center text-center">
                                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
                                                        <Users className="h-9 w-9 text-slate-300" />
                                                    </div>

                                                    <h3 className="text-base font-black text-slate-700">
                                                        لا يوجد عملاء
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        لم يتم العثور على أي
                                                        عملاء مطابقين للبحث
                                                    </p>

                                                    <Link
                                                        href={route(
                                                            "clients.create",
                                                        )}
                                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-teal-700"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                        إضافة أول عميل
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}

                        {clients?.data?.length > 0 && (
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row">
                                <p className="text-xs text-slate-400">
                                    عرض{" "}
                                    <span className="font-bold text-slate-600">
                                        {clients.from || 1}
                                    </span>{" "}
                                    إلى{" "}
                                    <span className="font-bold text-slate-600">
                                        {clients.to || clients.data.length}
                                    </span>{" "}
                                    من أصل{" "}
                                    <span className="font-bold text-slate-600">
                                        {clients.total || clients.data.length}
                                    </span>{" "}
                                    عميل
                                </p>

                                <div className="flex items-center gap-1">
                                    {clients.links?.map((link, index) => {
                                        if (
                                            link.label.includes("Previous") ||
                                            link.label.includes("Next")
                                        ) {
                                            return null;
                                        }

                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || "#"}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                                className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold transition-all ${
                                                    link.active
                                                        ? "bg-teal-600 text-white shadow-sm"
                                                        : "border border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-600"
                                                } ${
                                                    !link.url
                                                        ? "pointer-events-none opacity-40"
                                                        : ""
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* =============================================================
                TEST MODAL
            ============================================================= */}

            {showTestModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                    dir="rtl"
                >
                    {/* Overlay */}

                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={closeTestModal}
                    />

                    {/* Modal */}

                    <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
                        {/* =================================================
                            Header
                        ================================================== */}

                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-7 py-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50">
                                    <ClipboardList className="h-7 w-7 text-teal-600" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-black text-slate-900">
                                        إضافة العملاء إلى اختبار
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        تم تحديد{" "}
                                        <span className="font-black text-teal-600">
                                            {selectedClients.length}
                                        </span>{" "}
                                        عميل
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeTestModal}
                                disabled={processing}
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* =================================================
                            Body
                        ================================================== */}

                        <div className="min-h-0 flex-1 overflow-y-auto p-7">
                            <div className="mb-5">
                                <label className="mb-2 block text-base font-black text-slate-700">
                                    اختر الاختبار
                                </label>

                                <p className="text-sm text-slate-400">
                                    ابحث عن الاختبار بالاسم أو المكان ثم اختر
                                    الاختبار لإضافة العملاء إليه
                                </p>
                            </div>

                            {tests.length > 0 ? (
                                <TestSelect
                                    tests={tests}
                                    selectedTest={selectedTest}
                                    setSelectedTest={setSelectedTest}
                                />
                            ) : (
                                <div className="py-14 text-center">
                                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
                                        <ClipboardList className="h-9 w-9 text-slate-300" />
                                    </div>

                                    <h3 className="text-base font-black text-slate-700">
                                        لا توجد اختبارات
                                    </h3>

                                    <p className="mt-2 text-sm text-slate-400">
                                        قم بإضافة اختبار أولاً
                                    </p>

                                    <Link
                                        href={route("tests.create")}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        إضافة اختبار
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* =================================================
                            Footer
                        ================================================== */}

                        {tests.length > 0 && (
                            <div className="flex shrink-0 flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-7 py-5 sm:flex-row">
                                <div className="text-sm text-slate-400">
                                    {selectedTest ? (
                                        <span className="flex items-center gap-2 font-bold text-teal-600">
                                            <Check className="h-4 w-4" />
                                            تم اختيار الاختبار
                                        </span>
                                    ) : (
                                        "لم يتم اختيار اختبار"
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={closeTestModal}
                                        disabled={processing}
                                        className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                    >
                                        إلغاء
                                    </button>

                                    <button
                                        type="button"
                                        onClick={addClientsToTest}
                                        disabled={!selectedTest || processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                جاري الإضافة...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-5 w-5" />
                                                إضافة العملاء للاختبار
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
