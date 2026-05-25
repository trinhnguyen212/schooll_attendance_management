<?php



namespace App\Models;

use App\Traits\Searchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;


class SchoolOfThought extends Model
{
    use Searchable;

    protected $table = 'school_of_thoughts';

    protected $searchable = [
        'shortcode',
        'name',
    ];

    protected function casts()
    {
        return [
        ];
    }

    protected $fillable = [
        'shortcode',
        'name',
    ];



    public function students()
    {
        return $this->hasMany(User::class);
    }
}
