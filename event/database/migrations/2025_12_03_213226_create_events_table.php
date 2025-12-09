<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('event', function (Blueprint $table) {
            $table->id();
            $table->string('uuid');
            $table->string('code');
            $table->string('name');
            $table->dateTime('date');
            $table->integer('capacity');

            $table->unsignedBigInteger('place_id')->unsigned();
            $table->foreign('place_id')->references('id')->on('place');

            $table->unsignedBigInteger('event_type_id')->unsigned();
            $table->foreign('event_type_id')->references('id')->on('event_type');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('event');
    }
}
