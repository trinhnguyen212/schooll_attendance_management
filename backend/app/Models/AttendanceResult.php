<?php


namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class AttendanceResult extends Model
{
    protected $table = 'attendance_results';

    const DATE_FORMAT = 'Y-m-d\TH:i:sP';

    protected function casts()
    {
        return [
            'attendance_id' => 'int',
            'user_id' => 'int',
            'attendance_status' => 'boolean',
            'created_at' => 'datetime:' . self::DATE_FORMAT,
            'updated_at' => 'datetime:' . self::DATE_FORMAT,
        ];
    }

    protected $fillable = [
        'attendance_id',
        'user_id',
        'attendance_status',
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cancelled_by()
    {
        return $this->belongsTo(User::class, 'cancelled_by_user_id');
    }

    public function remark_by()
    {
        return $this->belongsTo(User::class, 'remark_by_user_id');
    }




    public function classe()
    {
        return $this->attendance->classe();
    }



}
