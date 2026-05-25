<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->unsignedBigInteger('learning_objective_id')->nullable()->after('school_of_thought_id');
        $table->unsignedBigInteger('student_studying_id')->nullable()->after('learning_objective_id');
        $table->unsignedBigInteger('student_current_level_id')->nullable()->after('student_studying_id');
        $table->string('disabilities_allergies_conditions')->nullable()->after('student_current_level_id');

        
    });
}

public function down()
{
    Schema::table('users', function (Blueprint $table) {
  

        $table->dropColumn([
            'learning_objective_id',
            'student_studying_id',
            'student_current_level_id',
            'disabilities_allergies_conditions'
        ]);
    });
}

};
