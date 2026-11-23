import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
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
    BookOpen,
    Upload,
    Check,
    Download,
    Send,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| شرط ظهور زرار "إرسال لسيستم العمليات"
|--------------------------------------------------------------------------
| الزرار بيظهر بس لو: التقييم "مقبول" + الـ status مش true
| لو العميل (احتياطي / راسب / لم يتم التقييم) → يختفي
| لو الـ status بتاع العميل true → يختفي
| (true / 1 / "1" = true ، وأي قيمة تانية "0" أو false أو null = مش true)
| ملاحظة: لو الـ status موجود في الـ pivot غيّر client.status لـ client.pivot?.status
*/
const isClientActive = (client) =>
    client?.status === true || client?.status === 1 || client?.status === "1";

const canSendToOperations = (client) =>
    client?.pivot?.evaluation === "مقبول" && !isClientActive(client);

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

        // الأساسي: تقييم + جواز + حذف = 3
        // لو مقبول: + عقد الوزارة + عقد الشركة
        // لو مقبول و status مش true: + إرسال لسيستم العمليات
        const isAccepted = client.pivot?.evaluation === "مقبول";
        const itemsCount =
            3 + (isAccepted ? 2 : 0) + (canSendToOperations(client) ? 1 : 0);
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

    /*
    |--------------------------------------------------------------------------
    | التوست (Alert) للنجاح والفشل
    |--------------------------------------------------------------------------
    */
    const [toast, setToast] = useState(null); // { type: "success" | "error", title, message }
    const toastTimer = useRef(null);

    const showToast = (type, title, message) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ type, title, message });
        toastTimer.current = setTimeout(() => setToast(null), 6000);
    };

    const closeToast = () => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(null);
    };

    useEffect(() => {
        return () => {
            if (toastTimer.current) clearTimeout(toastTimer.current);
        };
    }, []);

    // لو السيرفر بعت flash (نجاح أو خطأ) نعرضه كتوست
    useEffect(() => {
        if (flash?.success) {
            showToast("success", "تمت العملية بنجاح", flash.success);
        } else if (flash?.error) {
            showToast("error", "فشلت العملية", flash.error);
        }
    }, [flash?.success, flash?.error]);

    /*
    |--------------------------------------------------------------------------
    | إرسال لسيستم العمليات
    |--------------------------------------------------------------------------
    */
    const [sendClient, setSendClient] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [sendErrors, setSendErrors] = useState({});

    const openSendModal = (client) => {
        // حماية إضافية: مسموح بس للعميل المقبول والـ status بتاعه مش true
        if (!canSendToOperations(client)) return;
        setSendErrors({});
        setSendClient(client);
    };

    const closeSendModal = () => {
        if (isSending) return;
        setSendClient(null);
    };

    // الروت بيرجع JSON (مش Inertia) فبنستخدم axios ونقرأ الرد مباشرة
    const confirmSendCustomerData = async () => {
        if (!sendClient || isSending) return;

        const clientName = sendClient.name;

        setIsSending(true);
        setSendErrors({});

        try {
            const response = await axios.post(
                route("clients.send-customer-data", sendClient.id),
                {},
                { headers: { Accept: "application/json" } },
            );

            const body = response?.data || {};

            if (body.success === false) {
                showToast(
                    "error",
                    "فشل الإرسال",
                    body.message || "حدث خطأ أثناء الإرسال لسيستم العمليات",
                );
            } else {
                showToast(
                    "success",
                    "تم الإرسال بنجاح",
                    body.message ||
                        `تم إرسال العميل "${clientName}" لسيستم العمليات`,
                );

                // تحديث الجدول بدون إعادة تحميل الصفحة
                router.reload({
                    only: ["clients", "stats"],
                    preserveScroll: true,
                });
            }
        } catch (error) {
            const res = error?.response;
            const body = res?.data || {};

            // أخطاء الـ validation (422)
            if (res?.status === 422 && body.errors) {
                setSendErrors(body.errors);
            }

            const firstValidation = body.errors
                ? Object.values(body.errors)[0]
                : null;

            showToast(
                "error",
                "فشل الإرسال",
                body.message ||
                    (Array.isArray(firstValidation)
                        ? firstValidation[0]
                        : firstValidation) ||
                    body.error ||
                    error?.message ||
                    "حدث خطأ أثناء الإرسال لسيستم العمليات",
            );
        } finally {
            setIsSending(false);
            setSendClient(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | استلام الجواز
    |--------------------------------------------------------------------------
    */
    const [passportClient, setPassportClient] = useState(null);
    const [passportPreview, setPassportPreview] = useState(null);
    const [isDraggingPassport, setIsDraggingPassport] = useState(false);

    const passportForm = useForm({
        _method: "PATCH",
        passport_received: false,
        passport_received_at: "",
        passport_photo: null,
        remove_passport_photo: false,
    });

    // أي تاريخ من السيرفر → قيمة datetime-local بالتوقيت المحلي
    const toLocalInput = (value) => {
        if (!value) return "";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "";
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const revokePassportPreview = () => {
        if (passportPreview && passportPreview.startsWith("blob:")) {
            URL.revokeObjectURL(passportPreview);
        }
    };

    const openPassportModal = (client) => {
        revokePassportPreview();

        setPassportClient(client);

        passportForm.clearErrors();
        passportForm.setData({
            _method: "PATCH",
            passport_received: !!client.passport_received,
            passport_received_at: toLocalInput(client.passport_received_at),
            passport_photo: null,
            remove_passport_photo: false,
        });

        setPassportPreview(
            client.passport_photo_url ||
                (client.passport_photo
                    ? `/storage/${client.passport_photo}`
                    : null),
        );
    };

    const closePassportModal = () => {
        revokePassportPreview();
        setPassportPreview(null);
        setPassportClient(null);
        setIsDraggingPassport(false);
        passportForm.reset();
        passportForm.clearErrors();
    };

    const handlePassportToggle = (checked) => {
        passportForm.setData((prev) => ({
            ...prev,
            passport_received: checked,
            // أول ما يتأكد الاستلام ولسه مفيش تاريخ، نحط الوقت الحالي
            passport_received_at:
                checked && !prev.passport_received_at
                    ? toLocalInput(new Date())
                    : prev.passport_received_at,
        }));
    };

    const handlePassportPhoto = (file) => {
        if (!file) return;
        if (!file.type?.startsWith("image/")) return; // صور فقط

        revokePassportPreview();

        passportForm.setData((prev) => ({
            ...prev,
            passport_photo: file,
            remove_passport_photo: false,
        }));

        setPassportPreview(URL.createObjectURL(file));
    };

    // ===== السحب والإفلات =====
    const onPassportDragOver = (e) => {
        e.preventDefault();
        setIsDraggingPassport(true);
    };

    const onPassportDragLeave = (e) => {
        // تجاهل الخروج لعنصر داخلي
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDraggingPassport(false);
    };

    const onPassportDrop = (e) => {
        e.preventDefault();
        setIsDraggingPassport(false);
        const file = Array.from(e.dataTransfer.files || []).find((f) =>
            f.type.startsWith("image/"),
        );
        handlePassportPhoto(file);
    };

    // ===== اللصق (Ctrl+V) طول ما المودال مفتوح =====
    useEffect(() => {
        if (!passportClient) return;

        const onPaste = (e) => {
            const items = Array.from(e.clipboardData?.items || []);
            const imageItem = items.find((i) => i.type.startsWith("image/"));
            if (!imageItem) return; // لو نص عادي سيبه يشتغل طبيعي

            const file = imageItem.getAsFile();
            if (!file) return;

            e.preventDefault();
            handlePassportPhoto(file);
        };

        document.addEventListener("paste", onPaste);
        return () => document.removeEventListener("paste", onPaste);
    }, [passportClient, passportPreview]);

    const removePassportPhoto = () => {
        revokePassportPreview();

        passportForm.setData((prev) => ({
            ...prev,
            passport_photo: null,
            remove_passport_photo: true,
        }));

        setPassportPreview(null);
    };

    const handlePassportSubmit = (e) => {
        e.preventDefault();
        if (!passportClient) return;

        passportForm.post(route("clients.passport.update", passportClient.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => closePassportModal(),
        });
    };

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

            {/* توست النجاح / الفشل */}
            {toast &&
                createPortal(
                    <div
                        dir="rtl"
                        role="alert"
                        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4"
                    >
                        <div
                            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border p-4 shadow-2xl ${
                                toast.type === "success"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-red-200 bg-red-50 text-red-800"
                            }`}
                        >
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
                                    toast.type === "success"
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                }`}
                            >
                                {toast.type === "success" ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <XCircle className="h-5 w-5" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-black">
                                    {toast.title}
                                </p>
                                {toast.message && (
                                    <p className="mt-1 break-words text-sm font-semibold">
                                        {toast.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={closeToast}
                                className="rounded-lg p-1 opacity-60 transition hover:opacity-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>,
                    document.body,
                )}

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
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

                                {/* تصدير الناجحين (تحميل ملف → لازم <a> عادي مش Link) */}
                                <a
                                    href={route("tests.export-passed", test.id)}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                >
                                    <Download className="h-5 w-5" />
                                    <span>
                                        تصدير الناجحين (
                                        {evaluationStats.accepted})
                                    </span>
                                </a>

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

                    {/* Flash: خطأ / أخطاء الإرسال / نجاح */}
                    {flash?.error && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <p className="font-semibold">
                                حدث خطأ أثناء الإرسال:
                            </p>
                            <p className="mt-1">{flash.error}</p>
                        </div>
                    )}

                    {sendErrors && Object.keys(sendErrors).length > 0 && (
                        <ul className="mb-4 list-disc space-y-1 rounded-xl border border-red-200 bg-red-50 p-4 pr-8 text-sm text-red-700">
                            {Object.entries(sendErrors).map(([field, msg]) => (
                                <li key={field}>
                                    <strong>{field}:</strong>{" "}
                                    {Array.isArray(msg) ? msg.join("، ") : msg}
                                </li>
                            ))}
                        </ul>
                    )}

                    {flash?.success && (
                        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                            {flash.success}
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
                            <table className="w-full min-w-[950px] text-right">
                                <thead className="border-b border-slate-100 bg-slate-50">
                                    <tr>
                                        <th className="px-5 py-4 text-xs font-black text-slate-500">
                                            الكود
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black text-slate-500">
                                            العميل
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black text-slate-500">
                                            السن
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
                                            const hasAge =
                                                client.age !== null &&
                                                client.age !== undefined;

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
                                                                {client.passport_received && (
                                                                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                                                                        <BookOpen className="h-3 w-3" />
                                                                        تم
                                                                        استلام
                                                                        الجواز
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Age */}
                                                    <td className="px-5 py-5">
                                                        {hasAge ? (
                                                            <span
                                                                className={`inline-flex items-center rounded-xl border px-3 py-2 text-xs font-black ${
                                                                    client.age >
                                                                    45
                                                                        ? "border-red-200 bg-red-50 text-red-600"
                                                                        : "border-slate-200 bg-slate-50 text-slate-700"
                                                                }`}
                                                            >
                                                                {client.age} سنة
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm font-semibold text-slate-400">
                                                                -
                                                            </span>
                                                        )}
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
                                                colSpan="8"
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

                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                const c = menu.client;
                                setMenu(null);
                                openPassportModal(c);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                            <BookOpen className="h-4 w-4 text-teal-600" />
                            استلام الجواز
                        </button>

                        {/* إرسال لسيستم العمليات: مقبول + status مش true فقط */}
                        {canSendToOperations(menu.client) && (
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    const c = menu.client;
                                    setMenu(null);
                                    openSendModal(c);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-right text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                                <Send className="h-4 w-4 text-blue-600" />
                                إرسال لسيستم العمليات
                            </button>
                        )}

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

            {/* Modal تأكيد الإرسال لسيستم العمليات */}
            {sendClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl transition-all">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Send className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        إرسال لسيستم العمليات
                                    </h3>
                                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                        {sendClient.name}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeSendModal}
                                disabled={isSending}
                                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="mt-5 text-sm font-bold leading-7 text-slate-700">
                            هل أنت متأكد من إرسال العميل "{sendClient.name}"
                            لسيستم العمليات؟
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-6">
                            <button
                                type="button"
                                onClick={closeSendModal}
                                disabled={isSending}
                                className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={confirmSendCustomerData}
                                disabled={isSending}
                                className="inline-flex items-center gap-2 rounded-2xl bg-brand-teal px-5 py-2.5 text-sm font-black text-white hover:opacity-90 disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                {isSending
                                    ? "جاري الإرسال..."
                                    : "تأكيد الإرسال"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal استلام الجواز */}
            {passportClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl transition-all">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                                    <BookOpen className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
                                        استلام الجواز
                                    </h3>
                                    <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                        {passportClient.name}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closePassportModal}
                                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handlePassportSubmit}
                            className="mt-5 space-y-5"
                        >
                            {/* تم الاستلام */}
                            <label
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-sm font-black transition ${
                                    passportForm.data.passport_received
                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-300"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={
                                        passportForm.data.passport_received
                                    }
                                    onChange={(e) =>
                                        handlePassportToggle(e.target.checked)
                                    }
                                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                تم استلام الجواز من العميل
                            </label>

                            {passportForm.errors.passport_received && (
                                <p className="-mt-3 text-xs font-semibold text-red-500">
                                    {passportForm.errors.passport_received}
                                </p>
                            )}

                            {/* تاريخ الاستلام */}
                            <div>
                                <label className="mb-1.5 block text-xs font-black text-slate-700">
                                    تاريخ ووقت الاستلام
                                </label>
                                <input
                                    type="datetime-local"
                                    dir="ltr"
                                    value={
                                        passportForm.data.passport_received_at
                                    }
                                    disabled={
                                        !passportForm.data.passport_received
                                    }
                                    onChange={(e) =>
                                        passportForm.setData(
                                            "passport_received_at",
                                            e.target.value,
                                        )
                                    }
                                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/10 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {passportForm.errors.passport_received_at && (
                                    <p className="mt-1 text-xs font-semibold text-red-500">
                                        {
                                            passportForm.errors
                                                .passport_received_at
                                        }
                                    </p>
                                )}
                            </div>

                            {/* صورة الجواز */}
                            <div>
                                <label className="mb-1.5 block text-xs font-black text-slate-700">
                                    صورة الجواز
                                </label>

                                <div
                                    onDragOver={onPassportDragOver}
                                    onDragEnter={onPassportDragOver}
                                    onDragLeave={onPassportDragLeave}
                                    onDrop={onPassportDrop}
                                    className={`relative rounded-2xl transition ${
                                        isDraggingPassport
                                            ? "ring-2 ring-teal-500 ring-offset-2"
                                            : ""
                                    }`}
                                >
                                    {passportPreview ? (
                                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                            <div className="relative h-52 bg-slate-100">
                                                <img
                                                    src={passportPreview}
                                                    alt="صورة الجواز"
                                                    className="h-full w-full object-cover"
                                                />

                                                <span
                                                    className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
                                                        passportForm.data
                                                            .passport_photo
                                                            ? "bg-teal-600 text-white"
                                                            : "bg-white/90 text-slate-700"
                                                    }`}
                                                >
                                                    {passportForm.data
                                                        .passport_photo ? (
                                                        <>
                                                            <Check className="h-3 w-3" />
                                                            صورة جديدة
                                                        </>
                                                    ) : (
                                                        "الصورة الحالية"
                                                    )}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        removePassportPhoto
                                                    }
                                                    title="إزالة الصورة"
                                                    className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white shadow-sm transition hover:bg-red-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 p-3">
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    اسحب صورة جديدة هنا أو
                                                    الصقها (Ctrl+V)
                                                </span>
                                                <label
                                                    htmlFor="passport-photo"
                                                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-teal-500 hover:text-teal-600"
                                                >
                                                    <Upload className="h-3.5 w-3.5" />
                                                    تغيير الصورة
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="passport-photo"
                                            className={`group flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
                                                isDraggingPassport
                                                    ? "border-teal-500 bg-teal-50"
                                                    : "border-slate-200 bg-slate-50/70 hover:border-teal-400 hover:bg-teal-50/40"
                                            }`}
                                        >
                                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition group-hover:border-teal-200 group-hover:text-teal-600">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 group-hover:text-teal-700">
                                                {isDraggingPassport
                                                    ? "أفلت الصورة هنا"
                                                    : "اسحب الصورة هنا أو اضغط للرفع"}
                                            </span>
                                            <span className="mt-1 text-[10px] text-slate-400">
                                                أو الصقها مباشرة (Ctrl+V) • PNG
                                                / JPG / JPEG
                                            </span>
                                        </label>
                                    )}

                                    {/* طبقة توضح منطقة الإفلات فوق الصورة الحالية */}
                                    {isDraggingPassport && passportPreview && (
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-teal-600/70 text-sm font-black text-white">
                                            أفلت الصورة لاستبدالها
                                        </div>
                                    )}
                                </div>

                                <input
                                    id="passport-photo"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        handlePassportPhoto(
                                            e.target.files?.[0],
                                        );
                                        e.target.value = ""; // يسمح باختيار نفس الملف تاني
                                    }}
                                />

                                {passportForm.errors.passport_photo && (
                                    <p className="mt-1 text-xs font-semibold text-red-500">
                                        {passportForm.errors.passport_photo}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closePassportModal}
                                    className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={passportForm.processing}
                                    className="rounded-2xl bg-brand-teal px-5 py-2.5 text-sm font-black text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    {passportForm.processing
                                        ? "جاري الحفظ..."
                                        : "حفظ"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
