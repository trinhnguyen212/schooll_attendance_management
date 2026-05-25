<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\SchoolOfThought;
use App\Models\StudentCurrentLevel;
use App\Models\StudentStudying;
use App\Models\LearningObjective;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 0; $i < 50; $i++) {
            $firstName = $faker->firstName;
            $lastName = $faker->lastName;

            // Random foreign key relationships
            $school_of_thought_id = SchoolOfThought::inRandomOrder()->value('id');
            $student_studying_id = StudentStudying::inRandomOrder()->value('id');
            $student_current_level_id = StudentCurrentLevel::inRandomOrder()->value('id');
            $learning_objective_id = LearningObjective::inRandomOrder()->value('id');

            User::create([
                'role_id' => 3,
                'shortcode' => strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 2)) . rand(100, 999),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $faker->unique()->safeEmail,
                'phone_number' => '0' . $faker->numerify('#########'), // '0' + 9 digits = 10 digits
                'gender' => $faker->randomElement(['male', 'female']),
                'address' => $faker->address,
                'birth_date' => $faker->date('Y-m-d', '2008-12-31'),
                'is_active' => 1,
                'email_verified_at' => now(),
                'password' => Hash::make('123456789'),

                // Foreign keys
                'school_of_thought_id' => $school_of_thought_id,
                'student_studying_id' => $student_studying_id,
                'student_current_level_id' => $student_current_level_id,
                'learning_objective_id' => $learning_objective_id,
            ]);
        }
    }
}
