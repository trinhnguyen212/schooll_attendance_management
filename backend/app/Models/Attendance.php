<?php


namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;


class Attendance extends Model
{
    protected $table = 'attendances';

    const DATE_FORMAT = 'Y-m-d\TH:i:sP';

    protected function casts()
    {
        return [
            'classe_id' => 'int',
            'attendance_date' => 'datetime:' . self::DATE_FORMAT,
        ];
    }

    protected $fillable = [
        'classe_id',
        'name',
        'attendance_date',
    ];

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function attendance_results()
    {
        return $this->hasMany(AttendanceResult::class);
    }

    // public function isOver()
    // {
    //     $over_at = Carbon::parse($this->attendance_date)->addMinutes($this->slot_time);
    //     return $over_at->greaterThan(Carbon::now());
    // }

}
