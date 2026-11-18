<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Company;
use Illuminate\Support\Str;

class CompanyController extends Controller
{
    public function show()
    {
        $user = auth()->user();

        // جلب الشركة مع عملائها وموظفيها (المستخدمين التابعين لنفس الشركة)
        $company = Company::with([
            'clients' => function ($query) {
                $query->latest();
            },
            'users'
        ])->findOrFail($user->company_id);

        return Inertia::render('Company/Show', [
            'company' => $company,
            'clients' => $company->clients,
            'users' => $company->users,
        ]);
    }
    public function update(Request $request, Company $company)
    {
        if (auth()->user()->company_id !== $company->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'token'   => 'required|string', // التحقق من أنه مدخل ومطول 64 حرف وغير مُكرر
        ]);

        $company->update([
            'name'    => $validated['name'],
            'address' => $validated['address'] ?? null,
            'token'   => $validated['token'], // تحديث التتوكن بالقيمة التي كتبتها
        ]);

        return back()->with('success', 'تم تحديث بيانات الشركة والتوكن بنجاح');
    }
}
