<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class TeacherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        $index = 1;

        for ($i = 0; $i < 30; $i++) {
            $branch_id = Branch::inRandomOrder()->value('id');

            $firstName = $faker->firstName;
            $lastName = $faker->lastName;

            User::create([
                'role_id' => 2, // Assuming role_id 2 is for teachers
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $faker->unique()->safeEmail,
                'phone_number' => '0' . $faker->numerify('#########'), // '0' + 9 digits = 10 digits
                'gender' => $faker->randomElement(['male', 'female']),
                'address' => $faker->address,
                'birth_date' => $faker->date('Y-m-d', '1995-01-01'),
                'is_active' => 1,
                'email_verified_at' => now(),
                'password' => Hash::make('123456789'),
                'shortcode' => 'GVDH' . str_pad($index, 8, '0', STR_PAD_LEFT),
                'branch_id' => $branch_id,
            ]);

            $index++;
        }
    }
}
