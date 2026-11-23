<?php

namespace App\Http\Controllers;

use App\Models\Test;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Client;
use App\Models\Delegate;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TestController extends Controller
{
    /**
     * عرض جميع الاختبارات الخاصة بالشركة
     */
    public function index(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $tests = Test::where('company_id', $companyId)
            ->withCount('clients')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                });
            })
            ->orderBy('test_date', 'desc')
            ->orderBy('test_time', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Tests/Index', [
            'tests' => $tests,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * صفحة إنشاء اختبار
     */
    public function create()
    {
        return Inertia::render('Tests/Create');
    }

    /**
     * حفظ اختبار جديد
     */
    public function store(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'test_date' => 'required|date',
            'test_time' => 'required|date_format:H:i',
            'location' => 'required|string|max:255',
        ], [
            'name.required' => 'اسم الاختبار مطلوب',
            'test_date.required' => 'تاريخ الاختبار مطلوب',
            'test_time.required' => 'وقت الاختبار مطلوب',
            'location.required' => 'مكان الاختبار مطلوب',
        ]);

        Test::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'test_date' => $validated['test_date'],
            'test_time' => $validated['test_time'],
            'location' => $validated['location'],
        ]);

        return redirect()
            ->route('tests.index')
            ->with('success', 'تم إضافة الاختبار بنجاح');
    }

    /**
     * عرض تفاصيل الاختبار
     */
    public function show(Test $test)
    {
        $this->authorizeTestAccess($test);

        return Inertia::render('Tests/Show', [
            'test' => $test,
        ]);
    }

    /**
     * صفحة تعديل الاختبار
     */
    public function edit(Test $test)
    {
        $this->authorizeTestAccess($test);

        return Inertia::render('Tests/Edit', [
            'test' => $test,
        ]);
    }

    /**
     * تحديث الاختبار
     */
    public function update(Request $request, Test $test)
    {
        $this->authorizeTestAccess($test);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'test_date' => 'required|date',
            'test_time' => 'required|date_format:H:i',
            'location' => 'required|string|max:255',
        ], [
            'name.required' => 'اسم الاختبار مطلوب',
            'test_date.required' => 'تاريخ الاختبار مطلوب',
            'test_time.required' => 'وقت الاختبار مطلوب',
            'location.required' => 'مكان الاختبار مطلوب',
        ]);

        $test->update($validated);

        return redirect()
            ->route('tests.index')
            ->with('success', 'تم تعديل الاختبار بنجاح');
    }

    /**
     * حذف الاختبار
     */
    public function destroy(Test $test)
    {
        $this->authorizeTestAccess($test);

        $test->delete();

        return redirect()
            ->route('tests.index')
            ->with('success', 'تم حذف الاختبار بنجاح');
    }

    /**
     * التأكد أن الاختبار تابع لشركة المستخدم
     */
    private function authorizeTestAccess(Test $test): void
    {
        if ($test->company_id !== auth()->user()->company_id) {
            abort(403, 'غير مصرح لك بالوصول لهذا الاختبار');
        }
    }
    public function attachClients(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $validated = $request->validate([
            'test_id' => [
                'required',
                'integer',
                'exists:tests,id',
            ],

            'client_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'client_ids.*' => [
                'integer',
                'exists:clients,id',
            ],
        ], [
            'test_id.required' => 'يجب اختيار الاختبار',
            'test_id.exists' => 'الاختبار غير موجود',

            'client_ids.required' => 'يجب تحديد عميل واحد على الأقل',
            'client_ids.min' => 'يجب تحديد عميل واحد على الأقل',

            'client_ids.*.exists' => 'أحد العملاء غير موجود',
        ]);

        /*
     * ============================================================
     * التأكد أن الاختبار تابع للشركة الحالية
     * ============================================================
     */
        $test = Test::where('company_id', $companyId)
            ->findOrFail($validated['test_id']);

        /*
     * ============================================================
     * جلب العملاء التابعين للشركة الحالية فقط
     * ============================================================
     */
        $clients = Client::where('company_id', $companyId)
            ->whereIn('id', $validated['client_ids'])
            ->get();

        /*
     * منع إضافة عميل من شركة أخرى
     */
        if ($clients->count() !== count($validated['client_ids'])) {
            abort(403, 'غير مصرح لك بإضافة أحد العملاء المحددين');
        }

        DB::transaction(function () use ($test, $clients) {

            /*
         * ========================================================
         * أكبر كود موجود داخل الاختبار
         * ========================================================
         */
            $maxCode = DB::table('client_test')
                ->where('test_id', $test->id)
                ->max('code');

            $nextCode = ((int) ($maxCode ?? 0)) + 1;

            foreach ($clients as $client) {

                /*
             * هل العميل موجود بالفعل في الاختبار؟
             */
                $alreadyExists = DB::table('client_test')
                    ->where('test_id', $test->id)
                    ->where('client_id', $client->id)
                    ->exists();

                /*
             * لو موجود بالفعل، نتجاهله
             */
                if ($alreadyExists) {
                    continue;
                }

                /*
             * إضافة العميل للاختبار
             */
                DB::table('client_test')->insert([
                    'client_id' => $client->id,
                    'test_id' => $test->id,
                    'code' => $nextCode,
                    'evaluation' => null,
                    'notes' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                if ($client->phone) {
                    $message = "أهلاً بك {$client->name} في شركة الميثاق لإلحاق العمالة بالخارج.\n"
                        . "تم تسجيلك بنجاح، رقمك في الاختبار هو: ({$nextCode}).\n"
                        . "تمنياتنا لك بالتوفيق.";
                    $this->sendSms($client->phone, $message);
                }
                $nextCode++;
            }
        });

        return back()->with(
            'success',
            'تم إضافة العملاء المحددين إلى الاختبار بنجاح'
        );
    }
    public function clients(Request $request, Test $test)
    {
        $companyId = auth()->user()->company_id;

        // التأكد أن الاختبار تابع للشركة الحالية
        if ($test->company_id !== $companyId) {
            abort(403, 'غير مصرح لك بالوصول لهذا الاختبار');
        }

        $clients = $test->clients()
            ->where('clients.company_id', $companyId)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('clients.name', 'like', "%{$search}%")
                        ->orWhere('clients.phone', 'like', "%{$search}%")
                        ->orWhere('clients.national_id', 'like', "%{$search}%")
                        ->orWhere('client_test.code', 'like', "%{$search}%");
                });
            })
            ->orderBy('client_test.code')
            ->paginate(20)
            ->withQueryString();

        $clients->getCollection()->transform(function ($client) {
            $client->personal_photo_url = $client->personal_photo
                ? asset('storage/' . ltrim($client->personal_photo, '/'))
                : null;

            return $client;
        });


        return Inertia::render('Tests/Clients', [
            'test' => $test,
            'clients' => $clients,
            'filters' => $request->only(['search']),
        ]);
    }
    public function updateEvaluation(Request $request, Test $test, Client $client)
    {
        Log::info('1. UpdateEvaluation Hit:', [
            'test_id'    => $test->id ?? null,
            'client_id'  => $client->id ?? null,
            'phone'      => $client->phone ?? null,
            'input_data' => $request->all(),
        ]);

        // 1. التحقق من صحة البيانات المدخلة
        $validated = $request->validate([
            'evaluation' => [
                'nullable',
                'string',
                Rule::in(['مقبول', 'احتياطي', 'راسب'])
            ],
            'notes' => ['nullable', 'string'],
        ]);

        // 2. تحديث بيانات الـ Pivot Table للعميل داخل هذا الاختبار تحديداً
        $test->clients()->updateExistingPivot($client->id, [
            'evaluation' => $validated['evaluation'],
            'notes'      => $validated['notes'],
        ]);

        // إرسال رسالة SMS للعميل بناءً على نتيجة التقييم
        if (!empty($validated['evaluation']) && !empty($client->phone)) {
            $message = null;

            if ($validated['evaluation'] === 'مقبول') {
                $message = "مبارك لك اجتياز الاختبار بنجاح يا {$client->name}! 🎉\n\n"
                    . "نرجو منك التوجه إلى مقر المكتب في أسرع وقت ممكن لاستكمال الأوراق والإجراءات اللازمة.\n\n"
                    . "📍 العنوان:\n"
                    . "38 شارع صلاح سالم (ربيع الجيزي سابقًا)\n"
                    . "بجوار محكمة جنوب الجيزة – برج أبو الفدا – شقة رقم 60 – الدور السادس\n\n"
                    . "📍 الموقع على الخريطة:\n"
                    . "https://maps.app.goo.gl/c7imVzdikYf3d7i89\n\n"
                    . "📞 للاستفسار: 01288000245\n\n"
                    . "مع تحياتنا،";
            } elseif ($validated['evaluation'] === 'راسب') {
                $message = "أهلاً بك يا {$client->name}،\n\n"
                    . "نشكرك على حضورك وتقديمك للاختبار، ونأسف لإبلاغك بعدم اجتياز الاختبار هذه المرة.\n"
                    . "نتمنى لك كل التوفيق والنجاح في الفرص القادمة إن شاء الله.\n\n"
                    . "مع تحياتنا،";
            }

            if ($message) {
                Log::info('2. Attempting to send SMS:', [
                    'phone'   => $client->phone,
                    'message' => $message,
                ]);

                try {
                    $smsResult = $this->sendSms($client->phone, $message);

                    Log::info('3. sendSms Executed Successfully:', [
                        'result' => $smsResult,
                    ]);
                } catch (\Throwable $e) {
                    Log::error('3. sendSms Exception Failed:', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }
        } else {
            Log::warning('2. SMS Skipped (Missing evaluation or phone):', [
                'evaluation' => $validated['evaluation'] ?? null,
                'phone'      => $client->phone ?? null,
            ]);
        }

        // 3. العودة للصفحة مع رسالة نجاح
        return back()->with('success', 'تم تحديث تقييم العميل بنجاح.');
    }
    public function destroyClient(Test $test, Client $client)
    {
        // حذف العميل وتقييمه من هذا الاختبار تحديداً (حذف السجل من جدول client_test)
        $test->clients()->detach($client->id);

        // العودة مع رسالة نجاح
        return back()->with('success', 'تم إزالة العميل وتقييمه من الاختبار بنجاح.');
    }

    public function evaluations(Test $test)
    {
        // جلب الاختبار مع كافة العملاء المسجلين فيه
        $test->load(['clients' => function ($query) {
            $query->select('clients.id', 'name', 'phone', 'national_id', 'job_title', 'license_grade', 'personal_photo', 'birth_date')
                ->withPivot('code', 'evaluation', 'notes');
        }]);

        return Inertia::render('Tests/Evaluations', [
            'test' => $test,
            'clients' => $test->clients,
        ]);
    }

    // حفظ/تحديث تقييم العميل فورياً
    public function storeEvaluation(Request $request, Test $test)
    {
        $validated = $request->validate([
            'client_id'  => 'required|exists:clients,id',
            'evaluation' => 'nullable|in:مقبول,احتياطي,راسب',
            'notes'      => 'nullable|string',
        ]);

        // تحديث البيانات في الجدول الوسيط client_test
        $test->clients()->updateExistingPivot($validated['client_id'], [
            'evaluation' => $validated['evaluation'],
            'notes'      => $validated['notes'],
        ]);

        // إرسال رسالة SMS للعميل بناءً على نتيجة التقييم
        if (!empty($validated['evaluation'])) {
            $client = Client::find($validated['client_id']);

            if ($client && !empty($client->phone)) {
                $message = null;

                if ($validated['evaluation'] === 'مقبول') {
                    $message = "مبارك لك اجتياز الاختبار بنجاح يا {$client->name}! 🎉\n\n"
                        . "نرجو منك التوجه إلى مقر المكتب في أسرع وقت ممكن لاستكمال الأوراق والإجراءات اللازمة.\n\n"
                        . "📍 العنوان:\n"
                        . "38 شارع صلاح سالم (ربيع الجيزي سابقًا)\n"
                        . "بجوار محكمة جنوب الجيزة – برج أبو الفدا – شقة رقم 60 – الدور السادس\n\n"
                        . "📍 الموقع على الخريطة:\n"
                        . "https://maps.app.goo.gl/c7imVzdikYf3d7i89\n\n"
                        . "📞 للاستفسار: 01288000245\n\n"
                        . "مع تحياتنا،";
                } elseif ($validated['evaluation'] === 'راسب') {
                    $message = "أهلاً بك يا {$client->name}،\n\n"
                        . "نشكرك على حضورك وتقديمك للاختبار، ونأسف لإبلاغك بعدم اجتياز الاختبار هذه المرة.\n"
                        . "نتمنى لك كل التوفيق والنجاح في الفرص القادمة إن شاء الله.\n\n"
                        . "📞 للاستفسار: 01288000245\n\n"
                        . "مع تحياتنا،";
                }

                if ($message) {
                    $this->sendSms($client->phone, $message);
                }
            }
        }

        return back();
    }

    public function create_client_to_test(Test $test)
    {
        return Inertia::render('Tests/CreateClient', [
            'test' => $test,
            'delegates' => Delegate::all(),
        ]);
    }
    /**
     * إنشاء عميل جديد وإضافته مباشرة للاختبار الحشالي
     */
    public function storeClient(Request $request, Test $test)
    {
        // 1. التحقق من صلاحية الوصول للاختبار
        $this->authorizeTestAccess($test);

        $companyId = auth()->user()->company_id;

        // 2. التحقق من صحة البيانات المدخلة
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'national_id'       => 'required|string|max:14',
            'phone'             => 'required|string|max:20',
            'governorate'       => 'nullable|string|max:255',
            'license_grade'     => 'nullable|string|max:100',
            "delegate_id"       => 'nullable|exists:delegates,id',
            'visa_duration'     => [
                'nullable',
                Rule::in(['3 شهور', '6 شهور']),
            ],
            'birth_date'        => 'nullable|date',
            'personal_photo'    => 'nullable|image|mimes:jpg,jpeg,png',
            'national_id_front' => 'nullable|image|mimes:jpg,jpeg,png',
            'national_id_back'  => 'nullable|image|mimes:jpg,jpeg,png',
            'license_photo'     => 'nullable|image|mimes:jpg,jpeg,png',
            'notes'             => 'nullable|string',
        ], [
            'name.required'        => 'اسم العميل مطلوب',
            'national_id.required' => 'الرقم القومي مطلوب',
            'phone.required'       => 'رقم الهاتف مطلوب',
            'personal_photo.image' => 'يجب أن تكون الصورة الشخصية ملف صورة',
        ]);

        $nextCode = null;
        $client = null;

        DB::transaction(function () use ($request, $validated, $test, $companyId, &$nextCode, &$client) {

            // 3. البحث عن العميل في قاعدة بيانات الشركة (الرقم القومي أو الهاتف)
            $client = Client::where('company_id', $companyId)
                ->where(function ($query) use ($validated) {
                    $query->where('national_id', $validated['national_id'])
                        ->orWhere('phone', $validated['phone']);
                })
                ->first();

            // 4. لو مش موجود: ننشئه. لو موجود: نستخدمه كما هو
            if (!$client) {
                $photoPaths = [];
                foreach (['personal_photo', 'national_id_front', 'national_id_back', 'license_photo'] as $key) {
                    if ($request->hasFile($key)) {
                        $photoPaths[$key] = $request->file($key)->store('clients', 'public');
                    }
                }

                $client = Client::create([
                    'company_id'    => $companyId,
                    'name'          => $validated['name'],
                    'national_id'   => $validated['national_id'],
                    'phone'         => $validated['phone'],
                    'governorate'   => $validated['governorate'] ?? null,
                    'license_grade' => $validated['license_grade'] ?? null,
                    'visa_duration' => $validated['visa_duration'] ?? null,
                    'birth_date'    => $validated['birth_date'] ?? null,
                    'delegate_id'   => $validated['delegate_id'] ?? null,
                    ...$photoPaths,
                ]);
            }

            // 5. الكود التالي داخل الاختبار (مع قفل الصفوف لتجنب تكرار الكود عند الضغط المتزامن)
            $maxCode = DB::table('client_test')
                ->where('test_id', $test->id)
                ->lockForUpdate()
                ->max('code');

            $nextCode = ((int) ($maxCode ?? 0)) + 1;

            // 6. ربط العميل (الجديد أو القديم) بالاختبار
            $test->clients()->attach($client->id, [
                'code'       => $nextCode,
                'evaluation' => null,
                'notes'      => $validated['notes'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        // 7. إرسال رسالة SMS للعميل بالرقم الكود الجديد في الاختبار
        if ($client && $client->phone && $nextCode) {
            $message = "مرحباً {$client->name}،\n"
                . "أهلاً بك في اختبارات شركة الميثاق لإلحاق العمالة بالخارج.\n"
                . "رقمك في الاختبار: [{$nextCode}]\n"
                . "يرجى الاحتفاظ بالرقم لإبرازه عند الدخول، نتمنى لك التوفيق.";

            $sendResponse = $this->sendSms($client->phone, $message);

            if (!empty($sendResponse['success']) && $sendResponse['success'] === true) {
                Log::info("Test SMS sent successfully to client: {$client->name}", [
                    'client_id' => $client->id,
                    'phone'     => $client->phone,
                    'code'      => $nextCode,
                ]);
            }
        }

        return redirect()->route('tests.clients', $test->id)
            ->with('success', 'تمت إضافة العميل للاختبار بنجاح');
    }

    private function sendSms($recipients, string $message, string $senderId = 'Elmethaq Co', ?string $scheduleTime = null)
    {
        $url = 'https://bulk.whysms.com/api/v3/sms/send';
        $apiToken = env('WHYSMS_TOKEN');

        // معالجة الأرقام لضمان وجود كود الدولة (مثال لمصر: إضافة 20 وحذف الصفر الأول)
        $formattedRecipients = collect(is_array($recipients) ? $recipients : explode(',', $recipients))
            ->map(function ($number) {
                $number = trim($number);
                // إذا كان الرقم يبدأ بـ 0 (مثل 01228815901)، استبدله بكود الدولة 20
                if (str_starts_with($number, '0')) {
                    return '20' . substr($number, 1);
                }
                return $number;
            })
            ->implode(',');

        $data = [
            'recipient' => $formattedRecipients,
            'sender_id' => $senderId,
            'type'      => 'plain',
            'message'   => $message,
        ];

        if ($scheduleTime) {
            $data['schedule_time'] = $scheduleTime;
        }

        try {
            $response = Http::withToken($apiToken)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept'       => 'application/json',
                ])
                ->post($url, $data);

            $result = $response->json();

            if ($response->successful() && isset($result['status']) && $result['status'] === 'success') {
                Log::info('WhySMS Sent Successfully:', ['recipients' => $formattedRecipients, 'response' => $result]);
                return ['success' => true, 'data' => $result['data'] ?? null];
            }

            Log::warning('WhySMS API Warning/Error:', ['recipients' => $formattedRecipients, 'response' => $result]);
            return ['success' => false, 'message' => $result['message'] ?? 'فشل في إرسال الرسالة'];
        } catch (\Exception $e) {
            Log::error('WhySMS Exception Error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    private function sendWhatsappMessage($client, string $message)
    {
        // تحقق من وجود العميل ورقم هاتفه
        if (!$client || empty($client->phone)) {
            return false;
        }

        $vendorUid = 'd8356a86-e41a-443f-8159-96ecc5ad4cee'; // استبدلها بـ Vendor UID الخاص بك أو اجعلها مُعرفة مسبقاً
        $token = 'mkvVKlPF9t2mOd4vVdwGzXqx7wtKHR0ricQbbNoC9M8WCKNArJwaEfm8gWXSaR5G';     // استبدلها بـ Bearer Token الخاص بك

        $url = "https://elmujib.com/api/{$vendorUid}/contact/send-message";
        $cleanPhone = preg_replace('/[^0-9]/', '', $client->phone);

        // نص الرسالة المختصر الذي طلبته
        $messageBody =  $message;

        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->post($url, [
                    "phone_number" => $cleanPhone, // رقم الهاتف بدون علامة + أو أصفرار زائدة حسب متطلبات الـ API
                    "message_body" => $messageBody,
                    "contact" => [
                        "first_name" => $client->name, // أو قم بفصل الاسم الأول والأخير إذا كانا مخزنين بشكل منفصل
                        "email" => $client->email ?? '',
                    ]
                ]);

            if ($response->successful() && $response->json('result') === 'success') {
                return true;
            }

            // تسجيل خطأ في حال فشل الإرسال
            Log::error('WhatsApp API Error: ' . $response->body());
            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp Exception: ' . $e->getMessage());
            return false;
        }
    }

    public function exportPassed(Test $test)
    {
        $this->authorizeTestAccess($test);

        $passedClients = $test->clients()
            ->with('delegate')
            ->get();

        $headers = [
            'الاسم',
            'الرقم القومي',
            'رقم الهاتف',
            'الوظيفة',
            'تاريخ الميلاد',
            'العمر',
            'المحافظة',
            'درجة الرخصة',
            'مدة التأشيرة',
            'المندوب',
            'هاتف المندوب',
            'الحالة',
            'استلام الجواز',
            'تاريخ استلام الجواز',
            'كود الاختبار',
            'التقييم',
        ];

        $escapeCsv = static function ($value): string {
            $str = (string) ($value ?? '');
            $str = str_replace('"', '""', $str);
            return '"' . $str . '"';
        };

        // UTF-8 BOM لضمان قراءة الحروف العربية في Excel بدون مشاكل ترميز
        $csvData = "\xEF\xBB\xBF" . implode(',', array_map($escapeCsv, $headers)) . "\n";

        foreach ($passedClients as $client) {
            $row = [
                $client->name,
                "\t" . $client->national_id, // منع Excel من تحويل الرقم القومي لصيغة علمية
                "\t" . $client->phone,       // الحفاظ على الصفر في بداية رقم الهاتف
                $client->job_title,
                $client->birth_date?->format('Y-m-d'),
                $client->age,
                $client->governorate,
                $client->license_grade,
                $client->visa_duration,
                $client->delegate?->name,
                $client->delegate?->phone ? "\t" . $client->delegate->phone : null,
                $client->status,
                $client->passport_received ? 'نعم' : 'لا',
                $client->passport_received_at?->format('Y-m-d H:i'),
                $client->pivot?->code,
                $client->pivot?->evaluation,
            ];

            $csvData .= implode(',', array_map($escapeCsv, $row)) . "\n";
        }

        $fileName = "passed_clients_test_{$test->id}.csv";

        return response($csvData)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', "attachment; filename=\"{$fileName}\"");
    }


    public function sendCustomerData(Client $client)
    {
        // العميل اتبعت قبل كده
        if ((int) $client->status === 1) {
            return response()->json([
                'success' => false,
                'message' => 'تم إرسال هذا العميل لسيستم العمليات من قبل.',
            ], 422);
        }

        $url = 'https://mintcream-giraffe-655141.hostingersite.com/api/customer';

        $companyToken = $client->company?->token;

        if (!$companyToken) {
            return response()->json([
                'success' => false,
                'message' => 'قم بربط شركتك بسيستم العمليات اولا قبل إرسال بيانات العميل.',
            ], 422);
        }

        $request = Http::timeout(30)
            ->acceptJson()
            ->asMultipart();

        $images = [
            'job_proof_image'   => $client->license_photo,
            'national_id_image' => $client->national_id_front,
            'personal_image'    => $client->personal_photo,
            'passport_image'    => $client->passport_photo,
        ];

        foreach ($images as $field => $path) {
            if ($path && Storage::disk('public')->exists($path)) {
                $request->attach(
                    $field,
                    Storage::disk('public')->get($path),
                    basename($path)
                );
            }
        }

        $fields = [
            'name_ar'        => $client->name,
            'phone'          => $client->phone,
            'birth_date'     => $client->birth_date?->format('d/m/Y'),
            'whatsapp'       => $client->phone,
            'company_token'  => $companyToken,
            'governorate'    => $client->governorate,
            'national_id'    => $client->national_id,
            'delegate_phone' => $client->delegate?->phone,
        ];

        $multipart = [];
        foreach ($fields as $name => $value) {
            if (!is_null($value) && $value !== '') {
                $multipart[] = [
                    'name'     => $name,
                    'contents' => (string) $value,
                ];
            }
        }

        try {
            $response = $request->post($url, $multipart);

            if ($response->successful()) {
                $client->update(['status' => true]);

                return response()->json([
                    'success' => true,
                    'message' => 'تم إرسال بيانات العميل بنجاح.',
                ]);
            }

            Log::warning('فشل إرسال بيانات العميل', [
                'client_id' => $client->id,
                'status'    => $response->status(),
                'body'      => $response->body(),
            ]);

            $errorMessage = $response->json('message')
                ?: Str::limit(strip_tags((string) $response->body()), 300)
                ?: "فشل الإرسال (كود الحالة: {$response->status()})";

            $apiErrors = $response->json('errors');

            // أخطاء الـ validation جاية من سيستم العمليات → 422 عشان الفرونت يعرضها
            if (is_array($apiErrors) && !empty($apiErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
                    'errors'  => $apiErrors,
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => $errorMessage,
            ], 422);
        } catch (\Throwable $e) {
            Log::error('خطأ أثناء إرسال بيانات العميل', [
                'client_id' => $client->id,
                'error'     => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'خطأ في الاتصال بسيستم العمليات: ' . $e->getMessage(),
            ], 500);
        }
    }
}
