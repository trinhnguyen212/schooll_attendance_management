<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['name' => 'role_permission_view'],
            ['name' => 'role_permission_grant'],

            ['name' => 'user_view'],
            ['name' => 'user_create'],
            ['name' => 'user_update'],
            ['name' => 'user_delete'],



            ['name' => 'school_of_thought_view'],
            ['name' => 'school_of_thought_create'],
            ['name' => 'school_of_thought_update'],
            ['name' => 'school_of_thought_delete'],

            ['name' => 'branch_view'],
            ['name' => 'branch_create'],
            ['name' => 'branch_update'],
            ['name' => 'branch_delete'],

            ['name' => 'course_view'],
            ['name' => 'course_create'],
            ['name' => 'course_update'],
            ['name' => 'course_delete'],



            ['name' => 'classe_view'],
            ['name' => 'classe_create'],
            ['name' => 'classe_update'],
            ['name' => 'classe_delete'],



            ['name' => 'attendance_view'],
            ['name' => 'attendance_create'],
            ['name' => 'attendance_update'],
            ['name' => 'attendance_delete'],

            ['name' => 'semester_view'],
            ['name' => 'semester_create'],
            ['name' => 'semester_update'],
            ['name' => 'semester_delete'],


        ];
        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
    }
}
