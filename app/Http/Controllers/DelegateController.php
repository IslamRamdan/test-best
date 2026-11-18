<?php

namespace App\Http\Controllers;

use App\Models\Delegate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DelegateController extends Controller
{
    /**
     * عرض قائمة المناديب
     */
    public function index()
    {
        $delegates = Delegate::latest()->get();

        return Inertia::render('Delegates/Index', [
            'delegates' => $delegates,
        ]);
    }

    /**
     * حفظ مندوب جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:delegates,phone',
        ]);

        Delegate::create($validated);

        return redirect()->back()->with('success', 'تم إضافة المندوب بنجاح.');
    }

    /**
     * تعديل بيانات مندوب
     */
    public function update(Request $request, Delegate $delegate)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:delegates,phone,' . $delegate->id,
        ]);

        $delegate->update($validated);

        return redirect()->back()->with('success', 'تم تحديث بيانات المندوب بنجاح.');
    }

    /**
     * حذف مندوب
     */
    public function destroy(Delegate $delegate)
    {
        $delegate->delete();

        return redirect()->back()->with('success', 'تم حذف المندوب بنجاح.');
    }
}
