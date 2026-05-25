<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'name' => 'Tasheel Series',
                'shortcode' => 'TEECH01'
            ],
            [
                'name' => 'Quran Classes [Men & Boys aged 13+] - Kilbirnie',
                'shortcode' => 'QURANMALE13KIL'
            ],
            [
                'name' => 'Quran Tajweed [Ladies] - Kilbirnie',
                'shortcode' => 'QUATAJLADIESKIL'
            ],
            [
                'name' => 'Quran Urdu Translation [Ladies] - Online',
                'shortcode' => 'QURURDUTRANSLADIES'
            ],
            [
                'name' => 'Tuhfatul Shabab [Boys over 13y] - Kilbirnie',
                'shortcode' => 'TUHFASHA13KIL'
            ],
            [
                'name' => 'Tuhfatul Bannat [Girls over 13y] - Kilbirnie',
                'shortcode' => 'TUBAGIRL13KIL'
            ],
            [
                'name' => 'Fehmul Quran - Kilbirnie',
                'shortcode' => 'FEHQURANKIL'
            ],
            [
                'name' => 'Holidays Program - Age [5-10]',
                'shortcode' => 'HOLPRP510'
            ]
        ];
        
        foreach ($courses as $course) {
            Course::create($course);
        }
    }
}
