<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VerifyJwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('token');

        if (!$token) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $url = config('services.auth-service.jwt');

        $response = Http::withToken($token)->post($url);

        if ($response->failed()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = $response->json();
        $request->attributes->set('user', $user);

        return $next($request);
    }
}
