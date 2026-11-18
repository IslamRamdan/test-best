<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Delegate;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Test;

class ClientController extends Controller
{
    /**
     * عرض قائمة العملاء الخاصة بالشركة الحالية
     */
    public function index(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $clients = Client::where('company_id', $companyId)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('national_id', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $clients->getCollection()->transform(function ($client) {
            $client->personal_photo_url = $client->personal_photo
                ? asset('storage/' . ltrim($client->personal_photo, '/'))
                : null;

            return $client;
        });

        /*
     * اختبارات الشركة الحالية فقط
     */
        $tests = Test::where('company_id', $companyId)
            ->orderBy('test_date', 'desc')
            ->orderBy('test_time', 'desc')
            ->get([
                'id',
                'name',
                'test_date',
                'test_time',
                'location',
            ]);

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'tests' => $tests,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * عرض صفحة إنشاء عميل جديد
     */
    public function create()
    {
        return Inertia::render('Clients/Create', [
            'delegates' => Delegate::all(), // تمرير قائمة المناديب
        ]);
    }

    /**
     * حفظ العميل الجديد في قاعدة البيانات
     */
    public function store(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'job_title'         => 'nullable|string|max:255',
            'birth_date'        => 'nullable|date',
            'governorate'       => 'nullable|string|max:255',
            'license_grade'     => 'nullable|string|max:255',
            'delegate_id'       => 'nullable|exists:delegates,id', // <--- أضفنا التحقق هنا
            'visa_duration'     => [
                'nullable',
                Rule::in(['3 شهور موسمي', '3 شهور موقت', '6 شهور موقت']),
            ],
            'phone'             => [
                'required',
                'string',
                'max:20',
                Rule::unique('clients')->where(fn($q) => $q->where('company_id', $companyId)),
            ],
            'national_id'       => [
                'required',
                'string',
                'size:14',
                Rule::unique('clients')->where(fn($q) => $q->where('company_id', $companyId)),
            ],
            'personal_photo'    => 'nullable|image|mimes:jpeg,png,jpg,webp',
            'national_id_front' => 'nullable|image|mimes:jpeg,png,jpg,webp',
            'national_id_back'  => 'nullable|image|mimes:jpeg,png,jpg,webp',
            'license_photo'     => 'nullable|image|mimes:jpeg,png,jpg,webp',
        ]);

        // التعامل مع رفع الصور
        $photoFields = ['personal_photo', 'national_id_front', 'national_id_back', 'license_photo'];
        foreach ($photoFields as $field) {
            if ($request->hasFile($field)) {
                $validated[$field] = $request->file($field)->store('clients/photos', 'public');
            }
        }

        $validated['company_id'] = $companyId;

        // بما أن حقل delegate_id تم عمل Validation له، سيتم حفظه تلقائياً مع الـ validated data
        Client::create($validated);

        return redirect()->route('clients.index')->with('success', 'تم إضافة العميل بنجاح');
    }

    /**
     * عرض تفاصيل عميل محدد
     */
    public function show(Client $client)
    {
        $this->authorizeClientAccess($client);

        return Inertia::render('Clients/Show', [
            'client' => $client,
        ]);
    }

    /**
     * عرض صفحة تعديل بيانات العميل
     */
    public function edit(Client $client)
    {
        $this->authorizeClientAccess($client);

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'delegates' => Delegate::all(), // تمرير قائمة المناديب
        ]);
    }

    /**
     * تحديث بيانات العميل
     */
    public function update(Request $request, Client $client)
    {
        $this->authorizeClientAccess($client);

        $companyId = auth()->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'governorate' => 'nullable|string|max:255',
            'license_grade' => 'nullable|string|max:255',
            'delegate_id' => 'nullable|exists:delegates,id', // <--- أضفنا التحقق هنا

            'visa_duration' => [
                'nullable',
                Rule::in(['3 شهور موسمي', '3 شهور موقت', '6 شهور موقت']),
            ],

            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('clients')
                    ->where(fn($q) => $q->where('company_id', $companyId))
                    ->ignore($client->id),
            ],

            'national_id' => [
                'required',
                'string',
                'size:14',
                Rule::unique('clients')
                    ->where(fn($q) => $q->where('company_id', $companyId))
                    ->ignore($client->id),
            ],

            'personal_photo' => 'nullable|image|mimes:jpeg,png,jpg,webp',
            'national_id_front' => 'nullable|image|mimes:jpeg,png,jpg,webp',
            'national_id_back' => 'nullable|image|mimes:jpeg,png,jpg,webp',
            'license_photo' => 'nullable|image|mimes:jpeg,png,jpg,webp',
        ]);

        $photoFields = [
            'personal_photo',
            'national_id_front',
            'national_id_back',
            'license_photo',
        ];

        // نحذف حقول الصور من البيانات التي سيتم تحديثها مباشرة عبر update()
        foreach ($photoFields as $field) {
            unset($validated[$field]);
        }

        // سيتم تحديث الـ delegate_id تلقائياً لأنه ضمن الـ validated data
        $client->update($validated);

        foreach ($photoFields as $field) {
            if ($request->hasFile($field)) {
                // حذف الصورة القديمة
                if ($client->{$field}) {
                    Storage::disk('public')->delete($client->{$field});
                }

                // حفظ الصورة الجديدة
                $path = $request->file($field)->store(
                    'clients/photos',
                    'public'
                );

                // حفظ المسار في قاعدة البيانات
                $client->{$field} = $path;
            }
        }

        $client->save();

        return redirect()
            ->route('clients.index')
            ->with('success', 'تم تعديل بيانات العميل بنجاح');
    }

    /**
     * حذف العميل ومسح جميع مرفقاته من السيرفر
     */
    public function destroy(Client $client)
    {
        $this->authorizeClientAccess($client);

        // حذف ملفات الصور المرفقة
        $photoFields = ['personal_photo', 'national_id_front', 'national_id_back', 'license_photo'];
        foreach ($photoFields as $field) {
            if ($client->$field) {
                Storage::disk('public')->delete($client->$field);
            }
        }

        $client->delete();

        return redirect()->route('clients.index')->with('success', 'تم حذف العميل بنجاح');
    }

    /**
     * دالة حماية التأكد من أن العميل يتبع لنفس شركة المستخدم الحالي
     */
    private function authorizeClientAccess(Client $client): void
    {
        if ($client->company_id !== auth()->user()->company_id) {
            abort(403, 'غير مصرح لك بالوصول لهذا العميل');
        }
    }



    public function ministry(Client $client)
    {
        // التحقق من أن العميل يتبع لنفس شركة المستخدم الحالي (أمان إضافي)
        if (auth()->user()->company_id !== $client->company_id) {
            abort(403, 'غير مصرح لك بعرض هذا العقد');
        }

        // جلب بيانات الشركة مع العميل لعرضها في العقد
        $client->load('company');

        // الخيار أ: إذا كانت صفحة العقد مبنية بـ React / Inertia
        return view('Reports.ministry', [
            'client'  => $client,
            'company' => $client->company,
        ]);
    }

    /**
     * عرض عقد الشركة الخاص بالعميل
     */
    public function company(Client $client)
    {
        if (auth()->user()->company_id !== $client->company_id) {
            abort(403, 'غير مصرح لك بعرض هذا العقد');
        }

        $client->load('company');

        // الخيار أ: صفحة React / Inertia
        return view('Reports.contracts', [
            'client'  => $client,
            'company' => $client->company,
        ]);
    }
}
