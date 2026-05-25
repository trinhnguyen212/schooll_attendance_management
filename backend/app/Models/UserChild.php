<?php



namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;


class UserChild extends Model
{
    protected $table = 'user_childs';

    protected function casts()
    {
        return [
            'user_id' => 'int',
            'child_id' => 'int'
        ];
    }

    protected $fillable = [
        'user_id',
        'child_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function child()
    {
        return $this->belongsTo(User::class, 'child_id');
    }
}
