<?php

namespace Database\Seeders;

use App\Models\SchoolOfThought;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SchoolOfThoughtSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schoolOfThoughts = [
            [
                'shortcode' => 'HANF',
                'name' => 'Hanfi',
            ],
            [
                'shortcode' => 'SHAF',
                'name' => 'Shafei',
            ],
            [
                'shortcode' => 'MALK',
                'name' => 'Maliki',
            ],
            [
                'shortcode' => 'HANB',
                'name' => 'Hanbali',
            ],
           
      
        ];
        foreach ($schoolOfThoughts as $schoolOfThought) {
            SchoolOfThought::create($schoolOfThought);
        }
    }
}
