<?php



namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;


class RolePermission extends Model
{
    protected $table = 'role_permissions';
    public $incrementing = false;

    protected function casts()
    {
        return [
            'role_id' => 'int',
            'permission_id' => 'int'
        ];
    }

    protected $fillable = [
        'role_id',
        'permission_id'
    ];

    public function permission()
    {
        return $this->belongsTo(Permission::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
