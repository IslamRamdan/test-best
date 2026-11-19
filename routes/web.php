<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\DelegateController;
use App\Http\Controllers\TestController;
use App\Models\Test;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    $companyId = auth()->user()->company_id;

    $tests = Test::where('company_id', $companyId)
        ->withCount('clients')
        ->with([
            'clients' => function ($query) {
                $query->select([
                    'clients.id',
                    'clients.name',
                    'clients.phone',
                    'clients.national_id',
                    'clients.job_title',
                    'clients.personal_photo',
                ]);
            },
        ])
        ->orderBy('test_date', 'desc')
        ->orderBy('test_time', 'desc')
        ->get();

    $tests->each(function ($test) {
        $test->clients->each(function ($client) {
            $client->personal_photo_url = $client->personal_photo
                ? asset('storage/' . ltrim($client->personal_photo, '/'))
                : null;
        });
    });

    return Inertia::render('Dashboard', [
        'tests' => $tests,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::middleware(['auth'])->group(function () {
    Route::resource('clients', ClientController::class);
});

Route::middleware(['auth'])->group(function () {

    Route::resource('tests', TestController::class);

    Route::get(
        'tests/{test}/clients',
        [TestController::class, 'clients']
    )->name('tests.clients');

    Route::post(
        'tests/clients/attach',
        [TestController::class, 'attachClients']
    )->name('tests.clients.attach');
    Route::patch('/tests/{test}/clients/{client}/evaluation', [TestController::class, 'updateEvaluation'])
        ->name('tests.clients.update-evaluation');

    Route::delete('/tests/{test}/clients/{client}', [TestController::class, 'destroyClient'])
        ->name('tests.clients.destroy');

    Route::get('/tests/{test}/clients/create', [TestController::class, 'create_client_to_test'])->name('tests.clients.create');

    Route::post('/tests/{test}/clients', [TestController::class, 'storeClient'])->name('tests.clients.store-new');

    Route::get('tests/{test}/evaluations-mode', [TestController::class, 'evaluations'])
        ->name('tests.evaluations');

    Route::post('tests/{test}/evaluations-mode', [TestController::class, 'storeEvaluation'])
        ->name('tests.evaluations.store');

    // مسار تحديث حالة الجواز
    Route::patch('clients/{client}/passport', [ClientController::class, 'updatePassport'])
        ->name('clients.passport.update');
});


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/company/dashboard', [CompanyController::class, 'show'])->name('company.show');
    Route::put('/company/{company}', [CompanyController::class, 'update'])->name('company.update');
});


Route::middleware(['auth', 'verified'])->group(function () {
    // مسار عقد الوزارة
    Route::get('/clients/{client}/contracts/ministry', [ClientController::class, 'ministry'])
        ->name('contracts.ministry');

    // مسار عقد الشركة
    Route::get('/clients/{client}/contracts/company', [ClientController::class, 'company'])
        ->name('contracts.company');
});
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('delegates', DelegateController::class)->except(['create', 'show', 'edit']);
});

require __DIR__ . '/auth.php';
