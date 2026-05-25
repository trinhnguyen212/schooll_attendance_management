<?php



namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;


class Enrollment extends Model
{
    protected $table = 'enrollments';

    protected function casts()
    {
        return [
            'classe_id' => 'int',
            'student_id' => 'int'
        ];
    }


    protected $fillable = [
        'classe_id',
        'student_id'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
    public function student()
{
    return $this->belongsTo(User::class, 'student_id');
}

}
