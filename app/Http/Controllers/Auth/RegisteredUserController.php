<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_address' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:' . User::class,
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', Rules\Password::defaults()],
        ]);

        DB::transaction(function () use ($request, &$user) {
            // 1. إنشاء الشركة
            $company = Company::create([
                'name' => $request->company_name,
                'address' => $request->company_address,
            ]);

            // 2. إنشاء المستخدم وربطه بالشركة
            $user = User::create([
                'company_id' => $company->id,
                'name' => $request->owner_name,
                'phone' => $request->phone,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'owner',
            ]);
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
