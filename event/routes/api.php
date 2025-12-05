<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;


// Route::middleware('verify.jwt')->group(function () {
    Route::apiResource('events', EventController::class);

    Route::apiResource('registrations', RegistrationController::class);
    Route::get('registrations/user/{user}', [RegistrationController::class, 'byUser']);
    Route::put('registrations/confirm/{registrationId}', [RegistrationController::class, 'confirm']);
// });
