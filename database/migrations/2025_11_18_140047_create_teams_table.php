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
        Schema::create('teams', function (Blueprint $table) {
            $table->id('team_ID');
            $table->bigInteger('team_leader_id')->unsigned();
            $table->string('team_name')->unique();
            $table->integer('ranking')->unsigned()->nullable();
            $table->timestamps();
            $table->foreign('team_leader_id')->references('user_ID')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
