<?php

namespace Database\Seeders;

use App\Models\LearningObjective;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LearningObjectiveSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $learningObjectives = [
            [
                'name' => 'Learn to read Quran',
            ],
            [
                'name' => 'Improve Tajweed',
            ],
            [
                'name' => 'Improve fluency',
            ],
            [
                'name' => 'Memorize more Quran',
            ],
            [
                'name' => 'Understand more Quran',
            ],
           
      
        ];
        foreach ($learningObjectives as $learningObjective) {
            LearningObjective::create($learningObjective);
        }
    }
}
