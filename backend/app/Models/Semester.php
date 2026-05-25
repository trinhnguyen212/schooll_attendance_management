<?php



namespace App\Models;

use App\Traits\Searchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;


class Semester extends Model
{
    use Searchable;
    protected $table = 'semesters';

    const DATE_FORMAT = 'Y-m-d\TH:i:sP';

    protected $searchable = [
        'name',
        'start_date',
        'end_date',
    ];

    protected function casts()
    {
        return [
            'start_date' => 'datetime:' . self::DATE_FORMAT,
            'end_date' => 'datetime:' . self::DATE_FORMAT
        ];
    }

    protected $fillable = [
        'name',
        'start_date',
        'end_date'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function classes()
    {
        return $this->hasMany(Classe::class);
    }

    public function isOver()
    {
        return Carbon::now()->greaterThan($this->end_date);
    }
}
