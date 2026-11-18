<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Test extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'test_date',
        'test_time',
        'location',
    ];

    protected $casts = [
        'test_date' => 'date',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(Client::class, 'client_test')
            ->withPivot([
                'code',
                'evaluation',
                'notes',
            ])
            ->withTimestamps();
    }
}
