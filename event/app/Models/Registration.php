<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    protected $table = 'registration';

    const STATUS_PENDING   = 0;
    const STATUS_CONFIRMED = 1;

    protected $fillable = [
        'event_id',
        'user',
        'status'
    ];

    protected static $logAttributes = [
        'event_id',
        'user',
        'status'
    ];

    public function event()
    {
        return $this->hasOne(Event::class);
    }
}
