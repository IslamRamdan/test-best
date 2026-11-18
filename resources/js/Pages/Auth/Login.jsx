import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Mail,
    Lock,
    ArrowLeft,
    ShieldCheck,
    CheckCircle2,
    Users,
    Sparkles,
} from "lucide-react";

const trustPoints = [
    {
        icon: ShieldCheck,
        title: "دخول آمن",
        text: "حماية وأمان لبيانات منشأتك",
    },
    {
        icon: Users,
        title: "إدارة فريقك",
        text: "الوصول إلى جميع مستخدمي المنشأة",
    },
    {
        icon: CheckCircle2,
        title: "متابعة العمل",
        text: "تابع المتقدمين والاختبارات بسهولة",
    },
];

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="تسجيل الدخول — تيست البيست" />

            <div
                dir="rtl"
                className="min-h-screen bg-slate-50 font-sans text-slate-800"
            >
                {/* =====================================================
                    HEADER
                ====================================================== */}
                <header className="px-3 pt-3 sm:px-5 sm:pt-4">
                    <div className="mx-auto flex h-[84px] max-w-[1400px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 shadow-sm sm:px-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3.5">
                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-brand-teal-light">
                                <img
                                    src="/logo.jpg"
                                    alt="تيست البيست"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="hidden sm:block">
                                <h1 className="font-sans text-2xl font-black leading-none text-brand-teal">
                                    تيست البيست
                                </h1>

                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                    منصة إدارة متقدمي السائقين لخدمة الحج
                                </p>
                            </div>
                        </Link>

                        {/* Register */}
                        <Link
                            href="/register"
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-base font-bold text-slate-700 transition-all duration-200 hover:border-brand-teal hover:text-brand-teal"
                        >
                            <span className="hidden sm:inline">
                                ليس لديك حساب؟ إنشاء حساب
                            </span>

                            <span className="sm:hidden">إنشاء حساب</span>

                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </div>
                </header>

                {/* =====================================================
                    MAIN
                ====================================================== */}
                <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    {/* Background Decorations */}
                    <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-brand-teal/5 blur-3xl" />

                    <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-brand-purple/5 blur-3xl" />

                    <div className="relative mx-auto max-w-[1150px]">
                        {/* =================================================
                            LOGIN CARD
                        ================================================== */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                                {/* =================================================
                                    BRAND SIDE
                                ================================================== */}
                                <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-teal-light via-white to-brand-purple-light p-10 lg:block">
                                    {/* Decorative Circle */}
                                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-brand-teal/5" />

                                    <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[45px] border-brand-purple/5" />

                                    <div className="relative flex h-full flex-col justify-between">
                                        <div>
                                            {/* Main Icon / Logo Container */}
                                            <div className="mb-8 flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-3xl bg-white p-1 text-brand-teal shadow-[0_8px_25px_rgba(0,122,120,0.10)]">
                                                <img
                                                    src="/logo.jpg"
                                                    alt="تيست البيست"
                                                    className="h-full w-full rounded-2xl object-cover"
                                                />
                                            </div>

                                            <h3 className="font-sans text-3xl font-black leading-[1.5] text-slate-800">
                                                أهلاً بك مجددًا في
                                                <span className="block text-brand-teal">
                                                    تيست البيست
                                                </span>
                                            </h3>

                                            <p className="mt-4 text-base leading-8 text-slate-600">
                                                سجّل الدخول إلى حساب منشأتك
                                                للوصول إلى لوحة التحكم وإدارة
                                                المتقدمين والاختبارات
                                                والاعتمادات بسهولة.
                                            </p>
                                        </div>

                                        {/* Trust Points */}
                                        <div className="mt-10 space-y-4">
                                            {trustPoints.map(
                                                ({
                                                    icon: Icon,
                                                    title,
                                                    text,
                                                }) => (
                                                    <div
                                                        key={title}
                                                        className="flex items-center gap-4 rounded-2xl border border-white bg-white/80 p-4 shadow-sm"
                                                    >
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-teal-light text-brand-teal">
                                                            <Icon className="h-6 w-6" />
                                                        </div>

                                                        <div>
                                                            <p className="text-base font-black text-slate-800">
                                                                {title}
                                                            </p>

                                                            <p className="mt-0.5 text-sm text-slate-500">
                                                                {text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {/* Bottom */}
                                        <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
                                            <Sparkles className="h-5 w-5 text-brand-purple" />

                                            <span>
                                                منصة متخصصة لخدمة قطاع النقل
                                                والحج
                                            </span>
                                        </div>
                                    </div>
                                </aside>

                                {/* =================================================
                                    LOGIN FORM
                                ================================================== */}
                                <section className="p-6 sm:p-10 lg:p-12">
                                    <div className="mx-auto max-w-xl">
                                        {/* Mobile Logo */}
                                        <div className="mb-8 flex items-center gap-3.5 lg:hidden">
                                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-brand-teal-light">
                                                <img
                                                    src="/logo.jpg"
                                                    alt="تيست البيست"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div>
                                                <p className="font-sans text-xl font-black text-brand-teal">
                                                    تيست البيست
                                                </p>

                                                <p className="text-xs font-medium text-slate-500">
                                                    منصة إدارة متقدمي السائقين
                                                </p>
                                            </div>
                                        </div>

                                        {/* Form Heading */}
                                        <div className="mb-8">
                                            <div className="mb-3 flex items-center gap-2">
                                                <span className="h-2 w-8 rounded-full bg-brand-teal" />

                                                <span className="h-2 w-4 rounded-full bg-brand-purple" />
                                            </div>

                                            <h3 className="font-sans text-2xl font-black text-slate-800">
                                                الدخول إلى حسابك
                                            </h3>

                                            <p className="mt-1.5 text-sm text-slate-500">
                                                أدخل بيانات الدخول للمتابعة إلى
                                                لوحة التحكم
                                            </p>
                                        </div>

                                        {/* =================================================
                                            FORM
                                        ================================================== */}
                                        <form
                                            className="space-y-6"
                                            onSubmit={submit}
                                        >
                                            {/* Email */}
                                            <Field
                                                icon={Mail}
                                                label="البريد الإلكتروني"
                                                type="email"
                                                value={data.email}
                                                onChange={(value) =>
                                                    setData("email", value)
                                                }
                                                placeholder="example@domain.com"
                                                dir="ltr"
                                                error={errors.email}
                                            />

                                            {/* Password */}
                                            <Field
                                                icon={Lock}
                                                label="كلمة السر"
                                                type="password"
                                                value={data.password}
                                                onChange={(value) =>
                                                    setData("password", value)
                                                }
                                                placeholder="••••••••"
                                                error={errors.password}
                                            />

                                            {/* Remember / Forgot */}
                                            <div className="flex items-center justify-between gap-3">
                                                <label className="flex cursor-pointer items-center gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.remember}
                                                        onChange={(e) =>
                                                            setData(
                                                                "remember",
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="h-5 w-5 rounded border-slate-300 text-brand-teal focus:ring-brand-teal"
                                                    />

                                                    <span className="text-sm font-semibold text-slate-600">
                                                        تذكرني
                                                    </span>
                                                </label>

                                                <Link
                                                    href="/forgot-password"
                                                    className="text-sm font-black text-brand-purple transition hover:opacity-80 hover:underline"
                                                >
                                                    نسيت كلمة السر؟
                                                </Link>
                                            </div>

                                            {/* Submit */}
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="group mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl bg-brand-teal px-6 py-4 text-base font-black text-white shadow-[0_7px_18px_rgba(0,122,120,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_10px_25px_rgba(0,122,120,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                                                        <span>
                                                            جاري تسجيل الدخول...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            تسجيل الدخول
                                                        </span>

                                                        <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
                                                    </>
                                                )}
                                            </button>
                                        </form>

                                        {/* Register */}
                                        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                                            <p className="text-sm text-slate-600">
                                                ليس لديك حساب؟
                                                <Link
                                                    href="/register"
                                                    className="mr-1.5 font-black text-brand-purple transition hover:opacity-80 hover:underline"
                                                >
                                                    إنشاء حساب منشأة
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* =================================================
                            FOOTER
                        ================================================== */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                            <span>© 2026 تيست البيست. جميع الحقوق محفوظة.</span>

                            <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />

                            <span>منصة إدارة متقدمي السائقين</span>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

/* =========================================================
    INPUT FIELD
========================================================= */

function Field({
    icon: Icon,
    label,
    value,
    onChange,
    placeholder,
    error,
    type = "text",
    dir,
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-black text-slate-800">
                {label}
            </label>

            <div className="group relative">
                {/* Icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors duration-200 group-focus-within:text-brand-teal">
                    <Icon className="h-5 w-5" />
                </div>

                {/* Input */}
                <input
                    type={type}
                    dir={dir}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required
                    className={`block w-full rounded-xl border bg-slate-50 py-4 pl-4 pr-12 text-base text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 ${
                        error
                            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/5"
                            : "border-slate-200 focus:border-brand-teal focus:bg-white focus:ring-4 focus:ring-brand-teal/10"
                    }`}
                />
            </div>

            {/* Error */}
            {error && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
