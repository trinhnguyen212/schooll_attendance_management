<?php


namespace App\Models;

use App\Traits\Searchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;


class Course extends Model
{
    use Searchable;

    const FULLTEXT = ['name'];

    protected $table = 'courses';

    protected $searchable = [
        'name',
    ];

    protected $fillable = [
        'shortcode',
        'name'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];


    public function classes()
    {
        return $this->hasMany(Classe::class);
    }

   
}
