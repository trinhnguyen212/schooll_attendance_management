<?php

namespace Database\Seeders;

use App\Models\StudentStudying;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentStudyingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $studentStudyings = [
            [
                'name' => 'Qaaidah',
            ],
            [
                'name' => 'Juz Amma [Quran]',
            ],
            [
                'name' => 'Quran',
            ],
            [
                'name' => 'None',
            ],
      
           
      
        ];
        foreach ($studentStudyings as $studentStudying) {
            StudentStudying::create($studentStudying);
        }
    }
}
