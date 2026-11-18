import { Head, Link } from "@inertiajs/react";
import {
    Bus,
    ClipboardCheck,
    ClipboardEdit,
    MessageCircle,
    ShieldCheck,
    Repeat,
    FileBarChart,
    ListChecks,
    UserPlus,
    Award,
    ArrowLeft,
    Menu,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static marketing copy — optional auth prop passed from Inertia.   */
/* ------------------------------------------------------------------ */

const navLinks = [
    { label: "المميزات", href: "#features" },
    { label: "كيف تعمل المنصة", href: "#how-it-works" },
    { label: "المسارات", href: "#paths" },
];

const features = [
    {
        icon: MessageCircle,
        title: "تأكيد وإشعار عبر واتساب",
        description:
            "تحقق من رقم المتقدم بـ OTP، وإرسال رقم الدور وتفاصيل الاختبار تلقائيًا فور التسجيل.",
    },
    {
        icon: ShieldCheck,
        title: "صلاحيات دقيقة لكل دور",
        description:
            "موظف الإضافة، موظف الاعتماد، المقيّم، والأدمن — كل مستخدم يرى فقط ما يخصه.",
    },
    {
        icon: Repeat,
        title: "إعادة اختبار بلا تكرار بيانات",
        description:
            "كل متقدم كيان واحد بمحاولات متعددة، دون فتح ملف جديد أو فقد تاريخه السابق.",
    },
    {
        icon: FileBarChart,
        title: "تقارير وماليات جاهزة",
        description:
            "كشوف الناجحين والراسبين والمندوبين والاختبارات، مع تصدير Excel وPDF وطباعة مباشرة.",
    },
    {
        icon: ListChecks,
        title: "سجل عمليات كامل",
        description:
            "كل إضافة أو اعتماد أو تعديل نتيجة يُسجَّل باسم المستخدم وتاريخه، دون حذف أي أثر سابق.",
    },
    {
        icon: Bus,
        title: "مصمم لمواسم الحج",
        description:
            "أرقام دور تلقائية، إدارة اختبارات متعددة المدن، وتتبّع كامل من التسجيل حتى الاعتماد.",
    },
];

const workflowSteps = [
    {
        icon: UserPlus,
        title: "تسجيل المتقدم",
        description: "بياناته ومستنداته وتأكيد هاتفه في دقائق.",
    },
    {
        icon: ClipboardCheck,
        title: "اختبار أو اعتماد",
        description: "حسب المسار: تقييم مباشر أو مراجعة واعتماد.",
    },
    {
        icon: Award,
        title: "نتيجة موثقة",
        description: "قرار نهائي مسجَّل باسم المسؤول وتاريخه بدقة.",
    },
];

export default function Landing({ auth = {} }) {
    return (
        <div
            dir="rtl"
            className="min-h-screen bg-[#FAFAFC] font-tajawal text-[#0F172A]"
        >
            <Head title="تيست البيست — منصة إدارة متقدمي السائقين لخدمة الحج" />

            <NavBar auth={auth} />
            <Hero auth={auth} />
            <Paths />
            <Features />
            <HowItWorks />
            <CtaBanner auth={auth} />
            <Footer />
        </div>
    );
}

/* ------------------------------------------------------------------ */

function NavBar({ auth }) {
    return (
        <header className="border-b border-[#ECEEF5] bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3">
                    <img
                        src="/logo.jpg"
                        alt="تيست البيست"
                        className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div className="text-right">
                        <p className="font-cairo text-lg font-bold text-[#0F172A]">
                            تيست البيست
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                            منصة إدارة متقدمي السائقين لخدمة الحج
                        </p>
                    </div>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-bold text-[#475569] transition hover:text-[#0F9C86]"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {auth?.user ? (
                        <Link
                            href="/dashboard"
                            className="rounded-xl bg-[#0F9C86] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                        >
                            لوحة التحكم
                        </Link>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link
                                href="/login"
                                className="rounded-xl border border-[#E2E5F1] bg-white px-4 py-2.5 text-sm font-bold text-[#334155] transition hover:border-[#0F9C86] hover:text-[#0F9C86]"
                            >
                                تسجيل الدخول
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-xl bg-[#0F9C86] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                            >
                                إنشاء حساب
                            </Link>
                        </div>
                    )}
                    <button
                        className="rounded-lg p-2 text-[#475569] md:hidden"
                        aria-label="القائمة"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
}

function Hero({ auth }) {
    return (
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pt-20">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div className="text-center lg:text-right">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#ECFBF7] px-4 py-1.5 text-xs font-bold text-[#0F9C86]">
                        منصة متخصصة لمواسم الحج
                    </span>
                    <h1 className="mt-5 font-cairo text-4xl font-bold leading-[1.25] text-[#0F172A] sm:text-5xl">
                        من تسجيل المتقدم إلى اعتماد نتيجته، في مكان واحد
                    </h1>
                    <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-[#64748B] lg:mx-0">
                        تيست البيست تنظّم رحلة سائقي الحج كاملة: تسجيل بدون
                        اختبار للمعتمدين، أو اختبار كامل بأرقام دور تلقائية
                        وتقييم موثّق، مع ماليات وتقارير جاهزة لكل جهة.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                        {auth?.user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#0F9C86] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                لوحة التحكم
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#0F9C86] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    إنشاء حساب جديد
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#E2E5F1] bg-white px-6 py-3 text-sm font-bold text-[#334155] transition hover:border-[#0F9C86]"
                                >
                                    تسجيل الدخول
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <HeroVisual />
            </div>
        </section>
    );
}

function HeroVisual() {
    return (
        <div className="relative mx-auto max-w-md rounded-3xl border border-[#ECEEF5] bg-white p-6 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.15)]">
            <div className="flex items-center justify-between border-b border-[#ECEEF5] pb-4">
                <span className="rounded-full bg-[#ECFBF7] px-3 py-1 text-xs font-bold text-[#0F9C86]">
                    مفتوح
                </span>
                <p className="font-cairo text-sm font-bold text-[#0F172A]">
                    اختبار سائقي الحافلات — مكة
                </p>
            </div>
            <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[#F8F9FC] px-4 py-3">
                    <span className="text-xs text-[#94A3B8]">رقم الدور</span>
                    <span className="font-cairo text-sm font-bold text-[#0F172A]">
                        236
                    </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#F8F9FC] px-4 py-3">
                    <span className="text-xs text-[#94A3B8]">التاريخ</span>
                    <span className="text-sm font-bold text-[#0F172A]">
                        25/08/2026
                    </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#ECFBF7] px-4 py-3">
                    <span className="text-xs text-[#0F9C86]">الحالة</span>
                    <span className="text-sm font-bold text-[#0F9C86]">
                        ناجح
                    </span>
                </div>
            </div>
        </div>
    );
}

function Paths() {
    return (
        <section id="paths" className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="font-cairo text-3xl font-bold text-[#0F172A]">
                        مساران، لكل حالة تسجيل
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B]">
                        المنصة تفصل بين المتقدمين المعتمدين مسبقًا والمتقدمين
                        الجدد الذين يحتاجون اختبارًا فعليًا
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-[#E7E9F3] bg-[#FAFDFC] p-7">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFBF7]">
                            <ClipboardCheck className="h-7 w-7 text-[#0F9C86]" />
                        </div>
                        <h3 className="mt-4 font-cairo text-xl font-bold text-[#0F172A]">
                            تسجيل بدون اختبار
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                            للمتقدمين المعتمدين مسبقًا أو المرشّحين من جهات
                            موثوقة — إضافة بياناتهم ومستنداتهم، ثم اعتماد أو رفض
                            مباشر دون المرور بجلسة اختبار.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#E7E9F3] bg-[#FAF9FF] p-7">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F0FF]">
                            <ClipboardEdit className="h-7 w-7 text-[#7C4DFF]" />
                        </div>
                        <h3 className="mt-4 font-cairo text-xl font-bold text-[#0F172A]">
                            تسجيل باختبار
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                            يختار المتقدم اختبارًا محددًا بمدينة وموعد، يحصل على
                            رقم دور تلقائي، ويقيّمه مختص مؤهل: ناجح، راسب، أو
                            احتياطي.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Features() {
    return (
        <section id="features" className="py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="font-cairo text-3xl font-bold text-[#0F172A]">
                        كل ما تحتاجه جهة الاختبار
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B]">
                        من أول رسالة واتساب حتى آخر تقرير مالي، بدون تشتت بين
                        أدوات متفرقة
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="rounded-2xl border border-[#ECEEF5] bg-white p-6"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8F9FC]">
                                <feature.icon className="h-6 w-6 text-[#0F9C86]" />
                            </div>
                            <h3 className="mt-4 font-cairo text-base font-bold text-[#0F172A]">
                                {feature.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function HowItWorks() {
    return (
        <section id="how-it-works" className="bg-white py-16">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="font-cairo text-3xl font-bold text-[#0F172A]">
                        كيف تعمل المنصة
                    </h2>
                    <p className="mt-3 text-sm text-[#64748B]">
                        ثلاث خطوات فقط من التسجيل إلى النتيجة الموثقة
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
                    {workflowSteps.map((step, index) => (
                        <div key={step.title} className="text-center">
                            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFBF7]">
                                <step.icon className="h-7 w-7 text-[#0F9C86]" />
                            </div>
                            <h3 className="mt-4 font-cairo text-base font-bold text-[#0F172A]">
                                {step.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                                {step.description}
                            </p>
                            {index < workflowSteps.length - 1 && (
                                <div className="mt-6 hidden h-px w-full bg-[#ECEEF5] sm:block" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CtaBanner({ auth }) {
    return (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#0F172A] px-8 py-14 text-center">
                <h2 className="font-cairo text-2xl font-bold text-white sm:text-3xl">
                    جاهز لتنظيم اختبارات السائقين هذا الموسم؟
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-[#94A3B8]">
                    فعّل حساب منشأتك وابدأ بتسجيل المتقدمين خلال دقائق
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {auth?.user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0F9C86] px-7 py-3 text-sm font-bold text-white transition hover:opacity-90"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            الانتقال للوحة التحكم
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-[#0F9C86] px-7 py-3 text-sm font-bold text-white transition hover:opacity-90"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                إنشاء حساب جديد
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-transparent px-7 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                            >
                                تسجيل الدخول
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-[#ECEEF5] py-8">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-right lg:px-8">
                <div className="flex items-center gap-2">
                    <img
                        src="/logo.jpg"
                        alt="تيست البيست"
                        className="h-8 w-8 rounded-lg object-cover"
                    />
                    <span className="font-cairo text-sm font-bold text-[#0F172A]">
                        تيست البيست
                    </span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                    © 2026 تيست البيست. جميع الحقوق محفوظة.
                </p>
            </div>
        </footer>
    );
}
