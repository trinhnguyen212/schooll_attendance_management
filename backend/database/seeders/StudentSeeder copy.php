<?php

namespace Database\Seeders;

use App\Models\SchoolOfThought;
use App\Models\StudentCurrentLevel;
use App\Models\StudentStudying;
use App\Models\LearningObjective;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = file_get_contents(base_path('/dump/students.json'));
        $students = json_decode($students);
        foreach ($students as $student) {

            $school_of_thought_id = SchoolOfThought::inRandomOrder()->pluck('id')->first();
            $student_studying_id = StudentStudying::inRandomOrder()->pluck('id')->first();
            $student_current_level_id = StudentCurrentLevel::inRandomOrder()->pluck('id')->first();
            $learning_objective_id = LearningObjective::inRandomOrder()->pluck('id')->first();
        
            $student = collect($student)->except(['school_of_thought', 'learning_objective', 'student_current_level', 'student_studying'])->toArray();
           
            
            $student['school_of_thought_id'] = $school_of_thought_id;
            $student['student_studying_id'] = $student_studying_id;
            $student['student_current_level_id'] = $student_current_level_id;
            $student['learning_objective_id'] = $learning_objective_id;
            $student['password'] = Hash::make('123456789');
        
            User::create($student);
        }
        
    }
}
