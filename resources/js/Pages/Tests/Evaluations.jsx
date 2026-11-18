import React, { useState, useEffect } from "react";
import { Head, router, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

// صورة بديلة محلية (SVG مضمّن) بدون أي طلب خارجي
const FALLBACK_AVATAR =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="192" viewBox="0 0 160 192">
<rect width="160" height="192" fill="#e7e5e4"/>
<circle cx="80" cy="74" r="28" fill="#a8a29e"/>
<path d="M24 192c0-36 25-60 56-60s56 24 56 60z" fill="#a8a29e"/>
</svg>`,
    );

const OPTIONS = [
    {
        value: "مقبول",
        icon: "✓",
        active: "bg-emerald-600 text-white border-emerald-600 shadow-sm",
        idle: "hover:border-emerald-400 hover:bg-emerald-50",
        dot: "bg-emerald-500",
        hex: "#059669",
    },
    {
        value: "احتياطي",
        icon: "◔",
        active: "bg-amber-500 text-white border-amber-500 shadow-sm",
        idle: "hover:border-amber-400 hover:bg-amber-50",
        dot: "bg-amber-500",
        hex: "#f59e0b",
    },
    {
        value: "راسب",
        icon: "✕",
        active: "bg-rose-600 text-white border-rose-600 shadow-sm",
        idle: "hover:border-rose-400 hover:bg-rose-50",
        dot: "bg-rose-500",
        hex: "#e11d48",
    },
];

const dotFor = (evaluation) =>
    OPTIONS.find((o) => o.value === evaluation)?.dot || "bg-gray-300";

function Field({ label, value, strong }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd
                className={`mt-0.5 truncate ${
                    strong ? "font-bold text-gray-900" : "text-gray-700"
                }`}
            >
                {value || "غير محدد"}
            </dd>
        </div>
    );
}

const formatDate = (v) => (v ? String(v).split("T")[0] : "");

function useIsDesktop() {
    const query = "(min-width: 1024px)";
    const [match, setMatch] = useState(
        () => typeof window !== "undefined" && window.matchMedia(query).matches,
    );
    useEffect(() => {
        const m = window.matchMedia(query);
        const h = () => setMatch(m.matches);
        m.addEventListener("change", h);
        return () => m.removeEventListener("change", h);
    }, []);
    return match;
}

export default function Evaluations({ test, clients }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [previewImage, setPreviewImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const isDesktop = useIsDesktop();

    // العملاء المقيَّمين مسبقاً يفتحون مقفولين
    const [lockedMap, setLockedMap] = useState(() => {
        const initial = {};
        (clients || []).forEach((c) => {
            initial[c.id] = !!c.pivot?.evaluation;
        });
        return initial;
    });

    const [clientData, setClientData] = useState(() => {
        const initial = {};
        (clients || []).forEach((c) => {
            initial[c.id] = {
                evaluation: c.pivot?.evaluation || "",
                notes: c.pivot?.notes || "",
            };
        });
        return initial;
    });

    const total = clients?.length || 0;

    // التنقل بالأسهم (في RTL: اليسار = التالي)
    useEffect(() => {
        const onKey = (e) => {
            if (["TEXTAREA", "INPUT"].includes(e.target.tagName)) return;
            if (e.key === "Escape") setPreviewImage(null);
            if (e.key === "ArrowLeft")
                setCurrentIndex((i) => Math.min(i + 1, total - 1));
            if (e.key === "ArrowRight")
                setCurrentIndex((i) => Math.max(i - 1, 0));
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [total]);

    if (!clients || total === 0) {
        return (
            <div
                className="min-h-screen grid place-items-center bg-gray-100 text-gray-500"
                dir="rtl"
            >
                لا يوجد عملاء مضافين لهذا الاختبار حتى الآن.
            </div>
        );
    }

    const currentClient = clients[currentIndex];
    const currentData = clientData[currentClient.id];
    const isLocked = !!lockedMap[currentClient.id] && !!currentData.evaluation;
    const selectedOption = OPTIONS.find(
        (o) => o.value === currentData.evaluation,
    );

    const avatarUrl = currentClient.personal_photo
        ? `/storage/${currentClient.personal_photo}`
        : FALLBACK_AVATAR;

    const evaluatedCount = Object.values(clientData).filter(
        (c) => c.evaluation,
    ).length;
    const percent = Math.round((evaluatedCount / total) * 100);

    const saveEvaluation = (clientId, values) => {
        setSaving(true);
        const client = clients.find((c) => c.id === clientId);
        router.post(
            route("tests.evaluations.store", test.id),
            {
                client_id: clientId,
                code: client?.pivot?.code ?? client?.code ?? "",
                evaluation: values.evaluation,
                notes: values.notes,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setSaving(false);
                    setLastSaved(new Date().toLocaleTimeString("ar-EG"));
                },
                onError: () => setSaving(false),
            },
        );
    };

    const handleEvaluationChange = (value) => {
        const updated = { ...currentData, evaluation: value };
        setClientData({ ...clientData, [currentClient.id]: updated });
        saveEvaluation(currentClient.id, updated);
    };

    const handleFieldChange = (field, value) => {
        setClientData({
            ...clientData,
            [currentClient.id]: { ...currentData, [field]: value },
        });
    };

    const handleBlur = () => saveEvaluation(currentClient.id, currentData);

    // حفظ وإغلاق التقييم
    const handleLock = () => {
        if (!currentData.evaluation) return;
        setLockedMap({ ...lockedMap, [currentClient.id]: true });
        saveEvaluation(currentClient.id, currentData);
    };

    // إعادة فتح التقييم للتعديل
    const handleUnlock = () =>
        setLockedMap({ ...lockedMap, [currentClient.id]: false });

    const handleNext = () =>
        currentIndex < total - 1 && setCurrentIndex(currentIndex + 1);
    const handlePrevious = () =>
        currentIndex > 0 && setCurrentIndex(currentIndex - 1);

    const documents = [
        {
            label: "الرقم القومي (أمامي)",
            path: currentClient.national_id_front,
        },
        { label: "الرقم القومي (خلفي)", path: currentClient.national_id_back },
        { label: "صورة الرخصة", path: currentClient.license_photo },
    ].filter((d) => d.path);

    return (
        <AuthenticatedLayout>
            <div className="min-h-screen bg-gray-100 text-gray-800" dir="rtl">
                <Head title={`تقييم: ${test.name}`} />

                {/* الهيدر */}
                <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
                    <div
                        className="px-4 md:px-8 py-3 flex items-center justify-between gap-4"
                        style={{ maxWidth: "72rem", marginInline: "auto" }}
                    >
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold text-gray-900 truncate">
                                {test.name}
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {formatDate(test.test_date)} · {test.location}
                            </p>
                        </div>

                        <div className="hidden sm:flex flex-1 max-w-xs items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <span
                                dir="ltr"
                                className="text-xs font-semibold text-gray-600 whitespace-nowrap"
                            >
                                {evaluatedCount} / {total}
                            </span>
                        </div>

                        <Link
                            href={route("tests.index")}
                            className="shrink-0 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 bg-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                            خروج
                        </Link>
                    </div>
                </header>

                <main
                    className="p-4 md:p-8"
                    style={{
                        maxWidth: "72rem",
                        marginInline: "auto",
                        display: "grid",
                        gap: "1.5rem",
                        alignItems: "start",
                        gridTemplateColumns: isDesktop
                            ? "16rem minmax(0, 1fr)"
                            : "minmax(0, 1fr)",
                    }}
                >
                    {/* قائمة العملاء */}
                    <aside
                        className="min-w-0"
                        style={
                            isDesktop
                                ? { position: "sticky", top: "6rem" }
                                : undefined
                        }
                    >
                        <div
                            className="bg-white rounded-2xl border border-gray-200 p-2 gap-1"
                            style={{
                                display: "flex",
                                flexDirection: isDesktop ? "column" : "row",
                                overflowX: isDesktop ? "visible" : "auto",
                                overflowY: isDesktop ? "auto" : "visible",
                                maxHeight: isDesktop
                                    ? "calc(100vh - 8rem)"
                                    : undefined,
                            }}
                        >
                            {clients.map((c, i) => {
                                const isCurrent = i === currentIndex;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setCurrentIndex(i)}
                                        style={
                                            isCurrent
                                                ? {
                                                      backgroundColor:
                                                          "#111827",
                                                      color: "#ffffff",
                                                  }
                                                : undefined
                                        }
                                        className={`flex shrink-0 items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-right whitespace-nowrap lg:whitespace-normal transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 ${
                                            isCurrent
                                                ? "bg-gray-900 text-white"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotFor(
                                                clientData[c.id].evaluation,
                                            )}`}
                                        />
                                        <span className="truncate">
                                            {c.name}
                                        </span>
                                        <span
                                            className={`ms-auto text-xs ${
                                                isCurrent
                                                    ? "text-gray-300"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {i + 1}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* كارت العميل */}
                    <section className="min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <span className="text-sm font-semibold text-gray-700">
                                عميل {currentIndex + 1} من {total}
                            </span>
                            <div
                                className="text-xs min-h-[1rem]"
                                aria-live="polite"
                            >
                                {saving ? (
                                    <span className="text-amber-600 font-medium inline-flex items-center gap-1.5">
                                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600" />
                                        جاري الحفظ...
                                    </span>
                                ) : lastSaved ? (
                                    <span className="text-emerald-600 font-medium">
                                        ✓ تم الحفظ ({lastSaved})
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* الصورة + البيانات */}
                            <div
                                className="gap-6"
                                style={{ display: "flex", flexWrap: "wrap" }}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        currentClient.personal_photo &&
                                        setPreviewImage(avatarUrl)
                                    }
                                    className="group relative self-center sm:self-start w-40 h-48 shrink-0 rounded-2xl overflow-hidden bg-gray-200 ring-1 ring-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                                >
                                    <img
                                        src={avatarUrl}
                                        alt={currentClient.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = FALLBACK_AVATAR;
                                        }}
                                    />
                                    <span className="absolute inset-x-0 bottom-0 py-1.5 bg-black/55 text-white text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        تكبير الصورة
                                    </span>
                                </button>

                                <div
                                    className="space-y-5"
                                    style={{ flex: "1 1 16rem", minWidth: 0 }}
                                >
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {currentClient.name}
                                    </h2>

                                    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-stone-50/60 rounded-xl border border-stone-200/80 text-sm">
                                        <Field
                                            label="كود العميل"
                                            value={
                                                currentClient.pivot?.code ||
                                                currentClient.code ||
                                                " غير محدد"
                                            }
                                            strong
                                        />
                                        <Field
                                            label="الرقم القومي"
                                            value={
                                                currentClient.national_id ||
                                                "غير محدد"
                                            }
                                        />
                                        <Field
                                            label="الهاتف"
                                            value={
                                                currentClient.phone ||
                                                "غير محدد"
                                            }
                                        />
                                        <Field
                                            label="تاريخ الميلاد"
                                            value={formatDate(
                                                currentClient.birth_date,
                                            )}
                                        />
                                        <Field
                                            label="الوظيفة / درجة الرخصة"
                                            value={`${
                                                currentClient.job_title ||
                                                "غير محدد"
                                            } (${currentClient.license_grade || "-"})`}
                                        />
                                    </dl>

                                    {documents.length > 0 && (
                                        <div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                المرفقات
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {documents.map((d) => (
                                                    <button
                                                        key={d.label}
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewImage(
                                                                `/storage/${d.path}`,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 text-xs text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                                                    >
                                                        📷 {d.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {isLocked ? (
                                <div className="space-y-5">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-gray-800">
                                                التقييم
                                            </span>
                                            <span
                                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
                                                style={{
                                                    backgroundColor:
                                                        selectedOption?.hex,
                                                    color: "#ffffff",
                                                }}
                                            >
                                                <span>
                                                    {selectedOption?.icon}
                                                </span>
                                                {currentData.evaluation}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleUnlock}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                                        >
                                            ✎ تعديل التقييم
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 mb-2">
                                            ملاحظات التقييم
                                        </p>
                                        <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap min-h-[3rem]">
                                            {currentData.notes || (
                                                <span className="text-gray-400">
                                                    لا توجد ملاحظات
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* التقييم */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            التقييم{" "}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {OPTIONS.map((o) => {
                                                const selected =
                                                    currentData.evaluation ===
                                                    o.value;
                                                return (
                                                    <button
                                                        key={o.value}
                                                        type="button"
                                                        aria-pressed={selected}
                                                        onClick={() =>
                                                            handleEvaluationChange(
                                                                o.value,
                                                            )
                                                        }
                                                        className={`flex items-center justify-center gap-2 py-4 rounded-xl border text-base font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 ${
                                                            selected
                                                                ? o.active
                                                                : `bg-white text-gray-700 border-gray-300 ${o.idle}`
                                                        }`}
                                                    >
                                                        <span>{o.icon}</span>
                                                        {o.value}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* الملاحظات */}
                                    <div>
                                        <label
                                            htmlFor="notes"
                                            className="block text-sm font-semibold text-gray-800 mb-2"
                                        >
                                            ملاحظات التقييم
                                        </label>
                                        <textarea
                                            id="notes"
                                            rows="3"
                                            value={currentData.notes}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    "notes",
                                                    e.target.value,
                                                )
                                            }
                                            onBlur={handleBlur}
                                            placeholder="اكتب أي ملاحظات عن أداء العميل..."
                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 placeholder:text-gray-400"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleLock}
                                        disabled={!currentData.evaluation}
                                        className="mx-auto block px-6 py-3 rounded-xl text-sm font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{
                                            backgroundColor: "#059669",
                                            color: "#ffffff",
                                        }}
                                    >
                                        حفظ التقييم وإغلاقه ✓
                                    </button>
                                </>
                            )}
                        </div>

                        {/* التنقل */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                السابق
                            </button>
                            <span
                                dir="ltr"
                                className="text-xs font-semibold text-gray-500"
                            >
                                {currentIndex + 1} / {total}
                            </span>
                            {currentIndex === total - 1 ? (
                                <Link
                                    href={route("tests.index")}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                    style={{
                                        backgroundColor: "#059669",
                                        color: "#ffffff",
                                    }}
                                >
                                    إنهاء التقييم ✓
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    style={{
                                        backgroundColor: "#111827",
                                        color: "#ffffff",
                                    }}
                                    className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                                >
                                    التالي ←
                                </button>
                            )}
                        </div>
                    </section>
                </main>

                {/* معاينة الصور */}
                {previewImage && (
                    <div
                        className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
                        onClick={() => setPreviewImage(null)}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div
                            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setPreviewImage(null)}
                                aria-label="إغلاق"
                                className="absolute top-4 left-4 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/80 z-10"
                            >
                                ✕
                            </button>
                            <img
                                src={previewImage}
                                alt="معاينة المرفق"
                                className="max-w-full max-h-[85vh] object-contain rounded-xl"
                            />
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
