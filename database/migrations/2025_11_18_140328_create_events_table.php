<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id('event_ID');
            $table->string('event_name');
            $table->string('description');
            $table->date('event_date');
            $table->string('location');
            $table->enum('event_type', ['SOLO', 'TEAM']);
            $table->enum('event_state', ['NEW', 'REGISTRATION', 'ONGOING', 'FINISHED']);
            $table->integer('max_participants')->unsigned();
            $table->timestamps();
            $table->bigInteger('event_leader_id')->unsigned();
            $table->foreign('event_leader_id')->references('user_ID')->on('users')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
