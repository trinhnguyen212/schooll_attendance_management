<?php



namespace App\Models;

use App\Traits\Searchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;


class StudentStudying extends Model
{
    use Searchable;

    protected $table = 'student_studyings';

    protected $searchable = [
        
        'name',
    ];

    protected function casts()
    {
        return [
        ];
    }

    protected $fillable = [
        
        'name',
    ];


    public function students()
    {
        return $this->hasMany(User::class);
    }
}
