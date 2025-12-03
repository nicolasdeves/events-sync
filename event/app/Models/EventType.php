<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventType extends Model
{
    protected $table = 'event_type';

    protected $fillable = [
        'code',
        'name',
    ];

    protected static $logAttributes = [
        'code',
        'name',
    ];
}
