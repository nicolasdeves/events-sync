<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class RegistrationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $registrations = Registration::all();

        return response()->json([
            'data'  => $registrations,
            'message' => 'ok'
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $user = $request->get('user');
        $token = $request->cookie('token');

        $registration = Registration::where([
            'event_id' => $request->eventId,
            'user'     => $user['id'],
        ])->first();

        if (!$registration) {
            $registration = Registration::create([
                'event_id' => $request->eventId,
                'user'     => $user['id'],
                'status'   => Registration::STATUS_PENDING
            ]);
        }

        $userResponse = Http::withToken($token)->get(
            config('services.auth-service.url') . '/me'
        );

        $email = $userResponse->json('email');
        $name = $userResponse->json('name');

        $subject = "🎉 Inscrição confirmada no evento!";
        $message =
            'Prezado(a),

        Informamos gue sua inscrição no evento "' . $registration->event->name . '" foi realizada com sucesso.
        É uma satisfação contar com sua participação.

        Atenciosamente,
        Equipe do evento';

        self::sendEmail($token, $email, $subject, $message);

        return response()->json([
            'message'      => 'Ok'
        ], 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $registration = Registration::find($id);

        return response()->json([
            'data'   => $registration,
            'message' => 'ok'
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $token = $request->cookie('token');
        $message = 'ok';
        $registration = Registration::find($id);

        if (!$registration) {
            $message = 'Registration not found';
        }

        $registration->delete();

        $userResponse = Http::withToken($token)->get(
            config('services.auth-service.url') . '/me'
        );

        $email = $userResponse->json('email');

        $subject = "❌ Inscrição cancelada no evento!";
        $emailMessage =
            'Prezado(a),
        Informamos gue sua inscrição no evento "' . $registration->event->name . '" foi cancelada.

        Atenciosamente,
        Equipe do evento';

        self::sendEmail($token, $email, $subject, $emailMessage);

        return response()->json([
            'message' => $message
        ], 200);
    }

    /**
     * Get registrations by user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function byUser(Request $request)
    {
        $message = 'ok';
        $registrations = Registration::where(['user' => $request->user])->get();

        // $authResponse = Http::post(config('services.auth-service.verify_user'), [
        //     'user' => $user,
        // ]);

        // if (!$authResponse->ok() || !$authResponse->json('valid')) {
        //     return response()->json([
        //         'message' => 'User inválido no auth service'
        //     ], 401);
        // }

        return response()->json([
            'data'    => $registrations,
            'message' => $message
        ], 200);
    }

    /**
     * Confirm registration (Go to the event!)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function confirm(Request $request, $registrationId)
    {
        $token = $request->cookie('token');
        $registration = Registration::find($registrationId);

        if (!$registration) {
            return response()->json([
                'message' => 'Registro não encontrado'
            ], 400);
        }

        $registration->status = Registration::STATUS_CONFIRMED;
        $registration->save();

        $userResponse = Http::withToken($token)->get(
            config('services.auth-service.url') . '/user/' . $registration->user
        );

        $email = $userResponse->json('user.email');
        $name = $userResponse->json('user.name');

        \Log::info($email);

        $subject = "✅ Presença confirmada no evento!";
        $message =
        'Prezado(a),

        Informamos que sua presença no evento "' . $registration->event->name . '" foi confirmada com sucesso.

        Seu certificado de participação já está disponível e pode ser acessado a qualquer momento através da plataforma.

        Agradecemos por fazer parte deste evento e esperamos contar com você em próximas edições.

        Atenciosamente,
        Equipe do evento';

        self::sendEmail($token, $email, $subject, $message);


        // CERTIFICADO
        $certificationResponse = Http::withToken($token)->post(
            config('services.certification-service.url') . '/' . $registration->event->name . '/' . $name
        );

        $registration->certificate = $certificationResponse->json('uuid');
        $registration->save();

        return response()->json([
            'data'    => $registration,
            'message' => 'Presença confirmada'
        ], 200);
    }

    /**
     * Register user in a event (Go to the event!)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function registerUserInEvent(Request $request, $eventId)
    {
        $userId = $request->userId;

        // Verificar se já existe registro
        $registrationExists = Registration::where([
            'event_id' => $eventId,
            'user'     => $userId,
        ])->first();

        if ($registrationExists) {
            return response()->json([
                'data'    => $registrationExists,
                'message' => 'Usuário já registrado no evento'
            ], 200);
        }

        $registration = Registration::create([
            'user' => $userId,
            'event_id' => $eventId,
            'status' => Registration::STATUS_PENDING
        ]);

        return response()->json([
            'data'    => $registration,
            'message' => 'Usuário registrado no evento'
        ], 200);
    }

    /**
     * Cancel user participation in an event
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $eventId
     * @return \Illuminate\Http\Response
     */
    public function cancelRegistration(Request $request, $eventId)
    {
        $user = $request->get('user');
        $userId = $user['id'];

        $registration = Registration::where([
            'event_id' => $eventId,
            'user'     => $userId,
        ])->first();

        if (!$registration) {
            return response()->json([
                'message' => 'Registro não encontrado'
            ], 404);
        }

        $registration->delete();

        return response()->json([
            'message' => 'Participação cancelada com sucesso'
        ], 200);
    }

    /**
     * Send e-mail
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $eventId
     * @return \Illuminate\Http\Response
     */
    public static function sendEmail($token, $email, $subject, $message)
    {
        try {
            $notificationResponse = Http::withToken($token)->post(
                config('services.notification-service.url'),
                [
                    'to' => $email,
                    'subject' => $subject,
                    'message' => $message
                ]
            );
        } catch (Throwable $error) {
            Log::info("Falha ao enviar e-mail" . $error->getMessage());
        }
    }
}
