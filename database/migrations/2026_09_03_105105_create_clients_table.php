<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();

            // الربط بجدول الشركات
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();

            // البيانات الشخصية
            $table->string('name');
            $table->string('phone', 20);
            $table->string('national_id', 14);
            $table->string('job_title')->nullable();                  // الوظيفة
            $table->date('birth_date')->nullable();
            $table->string('governorate')->nullable();

            // المرفقات والصور
            $table->string('personal_photo')->nullable();
            $table->string('national_id_front')->nullable();
            $table->string('national_id_back')->nullable();
            $table->string('license_photo')->nullable();

            // تفاصيل الرخصة
            $table->string('license_grade')->nullable();

            $table->timestamps();

            // منع تكرار رقم الهاتف لنفس الشركة
            $table->unique(['company_id', 'phone']);

            // منع تكرار الرقم القومي لنفس الشركة
            $table->unique(['company_id', 'national_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
