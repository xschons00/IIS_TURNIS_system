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
        Schema::create('player_participants', function (Blueprint $table) {
            $table->unsignedBigInteger('event_ID');
            $table->unsignedBigInteger('user_ID');
            $table->integer('final_placement')->unsigned();
            $table->primary(['event_ID','user_ID']);
            $table->foreign('event_ID')->references('event_ID')->on('events')->onDelete('cascade');
            $table->foreign('user_ID')->references('user_ID')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_participants');
    }
};
