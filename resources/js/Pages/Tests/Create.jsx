import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ArrowRight,
    CalendarDays,
    Clock,
    MapPin,
    ClipboardList,
    Save,
} from "lucide-react";

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        test_date: "",
        test_time: "",
        location: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("tests.store"), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header="إضافة اختبار">
            <Head title="إضافة اختبار" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route("tests.index")}
                            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600"
                        >
                            <ArrowRight className="w-5 h-5" />
                            العودة للاختبارات
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <ClipboardList className="w-7 h-7 text-blue-600" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        إضافة اختبار جديد
                                    </h1>

                                    <p className="text-sm text-gray-500 mt-1">
                                        أدخل بيانات الاختبار وموعده ومكانه
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* اسم الاختبار */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    اسم الاختبار
                                </label>

                                <div className="relative">
                                    <ClipboardList className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="مثال: اختبار القيادة"
                                        className="w-full pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* التاريخ */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        تاريخ الاختبار
                                    </label>

                                    <div className="relative">
                                        <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                                        <input
                                            type="date"
                                            value={data.test_date}
                                            onChange={(e) =>
                                                setData(
                                                    "test_date",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {errors.test_date && (
                                        <p className="text-red-500 text-sm mt-2">
                                            {errors.test_date}
                                        </p>
                                    )}
                                </div>

                                {/* الوقت */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        وقت الاختبار
                                    </label>

                                    <div className="relative">
                                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                                        <input
                                            type="time"
                                            value={data.test_time}
                                            onChange={(e) =>
                                                setData(
                                                    "test_time",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {errors.test_time && (
                                        <p className="text-red-500 text-sm mt-2">
                                            {errors.test_time}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* المكان */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    مكان الاختبار
                                </label>

                                <div className="relative">
                                    <MapPin className="absolute right-4 top-4 w-5 h-5 text-gray-400" />

                                    <textarea
                                        value={data.location}
                                        onChange={(e) =>
                                            setData("location", e.target.value)
                                        }
                                        placeholder="مثال: مركز القيادة الآمنة - 15 مايو حلوان"
                                        rows="3"
                                        className="w-full pr-12 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>

                                {errors.location && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.location}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Link
                                    href={route("tests.index")}
                                    className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                                >
                                    إلغاء
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    {processing
                                        ? "جاري الحفظ..."
                                        : "حفظ الاختبار"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
