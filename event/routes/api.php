<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;


Route::middleware('verify.jwt')->group(function () {
    Route::get('events/my', [EventController::class, 'myEvents']);
    Route::get('events/confirmed-events', [EventController::class, 'userEventsConfirmed']);
    Route::get('events/admin', [EventController::class, 'adminEvents']);
    Route::apiResource('events', EventController::class);

    Route::post('/registrations/event/{eventId}/register-user', [RegistrationController::class, 'registerUserInEvent']);
    Route::delete('/registrations/event/{eventId}/cancel', [RegistrationController::class, 'cancelRegistration']);
    Route::put('registrations/{registrationId}/confirm', [RegistrationController::class, 'confirm']);
    Route::apiResource('registrations', RegistrationController::class);
    Route::get('registrations/user/{user}', [RegistrationController::class, 'byUser']);
    
});
