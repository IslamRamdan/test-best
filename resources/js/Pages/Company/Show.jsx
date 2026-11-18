import React, { useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Show({ auth, company, clients, users = [] }) {
    const { flash } = usePage().props;
    const [showToken, setShowToken] = useState(false);

    // تجهيز بيانات النموذج عبر Inertia
    const { data, setData, put, processing, errors } = useForm({
        name: company.name || "",
        address: company.address || "",
        token: company.token || "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("company.update", company.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-850 leading-tight">
                    تفاصيل الشركة وموظفيها وعملائها
                </h2>
            }
        >
            <Head title={`شركة ${company.name}`} />

            <div className="py-12">
                <div
                    className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6"
                    dir="rtl"
                >
                    {/* رسالة النجاح */}
                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative shadow-sm">
                            {flash.success}
                        </div>
                    )}

                    {/* كارت معلومات الشركة ونموذج التعديل */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">
                            🏢 بيانات وإعدادات الشركة
                        </h1>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* اسم الشركة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        اسم الشركة:
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.name && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                {/* العنوان */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        العنوان:
                                    </label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    {errors.address && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.address}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* خانة إدخال وتعديل التوكن يدوياً */}
                            <div className="p-4 bg-gray-50 rounded-lg border mt-4">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        توكن العمليات (API Token):
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(!showToken)}
                                        className="text-xs text-indigo-600 hover:underline"
                                    >
                                        {showToken
                                            ? "إخفاء التوكن"
                                            : "إظهار التوكن"}
                                    </button>
                                </div>
                                <input
                                    type={showToken ? "text" : "password"}
                                    value={data.token}
                                    onChange={(e) =>
                                        setData("token", e.target.value)
                                    }
                                    placeholder="اكتب التوكن الخاص بك هنا..."
                                    className="w-full bg-white border-gray-300 rounded-md shadow-sm text-sm text-gray-800 font-mono focus:border-indigo-500 focus:ring-indigo-500"
                                    dir="ltr"
                                />
                                {errors.token && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.token}
                                    </div>
                                )}
                                <span className="text-xs text-gray-500 mt-1 block">
                                    يمكنك كتابة أو تعديل التوكن يدوياً بالشكل
                                    الذي يناسب نظامك.
                                </span>
                            </div>

                            {/* زر الحفظ */}
                            <div className="flex justify-end mt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
                                >
                                    {processing
                                        ? "جاري الحفظ..."
                                        : "حفظ التعديلات"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* جدول الموظفين (المستخدمين) المرتبطين بالشركة */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            👨‍💼 موظفو الشركة
                        </h2>

                        {users.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                لا يوجد موظفون مسجلون تابعون لهذه الشركة.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-right">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                                اسم الموظف
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                                البريد الإلكتروني
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                                تاريخ الانضمام
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((employee) => (
                                            <tr
                                                key={employee.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {employee.name}
                                                </td>
                                                <td
                                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                                    dir="ltr"
                                                >
                                                    {employee.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(
                                                        employee.created_at,
                                                    ).toLocaleDateString(
                                                        "ar-EG",
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* جدول العملاء التابعين للشركة */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            👥 قائمة العملاء المسجلين
                        </h2>

                        {clients.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                                لا يوجد عملاء مسجلين حتى الآن.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-right">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                                اسم العميل
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                                الرقم القومي
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                                رقم الهاتف
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                                الوظيفة
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                                مدة التأشيرة
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {clients.map((client) => (
                                            <tr
                                                key={client.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {client.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {client.national_id}
                                                </td>
                                                <td
                                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                                    dir="ltr"
                                                >
                                                    {client.phone}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {client.job_title || "-"}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {client.visa_duration ||
                                                            "غير محددة"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
