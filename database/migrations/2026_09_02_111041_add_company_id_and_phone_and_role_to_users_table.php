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
        Schema::table('users', function (Blueprint $table) {
            //
            $table->foreignId('company_id')
                ->after('id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // إضافة رقم الهاتف
            $table->string('phone')->nullable()->unique()->after('email');

            // إضافة الـ Role
            $table->enum('role', ['owner', 'admin', 'employee'])
                ->default('employee')
                ->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn(['company_id', 'phone', 'role']);
        });
    }
};
