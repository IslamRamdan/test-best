import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import {
    ArrowRight,
    Edit3,
    User,
    Phone,
    CreditCard,
    Briefcase,
    CalendarDays,
    MapPin,
    Award,
    FileText,
    Image as ImageIcon,
    Plane,
} from "lucide-react";

/* =========================================================
   Format Date
========================================================= */
const formatDate = (date) => {
    if (!date) return null;

    const value = String(date).split("T")[0];

    const parts = value.split("-");

    if (parts.length !== 3) {
        return date;
    }

    const [year, month, day] = parts;

    return `${day}-${month}-${year}`;
};

/* =========================================================
   Info Item
========================================================= */
const InfoItem = ({ icon: Icon, label, value }) => {
    return (
        <div className="group rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition duration-200 hover:border-blue-100 hover:bg-white hover:shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-gray-500">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0a4194] shadow-sm">
                    <Icon size={17} />
                </div>

                <span className="text-xs font-medium">{label}</span>
            </div>

            <div className="pr-11 text-sm font-bold text-gray-800 break-words">
                {value || "غير متوفر"}
            </div>
        </div>
    );
};

/* =========================================================
   Document Card
========================================================= */
const DocumentCard = ({ title, image, icon: Icon }) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:shadow-md">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0a4194] shadow-sm">
                    <Icon size={17} />
                </div>

                <span className="text-sm font-bold text-gray-800">{title}</span>
            </div>

            {/* Image */}
            <div className="p-3">
                {image ? (
                    <a
                        href={`/storage/${image}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                    >
                        <img
                            src={`/storage/${image}`}
                            alt={title}
                            className="h-56 w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                        />

                        <div className="border-t border-gray-100 bg-white px-3 py-2 text-center text-xs font-semibold text-[#0a4194]">
                            اضغط لعرض الصورة بالحجم الكامل
                        </div>
                    </a>
                ) : (
                    <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-400">
                        <ImageIcon
                            size={38}
                            strokeWidth={1.5}
                            className="mb-2"
                        />

                        <span className="text-sm">لا توجد صورة</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* =========================================================
   Status Badge
========================================================= */
const StatusBadge = () => {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            بيانات العميل
        </span>
    );
};

/* =========================================================
   Show Page
========================================================= */
export default function Show({ client }) {
    return (
        <AuthenticatedLayout>
            <Head title={`بيانات العميل - ${client?.name || ""}`} />

            <div
                dir="rtl"
                className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 lg:px-8"
            >
                <div className="mx-auto max-w-7xl">
                    {/* =================================================
                        Header
                    ================================================= */}
                    <div className="sticky top-0 z-20 mb-5 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-sm backdrop-blur">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Title */}
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route("clients.index")}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:border-[#0a4194] hover:text-[#0a4194]"
                                    title="العودة"
                                >
                                    <ArrowRight size={20} />
                                </Link>

                                <div>
                                    <h1 className="text-lg font-extrabold text-gray-900 sm:text-xl">
                                        بيانات العميل
                                    </h1>

                                    <p className="mt-0.5 text-xs text-gray-500">
                                        عرض كافة بيانات العميل والمستندات
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <StatusBadge />

                                <Link
                                    href={route("clients.edit", client.id)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a4194] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#083777]"
                                >
                                    <Edit3 size={17} />
                                    تعديل
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        Profile Card
                    ================================================= */}
                    <div className="mb-5 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                        {/* Cover */}
                        <div className="relative h-28 bg-gradient-to-l from-[#0a4194] to-[#1c5eb5]">
                            <div className="absolute inset-0 opacity-10">
                                <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,white_0,transparent_45%)]" />
                            </div>
                        </div>

                        {/* Profile */}
                        <div className="relative px-5 pb-5">
                            <div className="-mt-14 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                                {/* Profile Image */}
                                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-gray-100 shadow-lg">
                                    {client?.personal_photo ? (
                                        <a
                                            href={`/storage/${client.personal_photo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <img
                                                src={`/storage/${client.personal_photo}`}
                                                alt={client.name}
                                                className="h-full w-full cursor-pointer object-cover"
                                            />
                                        </a>
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                            <User size={45} />
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="pb-1 text-center sm:text-right">
                                    <h2 className="text-xl font-extrabold text-gray-900">
                                        {client?.name || "بدون اسم"}
                                    </h2>

                                    <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gray-500 sm:justify-start">
                                        <Briefcase size={15} />

                                        {client?.job_title ||
                                            "المهنة غير محددة"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        Basic Information
                    ================================================= */}
                    <div className="mb-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                        {/* Section Header */}
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0a4194]">
                                <User size={20} />
                            </div>

                            <div>
                                <h2 className="font-extrabold text-gray-900">
                                    البيانات الأساسية
                                </h2>

                                <p className="text-xs text-gray-500">
                                    المعلومات الشخصية الخاصة بالعميل
                                </p>
                            </div>
                        </div>

                        {/* Information */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Name */}
                            <InfoItem
                                icon={User}
                                label="اسم العميل"
                                value={client?.name}
                            />

                            {/* Phone */}
                            <InfoItem
                                icon={Phone}
                                label="رقم الهاتف"
                                value={client?.phone}
                            />

                            {/* National ID */}
                            <InfoItem
                                icon={CreditCard}
                                label="الرقم القومي"
                                value={client?.national_id}
                            />

                            {/* Job */}
                            <InfoItem
                                icon={Briefcase}
                                label="الوظيفة"
                                value={client?.job_title}
                            />

                            {/* Birth Date */}
                            <InfoItem
                                icon={CalendarDays}
                                label="تاريخ الميلاد"
                                value={formatDate(client?.birth_date)}
                            />

                            {/* Governorate */}
                            <InfoItem
                                icon={MapPin}
                                label="المحافظة"
                                value={client?.governorate}
                            />

                            {/* License Grade */}
                            <InfoItem
                                icon={Award}
                                label="درجة الرخصة"
                                value={client?.license_grade}
                            />

                            {/* Visa Duration */}
                            <InfoItem
                                icon={Plane}
                                label="مدة التأشيرة"
                                value={client?.visa_duration}
                            />
                        </div>
                    </div>

                    {/* =================================================
                        Documents
                    ================================================= */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                        {/* Section Header */}
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#caa650]">
                                <FileText size={20} />
                            </div>

                            <div>
                                <h2 className="font-extrabold text-gray-900">
                                    المستندات والصور
                                </h2>

                                <p className="text-xs text-gray-500">
                                    صور المستندات المرفوعة الخاصة بالعميل
                                </p>
                            </div>
                        </div>

                        {/* Documents Grid */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Personal Photo */}
                            <DocumentCard
                                title="الصورة الشخصية"
                                image={client?.personal_photo}
                                icon={User}
                            />

                            {/* National ID Front */}
                            <DocumentCard
                                title="البطاقة الشخصية - أمامي"
                                image={client?.national_id_front}
                                icon={CreditCard}
                            />

                            {/* National ID Back */}
                            <DocumentCard
                                title="البطاقة الشخصية - خلفي"
                                image={client?.national_id_back}
                                icon={CreditCard}
                            />

                            {/* License */}
                            <DocumentCard
                                title="صورة الرخصة"
                                image={client?.license_photo}
                                icon={Award}
                            />
                        </div>
                    </div>

                    {/* =================================================
                        Bottom Actions
                    ================================================= */}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        {/* Back */}
                        <Link
                            href={route("clients.index")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                        >
                            <ArrowRight size={17} />
                            العودة للعملاء
                        </Link>

                        {/* Edit */}
                        <Link
                            href={route("clients.edit", client.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a4194] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#083777]"
                        >
                            <Edit3 size={17} />
                            تعديل بيانات العميل
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
