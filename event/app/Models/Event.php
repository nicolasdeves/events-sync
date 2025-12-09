<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $table = 'event';

    protected $fillable = [
        'uuid',
        'code',
        'name',
        'date',
        'event_type_id',
        'place_id',
        'capacity'
    ];

    protected static $logAttributes = [
        'uuid',
        'code',
        'name',
        'date',
        'event_type_id',
        'place_id',
        'capacity'
    ];

    public function registrations()
    {
        return $this->hasMany(Registration::class, 'event_id');
    }

    public function place()
    {
        return $this->belongsTo(Place::class, 'place_id');
    }
}
