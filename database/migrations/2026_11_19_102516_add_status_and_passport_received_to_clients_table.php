<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // الحالة
            $table->string('status')->default('جديد')->after('license_grade');

            // هل تم استلام الجواز وتاريخ الاستلام
            $table->boolean('passport_received')->default(false)->after('status');
            $table->timestamp('passport_received_at')->nullable()->after('passport_received');

            // صورة الجواز
            $table->string('passport_photo')->nullable()->after('license_photo');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'passport_received',
                'passport_received_at',
                'passport_photo',
            ]);
        });
    }
};
