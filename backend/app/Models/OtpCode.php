<?php



namespace App\Models;

use Carbon\Carbon;
use App\Observers\OtpCodeObserver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;



#[ObservedBy(OtpCodeObserver::class)]
class OtpCode extends Model
{
    protected $table = 'otp_codes';

    protected function casts()
    {
        return [
            'user_id' => 'int',
            'expires_at' => 'datetime'
        ];
    }

    protected $fillable = [
        'user_id',
        'code',
        'type',
        'expires_at'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('expires_at', '>=', now());
    }
}
