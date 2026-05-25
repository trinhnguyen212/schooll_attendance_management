<?php



namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;


class Permission extends Model
{
    protected $table = 'permissions';

    protected $fillable = [
        'name'
    ];

    protected function casts()
    {
        return [
            'name'
        ];
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions')
            ->withTimestamps();
    }
}
