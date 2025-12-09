<?php

return [

    'auth-service' => [
        'url' => env('AUTH_SERVICE_URL'),
        'jwt' => env('JWT_VERIFY_URL'),
    ],

    'notification-service' => [
        'url' => env('NOTIFICATION_SERVICE_URL'),
    ],

    'certification-service' => [
        'url' => env('CERTIFICATION_SERVICE_URL'),
    ],





    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],


];
