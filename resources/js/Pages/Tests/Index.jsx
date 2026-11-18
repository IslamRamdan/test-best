import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    CalendarDays,
    Clock,
    MapPin,
    ClipboardList,
    X,
    Users,
} from "lucide-react";

export default function Index({ auth, tests, filters = {}, flash }) {
    const search = filters.search || "";

    const handleSearch = (e) => {
        router.get(
            route("tests.index"),
            {
                search: e.target.value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const deleteTest = (id) => {
        if (!confirm("هل أنت متأكد من حذف هذا الاختبار؟")) {
            return;
        }

        router.delete(route("tests.destroy", id), {
            preserveScroll: true,
        });
    };

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

    return (
        <AuthenticatedLayout user={auth.user} header="الاختبارات">
            <Head title="الاختبارات" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                                    <ClipboardList className="w-7 h-7 text-blue-600" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        الاختبارات
                                    </h1>

                                    <p className="text-sm text-gray-500 mt-1">
                                        إدارة مواعيد وأماكن الاختبارات
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={route("tests.create")}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                <Plus className="w-5 h-5" />
                                إضافة اختبار
                            </Link>
                        </div>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
                            {flash.success}
                        </div>
                    )}

                    {/* Search */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6">
                        <div className="relative max-w-xl">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={handleSearch}
                                placeholder="ابحث باسم الاختبار أو المكان..."
                                className="w-full pr-12 pl-10 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.get(route("tests.index"))
                                    }
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">
                                            الاختبار
                                        </th>

                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 text-center">
                                            عدد العملاء
                                        </th>

                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">
                                            التاريخ
                                        </th>

                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">
                                            الوقت
                                        </th>

                                        <th className="px-6 py-4 text-sm font-bold text-gray-600">
                                            المكان
                                        </th>

                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 text-center">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {tests.data?.length > 0 ? (
                                        tests.data.map((test) => (
                                            <tr
                                                key={test.id}
                                                className="hover:bg-gray-50 transition"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                                                            <ClipboardList className="w-5 h-5 text-blue-600" />
                                                        </div>

                                                        <div>
                                                            <div className="font-bold text-gray-800">
                                                                {test.name}
                                                            </div>

                                                            <div className="text-xs text-gray-400 mt-1">
                                                                اختبار #
                                                                {test.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="inline-flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-100 px-3 py-2">
                                                        <Users className="w-4 h-4 text-teal-600" />

                                                        <span className="text-sm font-black text-teal-700">
                                                            {test.clients_count ??
                                                                0}
                                                        </span>

                                                        <span className="text-xs font-semibold text-teal-500">
                                                            عميل
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <CalendarDays className="w-4 h-4 text-blue-500" />
                                                        {formatDate(
                                                            test.test_date,
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Clock className="w-4 h-4 text-green-500" />
                                                        {formatTime(
                                                            test.test_time,
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <MapPin className="w-4 h-4 text-red-500" />
                                                        <span>
                                                            {test.location}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={route(
                                                                "tests.show",
                                                                test.id,
                                                            )}
                                                            className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"
                                                            title="عرض"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </Link>

                                                        <Link
                                                            href={route(
                                                                "tests.edit",
                                                                test.id,
                                                            )}
                                                            className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition"
                                                            title="تعديل"
                                                        >
                                                            <Pencil className="w-5 h-5" />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteTest(
                                                                    test.id,
                                                                )
                                                            }
                                                            className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition"
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                                        <ClipboardList className="w-8 h-8 text-gray-400" />
                                                    </div>

                                                    <h3 className="font-bold text-gray-700 text-lg">
                                                        لا توجد اختبارات
                                                    </h3>

                                                    <p className="text-sm text-gray-400 mt-1">
                                                        لم يتم إضافة أي اختبارات
                                                        حتى الآن
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {tests.links && tests.links.length > 3 && (
                            <div className="px-6 py-5 border-t border-gray-100 flex flex-wrap justify-center gap-2">
                                {tests.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || "#"}
                                        preserveScroll
                                        className={`px-4 py-2 rounded-xl text-sm font-medium ${
                                            link.active
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        } ${
                                            !link.url
                                                ? "opacity-50 pointer-events-none"
                                                : ""
                                        }`}
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
        </AuthenticatedLayout>
    );
}
