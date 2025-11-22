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
        $this->down(); // Drop the table if it exists to avoid conflicts
            Schema::create('team_members', function (Blueprint $table) {
                $table->unsignedBigInteger('team_ID');
                $table->unsignedBigInteger('user_ID');
                $table->primary(['team_ID', 'user_ID']);
                $table->timestamps();

                $table->foreign('team_ID')->references('team_ID')->on('teams')->onDelete('cascade');
                $table->foreign('user_ID')->references('user_ID')->on('users')->onDelete('cascade');
            });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
