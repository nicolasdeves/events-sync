<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
    protected $table = 'place';

    protected $fillable = [
        'name',
    ];

    protected static $logAttributes = [
        'name',
    ];
}
