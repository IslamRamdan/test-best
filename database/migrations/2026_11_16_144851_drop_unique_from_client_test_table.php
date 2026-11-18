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
        Schema::table('client_test', function (Blueprint $table) {
            // 1. حذف الـ Foreign Keys أولاً لفك الارتباط
            $table->dropForeign(['client_id']);
            $table->dropForeign(['test_id']);

            // 2. حذف الـ Unique Index بنجاح
            $table->dropUnique('client_test_client_id_test_id_unique');

            // 3. إعادة ربط الـ Foreign Keys بدون قيد التكرار
            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
            $table->foreign('test_id')->references('id')->on('tests')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('client_test', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['test_id']);

            $table->unique(['client_id', 'test_id']);

            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();
            $table->foreign('test_id')->references('id')->on('tests')->cascadeOnDelete();
        });
    }
};
