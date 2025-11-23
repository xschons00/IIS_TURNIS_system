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
            Schema::create('team_participants', function (Blueprint $table) {
                $table->unsignedBigInteger('event_ID');
                $table->unsignedBigInteger('team_ID');
                $table->enum('status', ['REQUESTED', 'ACCEPTED'])->default('REQUESTED');
                $table->integer('final_placement')->unsigned()->nullable();
                $table->integer('final_points')->unsigned()->default(0);
                $table->timestamps();

                $table->primary(['event_ID','team_ID']);
                $table->foreign('event_ID')->references('event_ID')->on('events')->onDelete('cascade');
                $table->foreign('team_ID')->references('team_ID')->on('teams')->onDelete('cascade');

            });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('team_participants');
    }
};
