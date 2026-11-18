import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import {
    Users,
    UserPlus,
    Phone,
    Edit3,
    Trash2,
    ShieldCheck,
    ArrowUpLeft,
} from "lucide-react";

export default function Index({ delegates }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDelegate, setEditingDelegate] = useState(null);

    // إعداد النموذج باستخدام Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: "",
            phone: "",
        });

    // فتح نافذة الإضافة
    const openAddModal = () => {
        setEditingDelegate(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // فتح نافذة التعديل
    const openEditModal = (delegate) => {
        setEditingDelegate(delegate);
        setData({
            name: delegate.name,
            phone: delegate.phone,
        });
        clearErrors();
        setIsModalOpen(true);
    };

    // إرسال البيانات (إضافة أو تعديل)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingDelegate) {
            put(route("delegates.update", editingDelegate.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route("delegates.store"), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    // الحذف
    const handleDelete = (id) => {
        if (confirm("هل أنت متأكد من حذف هذا المندوب؟")) {
            router.delete(route("delegates.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="إدارة المناديب — تيست البيست" />

            <div className="min-h-full py-8 font-sans text-slate-900" dir="rtl">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* =====================================================
                        TITLE & HEADER
                    ====================================================== */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">
                                إدارة المناديب
                            </h2>
                            <p className="text-xs font-semibold text-slate-500">
                                يمكنك إضافة وتعديل ومتابعة مناديب النظام بكل
                                سهولة.
                            </p>
                        </div>

                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-2 self-start rounded-xl bg-brand-teal px-5 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(0,122,120,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95 sm:self-auto"
                        >
                            <UserPlus className="h-4 w-4" />
                            <span>إضافة مندوب جديد</span>
                        </button>
                    </div>

                    {/* =====================================================
                        STATS / OVERVIEW BANNER
                    ====================================================== */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:border-slate-300">
                            <div className="space-y-1">
                                <p className="text-xs font-extrabold text-slate-500">
                                    إجمالي المناديب المسجلين
                                </p>
                                <p className="text-3xl font-black text-slate-900">
                                    {delegates.length}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-teal-light text-brand-teal">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-200 hover:border-slate-300">
                            <div className="space-y-1">
                                <p className="text-xs font-extrabold text-slate-500">
                                    حالة النظام
                                </p>
                                <p className="text-lg font-black text-emerald-600 flex items-center gap-1.5 pt-1">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span>المناديب مفعلون وجاهزون</span>
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        DELEGATES TABLE CARD
                    ====================================================== */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal-light text-brand-teal">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-extrabold text-slate-900">
                                        قائمة المناديب
                                    </h4>
                                    <p className="mt-1 text-xs font-semibold text-slate-400">
                                        عرض وتحديث بيانات المناديب
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">
                                            #
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">
                                            اسم المندوب
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-extrabold uppercase tracking-wider text-slate-500">
                                            رقم الهاتف
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-extrabold uppercase tracking-wider text-slate-500">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {delegates.length > 0 ? (
                                        delegates.map((delegate, index) => (
                                            <tr
                                                key={delegate.id}
                                                className="transition hover:bg-slate-50/50"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-xs font-bold text-slate-400">
                                                    {index + 1}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-black text-slate-800">
                                                    {delegate.name}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-600 flex items-center gap-2 pt-5">
                                                    <Phone className="h-3.5 w-3.5 text-brand-teal" />
                                                    <span>
                                                        {delegate.phone}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() =>
                                                                openEditModal(
                                                                    delegate,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-600 transition hover:bg-blue-100"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                            <span>تعديل</span>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    delegate.id,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            <span>حذف</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-6 py-12 text-center text-sm font-semibold text-slate-400"
                                            >
                                                لا يوجد مناديب مضافين حالياً.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* =====================================================
                        MODAL (ADD / EDIT)
                    ====================================================== */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
                            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-8">
                                <h3 className="text-lg font-black text-slate-900 mb-4">
                                    {editingDelegate
                                        ? "تعديل بيانات المندوب"
                                        : "إضافة مندوب جديد"}
                                </h3>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                                            اسم المندوب
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-brand-teal focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-teal/20"
                                            placeholder="أدخل اسم المندوب الكامل"
                                        />
                                        {errors.name && (
                                            <div className="mt-1 text-xs font-bold text-rose-500">
                                                {errors.name}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                                            رقم الهاتف
                                        </label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData("phone", e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:border-brand-teal focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-teal/20"
                                            placeholder="05xxxxxxxx"
                                        />
                                        {errors.phone && (
                                            <div className="mt-1 text-xs font-bold text-rose-500">
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsModalOpen(false)
                                            }
                                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl bg-brand-teal px-5 py-2.5 text-xs font-extrabold text-white transition hover:opacity-90 disabled:opacity-50"
                                        >
                                            {editingDelegate
                                                ? "تحديث البيانات"
                                                : "حفظ المندوب"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
