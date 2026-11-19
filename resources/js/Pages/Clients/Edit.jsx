import React, { useEffect, useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import {
    ArrowRight,
    Upload,
    X,
    Check,
    FileText,
    ImageIcon,
    User,
    Phone,
    IdCard,
    Calendar,
    MapPin,
    Award,
    Save,
    ShieldCheck,
    RefreshCw,
    Plane,
    Users,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Visa Duration Options
|--------------------------------------------------------------------------
*/
const VISA_DURATIONS = ["3 شهور", "6 شهور"];

/*
|--------------------------------------------------------------------------
| محافظات مصر
|--------------------------------------------------------------------------
*/
const GOVERNORATES = [
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "القليوبية",
    "الشرقية",
    "الدقهلية",
    "الغربية",
    "المنوفية",
    "البحيرة",
    "كفر الشيخ",
    "دمياط",
    "بورسعيد",
    "الإسماعيلية",
    "السويس",
    "شمال سيناء",
    "جنوب سيناء",
    "الفيوم",
    "بني سويف",
    "المنيا",
    "أسيوط",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
    "البحر الأحمر",
    "الوادي الجديد",
    "مطروح",
];

// أكواد المحافظات في الرقم القومي (الخانتان 8 و9) — محافظة الميلاد
const GOVERNORATE_BY_CODE = {
    "01": "القاهرة",
    "02": "الإسكندرية",
    "03": "بورسعيد",
    "04": "السويس",
    11: "دمياط",
    12: "الدقهلية",
    13: "الشرقية",
    14: "القليوبية",
    15: "كفر الشيخ",
    16: "الغربية",
    17: "المنوفية",
    18: "البحيرة",
    19: "الإسماعيلية",
    21: "الجيزة",
    22: "بني سويف",
    23: "الفيوم",
    24: "المنيا",
    25: "أسيوط",
    26: "سوهاج",
    27: "قنا",
    28: "أسوان",
    29: "الأقصر",
    31: "البحر الأحمر",
    32: "الوادي الجديد",
    33: "مطروح",
    34: "شمال سيناء",
    35: "جنوب سيناء",
};

const AR_DIGITS = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
};

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
| Laravel قد يرجع: 2000-07-05T00:00:00.000000Z
| بينما الحقل يحتاج: 2000-07-05 (والعرض dd/mm/yyyy)
|--------------------------------------------------------------------------
*/
const formatDateForInput = (date) => {
    if (!date) return "";

    return String(date).split("T")[0];
};

// تاريخ الميلاد من الرقم القومي
const birthDateFromNationalId = (id) => {
    if (!id || !/^[23]\d{13}$/.test(id)) return "";
    const century = id[0] === "2" ? "19" : "20";
    return `${century}${id.slice(1, 3)}-${id.slice(3, 5)}-${id.slice(5, 7)}`;
};

// YYYY-MM-DD → dd/mm/yyyy
const isoToDisplay = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
};

// dd/mm/yyyy → YYYY-MM-DD (أو "" لو التاريخ غير صحيح)
const displayToIso = (display) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display || "");
    if (!m) return "";

    const [, dd, mm, yyyy] = m;
    const d = new Date(+yyyy, +mm - 1, +dd);

    const valid =
        d.getFullYear() === +yyyy &&
        d.getMonth() === +mm - 1 &&
        d.getDate() === +dd;

    return valid ? `${yyyy}-${mm}-${dd}` : "";
};

// حساب العمر من YYYY-MM-DD
const calculateAge = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return null;

    const today = new Date();
    let age = today.getFullYear() - +m[1];

    const hadBirthday =
        today.getMonth() + 1 > +m[2] ||
        (today.getMonth() + 1 === +m[2] && today.getDate() >= +m[3]);

    if (!hadBirthday) age--;

    return age >= 0 && age < 130 ? age : null;
};

// العمر بالتفصيل: سنين وشهور وأيام
const calculateAgeDetails = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    if (!m) return null;

    const today = new Date();
    let years = today.getFullYear() - +m[1];
    let months = today.getMonth() + 1 - +m[2];
    let days = today.getDate() - +m[3];

    if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return years >= 0 && years < 130 ? { years, months, days } : null;
};

/*
|--------------------------------------------------------------------------
| Input Field
|--------------------------------------------------------------------------
| خارج Edit حتى لا يفقد الـ input الـ focus أثناء الكتابة.
|--------------------------------------------------------------------------
*/
const InputField = ({
    label,
    icon: Icon,
    required = false,
    error,
    children,
    className = "",
}) => {
    return (
        <div className={className}>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                {Icon && (
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500">
                        <Icon className="w-4 h-4" />
                    </span>
                )}

                <span>
                    {label}

                    {required && <span className="text-red-500 mr-1">*</span>}
                </span>
            </label>

            {children}

            {error && (
                <div className="mt-1.5 text-xs font-medium text-red-500">
                    {error}
                </div>
            )}
        </div>
    );
};

/*
|--------------------------------------------------------------------------
| Edit
|--------------------------------------------------------------------------
*/
export default function Edit({ client, delegates = [] }) {
    const delegatesList = Array.isArray(delegates) ? delegates : [];

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */
    const { data, setData, post, processing, errors } = useForm({
        _method: "PUT",

        name: client.name || "",
        phone: client.phone || "",
        national_id: client.national_id || "",
        birth_date: formatDateForInput(client.birth_date),
        governorate: client.governorate || "",
        license_grade: client.license_grade || "",
        visa_duration: client.visa_duration || "",
        delegate_id: client.delegate_id ? String(client.delegate_id) : "",

        personal_photo: null,
        national_id_front: null,
        license_photo: null,

        remove_personal_photo: false,
        remove_national_id_front: false,
        remove_license_photo: false,
    });

    const inputBase =
        "w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

    /*
    |--------------------------------------------------------------------------
    | Birth Date (dd/mm/yyyy) + Age
    |--------------------------------------------------------------------------
    */
    const [birthInput, setBirthInput] = useState(
        isoToDisplay(formatDateForInput(client.birth_date)),
    );

    // مزامنة لو التاريخ اتغير من برا (الرقم القومي)
    useEffect(() => {
        if (displayToIso(birthInput) !== data.birth_date) {
            setBirthInput(isoToDisplay(data.birth_date));
        }
    }, [data.birth_date]);

    const handleBirthChange = (value) => {
        const digits = value
            .replace(/[٠-٩]/g, (d) => AR_DIGITS[d])
            .replace(/\D/g, "")
            .slice(0, 8);

        let out = digits;
        if (digits.length > 4) {
            out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
        } else if (digits.length > 2) {
            out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        }

        setBirthInput(out);
        setData("birth_date", displayToIso(out));
    };

    const age = calculateAge(data.birth_date);
    const isOver45 = age !== null && age > 45;
    const ageDetails = calculateAgeDetails(data.birth_date);

    /*
    |--------------------------------------------------------------------------
    | National ID → Birth Date + Governorate
    |--------------------------------------------------------------------------
    */
    const handleNationalIdChange = (value) => {
        const digits = value
            .replace(/[٠-٩]/g, (d) => AR_DIGITS[d])
            .replace(/\D/g, "")
            .slice(0, 14);

        const updates = { national_id: digits };

        if (digits.length === 14) {
            const birth = birthDateFromNationalId(digits);

            // نتأكد إن التاريخ صحيح فعلًا (مثلًا مش 31/02)
            if (birth && displayToIso(isoToDisplay(birth))) {
                updates.birth_date = birth;
            }

            const gov = GOVERNORATE_BY_CODE[digits.slice(7, 9)];
            if (gov) {
                updates.governorate = gov;
            }
        }

        setData((prev) => ({ ...prev, ...updates }));
    };

    // قيمة قديمة لمدة التأشيرة لم تعد متاحة
    const legacyVisa =
        data.visa_duration && !VISA_DURATIONS.includes(data.visa_duration);

    /*
    |--------------------------------------------------------------------------
    | Previews
    |--------------------------------------------------------------------------
    */
    const [previews, setPreviews] = useState({
        personal_photo: client.personal_photo
            ? `/storage/${client.personal_photo}`
            : null,

        national_id_front: client.national_id_front
            ? `/storage/${client.national_id_front}`
            : null,

        license_photo: client.license_photo
            ? `/storage/${client.license_photo}`
            : null,
    });

    const [newFiles, setNewFiles] = useState({
        personal_photo: false,
        national_id_front: false,
        license_photo: false,
    });

    /*
    |--------------------------------------------------------------------------
    | Handle File Change
    |--------------------------------------------------------------------------
    */
    const handleFileChange = (field, file) => {
        if (!file) return;

        setData((prev) => ({
            ...prev,
            [field]: file,
            [`remove_${field}`]: false,
        }));

        const previewUrl = URL.createObjectURL(file);

        setPreviews((prev) => ({
            ...prev,
            [field]: previewUrl,
        }));

        setNewFiles((prev) => ({
            ...prev,
            [field]: true,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Remove File
    |--------------------------------------------------------------------------
    */
    const removeFile = (field) => {
        setData((prev) => ({
            ...prev,
            [field]: null,
            [`remove_${field}`]: true,
        }));

        setPreviews((prev) => ({
            ...prev,
            [field]: null,
        }));

        setNewFiles((prev) => ({
            ...prev,
            [field]: false,
        }));
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */
    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("clients.update", client.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Document Fields
    |--------------------------------------------------------------------------
    */
    const documentFields = [
        {
            id: "national_id_front",
            label: "بطاقة الرقم القومي",
            description: "صورة واضحة لوجه البطاقة",
        },
        {
            id: "license_photo",
            label: "رخصة القيادة",
            description: "صورة واضحة لرخصة القيادة",
        },
        {
            id: "personal_photo",
            label: "الصورة الشخصية",
            description: "صورة شخصية واضحة للعميل",
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */
    return (
        <AuthenticatedLayout>
            <div dir="rtl" className="min-h-screen bg-slate-50 text-slate-800">
                <form onSubmit={handleSubmit}>
                    {/* ================= HEADER ================= */}

                    <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="min-h-[76px] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={route("clients.index")}
                                        className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>

                                    <div>
                                        <h1 className="text-lg font-extrabold text-slate-900">
                                            تعديل بيانات العميل
                                        </h1>

                                        <p className="text-xs text-slate-500 mt-1">
                                            تحديث البيانات الشخصية والمستندات
                                            الخاصة بالعميل
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route("clients.index")}
                                        className="hidden sm:flex items-center justify-center px-5 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition"
                                    >
                                        إلغاء
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-2 px-5 h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                جاري الحفظ...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                حفظ التعديلات
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ================= CONTENT ================= */}

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
                        {/* ===== PROFILE CARD ===== */}

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                            <div className="h-1.5 bg-teal-600" />

                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                    <div className="relative shrink-0">
                                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                            {previews.personal_photo ? (
                                                <img
                                                    src={
                                                        previews.personal_photo
                                                    }
                                                    alt={data.name || "العميل"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <User className="w-12 h-12 text-slate-300" />
                                                </div>
                                            )}
                                        </div>

                                        <label
                                            htmlFor="personal-photo"
                                            className="absolute -bottom-2 -left-2 flex items-center justify-center w-9 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-4 border-white cursor-pointer shadow-sm transition"
                                        >
                                            <Upload className="w-4 h-4" />

                                            <input
                                                id="personal-photo"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    handleFileChange(
                                                        "personal_photo",
                                                        e.target.files?.[0],
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>

                                    <div className="flex-1 text-center sm:text-right">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                            <h2 className="text-xl font-extrabold text-slate-900">
                                                {data.name || "اسم العميل"}
                                            </h2>

                                            <span className="inline-flex items-center gap-1.5 self-center sm:self-auto px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                بيانات العميل
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                                <Phone className="w-4 h-4 text-teal-600" />

                                                <span
                                                    dir="ltr"
                                                    className="text-xs font-semibold text-slate-700"
                                                >
                                                    {data.phone ||
                                                        "لا يوجد رقم هاتف"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                                <IdCard className="w-4 h-4 text-teal-600" />

                                                <span
                                                    dir="ltr"
                                                    className="text-xs font-semibold text-slate-700"
                                                >
                                                    {data.national_id ||
                                                        "لا يوجد رقم قومي"}
                                                </span>
                                            </div>
                                        </div>

                                        {errors.personal_photo && (
                                            <div className="mt-3 text-xs text-red-500 font-medium">
                                                {errors.personal_photo}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ===== DOCUMENTS ===== */}

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
                            <div className="px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-extrabold text-slate-900">
                                            المستندات
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            صور المستندات الشخصية
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                                {documentFields.map((field) => {
                                    const hasPreview = previews[field.id];

                                    const isNew = newFiles[field.id];

                                    return (
                                        <div
                                            key={field.id}
                                            className="space-y-2"
                                        >
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700">
                                                    {field.label}
                                                </label>

                                                <p className="text-[11px] text-slate-400 mt-1">
                                                    {field.description}
                                                </p>
                                            </div>

                                            {hasPreview ? (
                                                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                                                    <div className="relative h-44 bg-slate-100">
                                                        <img
                                                            src={hasPreview}
                                                            alt={field.label}
                                                            className="w-full h-full object-cover"
                                                        />

                                                        <div className="absolute top-2 right-2">
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur ${
                                                                    isNew
                                                                        ? "bg-teal-600 text-white"
                                                                        : "bg-white/90 text-slate-700"
                                                                }`}
                                                            >
                                                                {isNew ? (
                                                                    <>
                                                                        <Check className="w-3 h-3" />
                                                                        صورة
                                                                        جديدة
                                                                    </>
                                                                ) : (
                                                                    "الصورة الحالية"
                                                                )}
                                                            </span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeFile(
                                                                    field.id,
                                                                )
                                                            }
                                                            className="absolute top-2 left-2 flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm transition"
                                                            title="إزالة الصورة"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="p-3 flex items-center justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-slate-700 truncate">
                                                                {data[field.id]
                                                                    ?.name ||
                                                                    "المستند المرفق"}
                                                            </p>

                                                            <p className="text-[10px] text-slate-400 mt-1">
                                                                يمكنك استبدال
                                                                الصورة بصورة
                                                                أخرى
                                                            </p>
                                                        </div>

                                                        <label
                                                            htmlFor={`file-${field.id}`}
                                                            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 text-slate-600 text-[11px] font-bold cursor-pointer transition"
                                                        >
                                                            <RefreshCw className="w-3.5 h-3.5" />
                                                            تغيير
                                                            <input
                                                                id={`file-${field.id}`}
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    handleFileChange(
                                                                        field.id,
                                                                        e.target
                                                                            .files?.[0],
                                                                    )
                                                                }
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor={`file-${field.id}`}
                                                    className="flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 hover:bg-teal-50/40 hover:border-teal-400 cursor-pointer transition group"
                                                >
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 group-hover:text-teal-600 group-hover:border-teal-200 transition mb-2">
                                                        <Upload className="w-5 h-5" />
                                                    </div>

                                                    <span className="text-xs font-bold text-slate-600 group-hover:text-teal-700">
                                                        رفع صورة
                                                    </span>

                                                    <span className="text-[10px] text-slate-400 mt-1">
                                                        PNG أو JPG أو JPEG
                                                    </span>

                                                    <input
                                                        id={`file-${field.id}`}
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) =>
                                                            handleFileChange(
                                                                field.id,
                                                                e.target
                                                                    .files?.[0],
                                                            )
                                                        }
                                                    />
                                                </label>
                                            )}

                                            {errors[field.id] && (
                                                <p className="text-xs text-red-500 font-medium">
                                                    {errors[field.id]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="px-5 pb-5">
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />

                                    <p className="text-[11px] leading-5 text-blue-700">
                                        تأكد من أن صور المستندات واضحة وكاملة
                                        قبل حفظ التعديلات.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ===== BASIC DATA ===== */}

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-600">
                                        <FileText className="w-5 h-5" />
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-extrabold text-slate-900">
                                            البيانات الأساسية
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            البيانات الشخصية ومعلومات التواصل
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {/* NAME */}
                                    <InputField
                                        label="اسم العميل"
                                        icon={User}
                                        required
                                        error={errors.name}
                                    >
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            placeholder="اكتب اسم العميل"
                                            autoComplete="name"
                                            className={inputBase}
                                        />
                                    </InputField>

                                    {/* PHONE */}
                                    <InputField
                                        label="رقم الهاتف"
                                        icon={Phone}
                                        required
                                        error={errors.phone}
                                    >
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData("phone", e.target.value)
                                            }
                                            placeholder="01xxxxxxxxx"
                                            dir="ltr"
                                            inputMode="numeric"
                                            autoComplete="tel"
                                            className={`${inputBase} font-mono text-left`}
                                        />
                                    </InputField>

                                    {/* NATIONAL ID */}
                                    <InputField
                                        label="الرقم القومي"
                                        icon={IdCard}
                                        required
                                        error={errors.national_id}
                                    >
                                        <input
                                            type="text"
                                            maxLength={14}
                                            value={data.national_id}
                                            onChange={(e) =>
                                                handleNationalIdChange(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="أدخل الرقم القومي المكون من 14 رقمًا"
                                            dir="ltr"
                                            inputMode="numeric"
                                            autoComplete="off"
                                            className={`${inputBase} font-mono text-left`}
                                        />
                                    </InputField>

                                    {/* BIRTH DATE */}
                                    <InputField
                                        label="تاريخ الميلاد"
                                        icon={Calendar}
                                        error={errors.birth_date}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={birthInput}
                                                onChange={(e) =>
                                                    handleBirthChange(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="dd/mm/yyyy"
                                                dir="ltr"
                                                inputMode="numeric"
                                                maxLength={10}
                                                autoComplete="off"
                                                className="flex-1 min-w-0 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-mono text-left"
                                            />

                                            {age !== null && (
                                                <span
                                                    className={`shrink-0 inline-flex items-center h-11 px-4 rounded-xl border text-sm font-extrabold ${
                                                        isOver45
                                                            ? "bg-red-50 text-red-600 border-red-200"
                                                            : "bg-slate-50 text-slate-700 border-slate-200"
                                                    }`}
                                                >
                                                    {age} سنة
                                                </span>
                                            )}
                                        </div>

                                        {ageDetails && (
                                            <p
                                                className={`mt-1.5 text-[11px] font-medium ${
                                                    isOver45
                                                        ? "text-red-500"
                                                        : "text-slate-400"
                                                }`}
                                            >
                                                {ageDetails.years} سنة و{" "}
                                                {ageDetails.months} شهر و{" "}
                                                {ageDetails.days} يوم
                                            </p>
                                        )}
                                    </InputField>

                                    {/* GOVERNORATE */}
                                    <InputField
                                        label="المحافظة"
                                        icon={MapPin}
                                        error={errors.governorate}
                                    >
                                        <select
                                            value={data.governorate}
                                            onChange={(e) =>
                                                setData(
                                                    "governorate",
                                                    e.target.value,
                                                )
                                            }
                                            className={`${inputBase} cursor-pointer`}
                                        >
                                            <option value="">
                                                اختر المحافظة
                                            </option>

                                            {/* قيمة قديمة غير موجودة في القائمة: نحافظ عليها حتى لا تُمسح */}
                                            {data.governorate &&
                                                !GOVERNORATES.includes(
                                                    data.governorate,
                                                ) && (
                                                    <option
                                                        value={data.governorate}
                                                    >
                                                        {data.governorate}
                                                    </option>
                                                )}

                                            {GOVERNORATES.map((governorate) => (
                                                <option
                                                    key={governorate}
                                                    value={governorate}
                                                >
                                                    {governorate}
                                                </option>
                                            ))}
                                        </select>
                                    </InputField>

                                    {/* LICENSE */}
                                    <InputField
                                        label="درجة رخصة القيادة"
                                        icon={Award}
                                        error={errors.license_grade}
                                    >
                                        <select
                                            value={data.license_grade}
                                            onChange={(e) =>
                                                setData(
                                                    "license_grade",
                                                    e.target.value,
                                                )
                                            }
                                            className={`${inputBase} cursor-pointer`}
                                        >
                                            <option value="">
                                                اختر درجة الرخصة
                                            </option>

                                            <option value="خاصة">
                                                رخصة خاصة
                                            </option>

                                            <option value="درجة أولى">
                                                رخصة مهنية — درجة أولى
                                            </option>

                                            <option value="درجة ثانية">
                                                رخصة مهنية — درجة ثانية
                                            </option>

                                            <option value="درجة ثالثة">
                                                رخصة مهنية — درجة ثالثة
                                            </option>

                                            <option value="قيادة معدات ثقيلة">
                                                رخصة قيادة معدات ثقيلة
                                            </option>

                                            <option value="درجة دراجة نارية">
                                                رخصة دراجة نارية
                                            </option>

                                            <option value="بدون رخصة">
                                                لا يحمل رخصة
                                            </option>
                                        </select>
                                    </InputField>

                                    {/* DELEGATE */}
                                    <InputField
                                        label="المندوب المسؤول"
                                        icon={Users}
                                        error={errors.delegate_id}
                                    >
                                        <select
                                            value={data.delegate_id}
                                            onChange={(e) =>
                                                setData(
                                                    "delegate_id",
                                                    e.target.value,
                                                )
                                            }
                                            className={`${inputBase} cursor-pointer`}
                                        >
                                            <option value="">
                                                -- اختر المندوب المسؤول --
                                            </option>

                                            {delegatesList.map((delegate) => (
                                                <option
                                                    key={delegate.id}
                                                    value={delegate.id}
                                                >
                                                    {delegate.name}
                                                    {delegate.phone
                                                        ? ` (${delegate.phone})`
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </InputField>

                                    {/* VISA DURATION */}
                                    <InputField
                                        label="مدة التأشيرة"
                                        icon={Plane}
                                        error={errors.visa_duration}
                                    >
                                        <div className="grid grid-cols-2 gap-3">
                                            {VISA_DURATIONS.map((duration) => {
                                                const checked =
                                                    data.visa_duration ===
                                                    duration;

                                                return (
                                                    <label
                                                        key={duration}
                                                        className={`flex items-center gap-3 h-11 px-4 rounded-xl border text-sm font-bold cursor-pointer transition ${
                                                            checked
                                                                ? "bg-teal-50 border-teal-500 text-teal-700"
                                                                : "bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-300"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() =>
                                                                setData(
                                                                    "visa_duration",
                                                                    checked
                                                                        ? ""
                                                                        : duration,
                                                                )
                                                            }
                                                            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                        />

                                                        <span>{duration}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {legacyVisa && (
                                            <p className="mt-1.5 text-[11px] font-medium text-amber-600">
                                                القيمة الحالية (
                                                {data.visa_duration}) لم تعد
                                                متاحة، اختر 3 شهور أو 6 شهور.
                                            </p>
                                        )}
                                    </InputField>
                                </div>
                            </div>
                        </div>

                        {/* ===== BOTTOM ACTIONS ===== */}

                        <div className="flex items-center justify-end gap-3 mt-6">
                            <Link
                                href={route("clients.index")}
                                className="flex items-center justify-center px-6 h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition"
                            >
                                إلغاء
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center justify-center gap-2 px-8 h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        جاري حفظ التعديلات...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        حفظ التعديلات
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
