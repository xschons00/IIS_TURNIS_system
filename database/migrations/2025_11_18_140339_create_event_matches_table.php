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

            Schema::create('event_matches', function (Blueprint $table) {
                $table->unsignedBigInteger('event_ID');
                $table->unsignedBigInteger('participant_A')->nullable();
                $table->unsignedBigInteger('participant_B')->nullable();
                $table->unsignedInteger('round')->notnull();
                $table->dateTime('time');
                $table->unsignedBigInteger('winner')->nullable();
                $table->primary(['event_ID','participant_A','participant_B']);
                $table->timestamps();

                $table->foreign('event_ID')->references('event_ID')->on('events')->onDelete('cascade');
                $table->foreign('participant_A')->references('user_ID')->on('users')->onDelete('cascade');
                $table->foreign('participant_B')->references('user_ID')->on('users')->onDelete('cascade');
                $table->foreign('winner')->references('user_ID')->on('users')->onDelete('set null');
            });
        
    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_matches');
    }
};
