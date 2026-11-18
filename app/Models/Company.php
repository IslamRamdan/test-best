<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    //
    protected $fillable = [
        'name',
        'address',
        'token',
    ];
    public function users()
    {
        return $this->hasMany(User::class);
    }
    // أضف هذه الدالة داخل Class الشركة لتتمكن من جلب عملاء الشركة بسهولة
    public function clients(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Client::class);
    }
}
