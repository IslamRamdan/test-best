<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'phone',
        'national_id',
        'job_title',
        'birth_date',
        'governorate',
        'personal_photo',
        'national_id_front',
        'national_id_back',
        'license_photo',
        'license_grade',
        'visa_duration',
        'delegate_id',
        'status',
        'passport_received',
        'passport_received_at',
        'passport_photo',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'passport_received'    => 'boolean',
        'passport_received_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function delegate(): BelongsTo
    {
        return $this->belongsTo(Delegate::class);
    }
}
