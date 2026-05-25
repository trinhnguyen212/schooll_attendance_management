<?php

namespace Database\Seeders;

use App\Models\StudentCurrentLevel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentCurrentLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $studentCurrentLevels = [
            [
                'name' => 'Cannot read Quran yet',
            ],
            [
                'name' => 'Know Arabic alphabet',
            ],
            [
                'name' => 'Recites haltingly',
            ],
            [
                'name' => 'Recites with limited or no tajweed',
            ],
            [
                'name' => 'Recites fluently',
            ],
      
           
      
        ];
        foreach ($studentCurrentLevels as $studentCurrentLevel) {
            StudentCurrentLevel::create($studentCurrentLevel);
        }
    }
}
