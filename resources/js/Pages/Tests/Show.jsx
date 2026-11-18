import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowRight,
    CalendarDays,
    Clock,
    MapPin,
    ClipboardList,
    Pencil,
    Trash2,
} from "lucide-react";

export default function Show({ auth, test }) {
    const formatDate = (date) => {
        if (!date) return "-";

        const value = String(date).split("T")[0];
        const [year, month, day] = value.split("-");

        if (!year || !month || !day) {
            return date;
        }

        return `${day}-${month}-${year}`;
    };

    const formatTime = (time) => {
        if (!time) return "-";

        return String(time).substring(0, 5);
    };

    const deleteTest = () => {
        if (!confirm("هل أنت متأكد من حذف هذا الاختبار؟")) {
            return;
        }

        router.delete(route("tests.destroy", test.id));
    };

    return (
        <AuthenticatedLayout user={auth.user} header="تفاصيل الاختبار">
            <Head title={test.name} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* العودة */}
                    <div className="mb-6">
                        <Link
                            href={route("tests.index")}
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600"
                        >
                            <ArrowRight className="w-5 h-5" />
                            العودة للاختبارات
                        </Link>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-50 p-8 border-b border-gray-100">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                                        <ClipboardList className="w-8 h-8 text-blue-600" />
                                    </div>

                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">
                                            اختبار #{test.id}
                                        </div>

                                        <h1 className="text-2xl font-bold text-gray-800">
                                            {test.name}
                                        </h1>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={route("tests.edit", test.id)}
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100"
                                    >
                                        <Pencil className="w-5 h-5" />
                                        تعديل
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={deleteTest}
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-50 text-red-700 font-semibold hover:bg-red-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        حذف
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Date */}
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                                        <CalendarDays className="w-5 h-5 text-blue-600" />
                                    </div>

                                    <div className="text-sm text-gray-400 mb-1">
                                        تاريخ الاختبار
                                    </div>

                                    <div className="font-bold text-gray-800">
                                        {formatDate(test.test_date)}
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                    <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                                        <Clock className="w-5 h-5 text-green-600" />
                                    </div>

                                    <div className="text-sm text-gray-400 mb-1">
                                        وقت الاختبار
                                    </div>

                                    <div className="font-bold text-gray-800">
                                        {formatTime(test.test_time)}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                    <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                                        <MapPin className="w-5 h-5 text-red-600" />
                                    </div>

                                    <div className="text-sm text-gray-400 mb-1">
                                        مكان الاختبار
                                    </div>

                                    <div className="font-bold text-gray-800">
                                        {test.location}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
