<?php

namespace App\Models;

use App\Traits\Searchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;


class Classe extends Model
{
    use Searchable;

    protected $table = 'classes';

    protected $searchable = [
        'shortcode',
        'name',
    ];

    protected function casts()
    {
        return [
            'teacher_id' => 'int',
            'course_id' => 'int',
            'semester_id' => 'int'
        ];
    }

    protected $fillable = [
        'teacher_id',
        'course_id',
        'semester_id',
        'shortcode',
        'name'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'classe_id', 'student_id')
            ->withTimestamps();
    }


    //
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
    public function attendanceResults()
    {
        return $this->hasMany(AttendanceResult::class);
    }

    //

    public function hasStudent(int $id)
    {
        return $this->enrollments()->where('student_id', '=', $id)->exists();
    }

    public function hasAnyStudentFromList(array $ids)
    {
        return $this->enrollments()->whereIn('student_id', $ids)->exists();
    }

    public function isOver()
    {
        return $this->semester->isOver();
    }
}
