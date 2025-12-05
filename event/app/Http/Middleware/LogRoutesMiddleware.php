<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\RouteLog;
use Illuminate\Support\Facades\Http;

class LogRoutesMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // $userResponse = Http::withToken($request->bearerToken())
        //     ->get('http://auth-service/api/me');

        // $user = $userResponse->json();

        RouteLog::create([
            'method' => $request->method(),
            'path'   => $request->path(),
            'body'   => json_encode($request->all()),
            'ip'     => $request->ip(),
            'user'   => 'Nícolas Deves'
        ]);

        return $response;
    }
}
