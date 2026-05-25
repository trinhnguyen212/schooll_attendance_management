<?php


namespace App\Models;

use App\Traits\Searchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;


class Branch extends Model
{
    use Searchable;
    protected $table = 'branches';

    protected $searchable = [
        'shortcode',
        'name',
    ];

    protected function casts()
    {
        return [
            'leader_id' => 'int'
        ];
    }

    protected $fillable = [
        'shortcode',
        'name',
        'email',
        'phone_number',
        'leader_id'
    ];

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
