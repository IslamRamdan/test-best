import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Building2,
    MapPin,
    User,
    Phone,
    Mail,
    Lock,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck,
    Users,
    Sparkles,
} from "lucide-react";

const trustPoints = [
    {
        icon: ShieldCheck,
        title: "بيانات آمنة",
        text: "بيانات منشأتك محفوظة بأمان",
    },
    {
        icon: Users,
        title: "إدارة الفريق",
        text: "حساب واحد لإدارة فريقك بالكامل",
    },
    {
        icon: CheckCircle2,
        title: "إدارة سهلة",
        text: "تابع المتقدمين والاعتمادات بسهولة",
    },
];

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: "",
        company_address: "",
        owner_name: "",
        phone: "",
        email: "",
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="إنشاء حساب منشأة — تيست البيست" />

            <div
                dir="rtl"
                className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased"
            >
                {/* HEADER */}
                <header className="px-3 pt-3 sm:px-5 sm:pt-4">
                    <div className="mx-auto flex h-[84px] max-w-[1400px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 shadow-sm sm:px-7">
                        <Link href="/" className="flex items-center gap-3.5">
                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-brand-teal-light">
                                <img
                                    src="/logo.jpg"
                                    alt="تيست البيست"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="hidden sm:block">
                                <h1 className="text-xl font-extrabold leading-none text-brand-teal">
                                    تيست البيست
                                </h1>

                                <p className="mt-1 text-sm font-semibold text-slate-500">
                                    منصة إدارة متقدمي السائقين لخدمة الحج
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/login"
                            className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-brand-teal hover:text-brand-teal"
                        >
                            <span className="hidden sm:inline">
                                لديك حساب؟ تسجيل الدخول
                            </span>

                            <span className="sm:hidden">تسجيل الدخول</span>

                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </div>
                </header>

                {/* MAIN */}
                <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-brand-teal/5 blur-3xl" />
                    <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-brand-purple/5 blur-3xl" />

                    <div className="relative mx-auto max-w-[1180px]">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
                            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                                {/* BRAND SIDE */}
                                <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-teal-light via-white to-brand-purple-light p-10 lg:block">
                                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[35px] border-brand-teal/5" />
                                    <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full border-[45px] border-brand-purple/5" />

                                    <div className="relative flex h-full flex-col justify-between">
                                        <div>
                                            <div className="mb-8 flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-3xl bg-white p-1 text-brand-teal shadow-[0_8px_25px_rgba(0,122,120,0.10)]">
                                                <img
                                                    src="/logo.jpg"
                                                    alt="تيست البيست"
                                                    className="h-full w-full rounded-2xl object-cover"
                                                />
                                            </div>

                                            <h3 className="text-3xl font-extrabold leading-snug text-slate-900">
                                                ابدأ رحلتك مع
                                                <span className="block font-black text-brand-teal text-4xl mt-1">
                                                    تيست البيست
                                                </span>
                                            </h3>

                                            <p className="mt-4 text-base font-semibold leading-8 text-slate-600">
                                                أنشئ حساب منشأتك واستمتع بمنصة
                                                متكاملة لإدارة متقدمي السائقين
                                                وتنظيم عمليات التسجيل والاختبار
                                                والاعتماد.
                                            </p>
                                        </div>

                                        <div className="mt-10 space-y-4">
                                            {trustPoints.map(
                                                ({
                                                    icon: Icon,
                                                    title,
                                                    text,
                                                }) => (
                                                    <div
                                                        key={title}
                                                        className="flex items-center gap-4 rounded-2xl border border-white bg-white/90 p-4 shadow-sm"
                                                    >
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-teal-light text-brand-teal">
                                                            <Icon className="h-6 w-6" />
                                                        </div>

                                                        <div>
                                                            <p className="text-base font-bold text-slate-800">
                                                                {title}
                                                            </p>
                                                            <p className="mt-0.5 text-sm font-semibold text-slate-500">
                                                                {text}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-500">
                                            <Sparkles className="h-5 w-5 text-brand-purple" />
                                            <span>
                                                منصة متخصصة لخدمة قطاع النقل
                                                والحج
                                            </span>
                                        </div>
                                    </div>
                                </aside>

                                {/* FORM SIDE */}
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
                                                <p className="text-lg font-extrabold text-brand-teal">
                                                    تيست البيست
                                                </p>
                                                <p className="text-xs font-semibold text-slate-500">
                                                    منصة إدارة متقدمي السائقين
                                                </p>
                                            </div>
                                        </div>

                                        {/* Form Heading */}
                                        <div className="mb-8">
                                            <div className="mb-3 flex items-center gap-2">
                                                <span className="h-2 w-8 rounded-full bg-brand-teal" />
                                                <span className="h-2 w-3.5 rounded-full bg-brand-purple" />
                                            </div>

                                            <h3 className="text-2xl font-extrabold text-slate-900">
                                                بيانات المنشأة
                                            </h3>

                                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                                أدخل البيانات التالية لإنشاء
                                                حساب منشأتك
                                            </p>
                                        </div>

                                        <form
                                            className="space-y-7"
                                            onSubmit={submit}
                                        >
                                            <div className="space-y-5">
                                                <SectionTitle>
                                                    معلومات المنشأة
                                                </SectionTitle>

                                                <Field
                                                    icon={Building2}
                                                    label="اسم الشركة"
                                                    value={data.company_name}
                                                    onChange={(value) =>
                                                        setData(
                                                            "company_name",
                                                            value,
                                                        )
                                                    }
                                                    placeholder="اسم المنشأة كاملًا"
                                                    error={errors.company_name}
                                                />

                                                <Field
                                                    icon={MapPin}
                                                    label="عنوان الشركة"
                                                    value={data.company_address}
                                                    onChange={(value) =>
                                                        setData(
                                                            "company_address",
                                                            value,
                                                        )
                                                    }
                                                    placeholder="المدينة والحي والشارع"
                                                    error={
                                                        errors.company_address
                                                    }
                                                />
                                            </div>

                                            <div className="border-t border-slate-200 pt-7">
                                                <div className="mb-5">
                                                    <SectionTitle>
                                                        بيانات المسؤول
                                                    </SectionTitle>
                                                </div>

                                                <div className="space-y-5">
                                                    <Field
                                                        icon={User}
                                                        label="اسم المالك"
                                                        value={data.owner_name}
                                                        onChange={(value) =>
                                                            setData(
                                                                "owner_name",
                                                                value,
                                                            )
                                                        }
                                                        placeholder="الاسم الثلاثي"
                                                        error={
                                                            errors.owner_name
                                                        }
                                                    />

                                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                        <Field
                                                            icon={Phone}
                                                            label="رقم الهاتف"
                                                            value={data.phone}
                                                            onChange={(value) =>
                                                                setData(
                                                                    "phone",
                                                                    value,
                                                                )
                                                            }
                                                            placeholder="05xxxxxxxx"
                                                            dir="ltr"
                                                            error={errors.phone}
                                                        />

                                                        <Field
                                                            icon={Mail}
                                                            label="البريد الإلكتروني"
                                                            type="email"
                                                            value={data.email}
                                                            onChange={(value) =>
                                                                setData(
                                                                    "email",
                                                                    value,
                                                                )
                                                            }
                                                            placeholder="example@domain.com"
                                                            dir="ltr"
                                                            error={errors.email}
                                                        />
                                                    </div>

                                                    <Field
                                                        icon={Lock}
                                                        label="كلمة السر"
                                                        type="password"
                                                        value={data.password}
                                                        onChange={(value) =>
                                                            setData(
                                                                "password",
                                                                value,
                                                            )
                                                        }
                                                        placeholder="••••••••"
                                                        error={errors.password}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-brand-teal px-6 py-4 text-base font-extrabold text-white shadow-[0_8px_20px_rgba(0,122,120,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                        <span>
                                                            جاري إنشاء الحساب...
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            إنشاء الحساب
                                                        </span>
                                                        <ArrowLeft className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-1" />
                                                    </>
                                                )}
                                            </button>
                                        </form>

                                        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                                            <p className="text-sm font-semibold text-slate-600">
                                                لديك حساب بالفعل؟
                                                <Link
                                                    href="/login"
                                                    className="mr-2 font-extrabold text-brand-purple transition hover:opacity-80 hover:underline"
                                                >
                                                    تسجيل الدخول
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-sm font-bold text-slate-500">
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

function SectionTitle({ children }) {
    return (
        <div className="flex items-center gap-2.5">
            <span className="h-5 w-1.5 rounded-full bg-brand-teal" />
            <p className="text-sm font-extrabold text-slate-800">{children}</p>
        </div>
    );
}

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
            <label className="mb-2 block text-sm font-extrabold text-slate-800">
                {label}
            </label>

            <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition-colors duration-200 group-focus-within:text-brand-teal">
                    <Icon className="h-5 w-5" />
                </div>

                <input
                    type={type}
                    dir={dir}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required
                    className={`block w-full rounded-xl border-2 bg-slate-50 py-3.5 pl-4 pr-12 text-base font-bold text-slate-900 outline-none transition-all duration-200 placeholder:font-medium placeholder:text-slate-400 ${
                        error
                            ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                            : "border-slate-200 focus:border-brand-teal focus:bg-white focus:ring-4 focus:ring-brand-teal/10"
                    }`}
                />
            </div>

            {error && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
