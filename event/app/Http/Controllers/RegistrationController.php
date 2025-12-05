<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Http\Request;

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
        $registration = Registration::create([
            'event_id' => $request->event_id,
            'user'     => $request->user,
            'status'   => Registration::STATUS_PENDING
        ]);

        return response()->json([
            'data' => $registration,
            'message'      => 'ok'
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
    public function destroy($id)
    {
        $message = 'ok';
        $registration = Registration::destroy($id);

        if (!$registration) {
            $message = 'Registration not found';
        }
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
    public function confirm(Request $request)
    {
        $registration = Registration::find($request->registrationId);

        if (!$registration) {
            return response()->json([
                'message' => 'Registro não encontrado'
            ], 400);
        }

        $registration->status = Registration::STATUS_CONFIRMED;
        $registration->save();

        return response()->json([
            'data'    => $registration,
            'message' => 'Presença confirmada'
        ], 200);
    }
}
