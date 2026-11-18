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
        Schema::create('client_test', function (Blueprint $table) {
            $table->id();

            $table->foreignId('client_id')
                ->constrained('clients')
                ->cascadeOnDelete();

            $table->foreignId('test_id')
                ->constrained('tests')
                ->cascadeOnDelete();

            $table->unsignedInteger('code')->nullable();

            $table->enum('evaluation', [
                'مقبول',
                'احتياطي',
                'راسب',
            ])->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->unique(['client_id', 'test_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_test');
    }
};
