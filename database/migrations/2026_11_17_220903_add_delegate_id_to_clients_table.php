<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // إضافة حقل الربط بجدول المناديب بعد حقل company_id (اختياري)
            $table->foreignId('delegate_id')
                ->nullable()
                ->after('company_id')
                ->constrained('delegates')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            // التراجع عن الإضافة وحذف الفارين كيز والعامود في حال التراجع (Rollback)
            $table->dropForeign(['delegate_id']);
            $table->dropColumn('delegate_id');
        });
    }
};
