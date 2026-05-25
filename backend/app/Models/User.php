<?php



namespace App\Models;

use App\Enums\PermissionType;
use App\Enums\RoleType;
use App\Traits\Searchable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{
    use HasApiTokens, Notifiable, Searchable;

    const DATE_FORMAT = 'Y-m-d\TH:i:sP';
    const FULLTEXT = [
        'first_name',
        'last_name',
        'address',
    ];

    protected $table = 'users';

    protected $searchable = [
        'first_name',
        'last_name',
    ];

    protected function casts()
    {
        return [
            'role_id' => 'int',
            'birth_date' => 'datetime:' . self::DATE_FORMAT,
            'is_active' => 'bool',
            'email_verified_at' => 'datetime:' . self::DATE_FORMAT
        ];
    }

    protected $hidden = [
        'password',
        'remember_token'
    ];

    protected $fillable = [
        'role_id',
        'shortcode',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'disabilities_allergies_conditions',
        'gender',
        'address',
        'birth_date',
        'school_of_thought_id',
        'learning_objective_id',
        'student_current_level_id',
        'student_studying_id',
        'branch_id',
        'is_active',
        'email_verified_at',
        'password',
        'remember_token'
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }


    public function learning_objective()
    {
        return $this->belongsTo(LearningObjective::class);
    }
    public function student_studying()
    {
        return $this->belongsTo(StudentStudying::class);
    }
    public function student_current_level()
    {
        return $this->belongsTo(StudentCurrentLevel::class);
    }
    public function school_of_thought()
    {
        return $this->belongsTo(SchoolOfThought::class);
    }



    public function classes()
{
    return $this->hasMany(Classe::class, 'teacher_id');
}


    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }



    public function branches()
    {
        return $this->hasMany(Branch::class, 'leader_id');
    }


    //
    public function childs()
    {
        return $this->belongsToMany(User::class, 'user_childs', 'user_id', 'child_id')
            ->withPivot('id')
            ->withTimestamps();
    }
    //



    public function otp_codes()
    {
        return $this->hasMany(OtpCode::class);
    }

    public function isAdmin()
    {
        return $this->role_id == RoleType::ADMIN->value;
    }

    public function isTeacher()
    {
        return $this->role_id == RoleType::TEACHER->value;
    }

    public function isStudent()
    {
        return $this->role_id == RoleType::STUDENT->value;
    }

    public function isParent()
{
    return $this->role_id == RoleType::PARENT->value;
}


    public function hasPermission(string|PermissionType $name)
    {
        return $this->role->permissions()->where('name', '=', $name)->exists();
    }

    public function hasPermissions(array $names)
    {
        return $this->role->permissions()->whereIn('name', $names)->count() == count($names);
    }
}
