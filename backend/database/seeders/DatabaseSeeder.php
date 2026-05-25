<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            RolePermissionSeeder::class,
            AdminSeeder::class,
        ]);

        if (config('custom.app.demo')) {
            $this->call([
                BranchSeeder::class,
                SchoolOfThoughtSeeder::class,
                LearningObjectiveSeeder::class,
                StudentStudyingSeeder::class,
                StudentCurrentLevelSeeder::class,
                CourseSeeder::class,
                StudentSeeder::class,
                TeacherSeeder::class,
            ]);
        }
    }
}
