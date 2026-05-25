<?php



namespace App\Models;

use App\Traits\Searchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;


class LearningObjective extends Model
{
    use Searchable;

    protected $table = 'learning_objectives';

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
