<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RouteLog extends Model
{
    protected $fillable = [
        'method',
        'path',
        'body',
        'ip',
        'user'
    ];
}
