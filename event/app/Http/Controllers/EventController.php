<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $events = Event::with(['place', 'registrations'])->get();

        return $events;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function myEvents(Request $request)
    {
        $user = $request->get('user');

        $events = Event::whereHas('registrations', function ($query) use ($user) {
            $query->where('user', $user['id']);
        })->get()
            ->map(function ($event) use ($user) {
                $registration = Registration::where('user', $user['id'])->where('event_id', $event->id)->first();

                $event->status = $registration->status;
                $event->certificate = $registration->certificate;

                unset($event->registrations);

                return $event;
            });

        return $events;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $event = Event::create([
            'uuid'          => Str::uuid(),
            'code'          => $request->code,
            'name'          => $request->name,
            'date'          => $request->date,
            'event_type_id' => $request->event_type_id,
            'place_id'      => $request->place_id,
            'capacity'      => $request->capacity,
        ]);

        return response()->json([
            'data'   => $event,
            'message' => 'ok'
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
        $event = Event::find($id);

        return response()->json([
            'data'   => $event,
            'message' => 'ok'
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * Get events for admin
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function adminEvents(Request $request)
    {
        $events = Event::with('registrations')->get();

        $userIds = $events
            ->pluck('registrations')
            ->flatten()
            ->pluck('user')
            ->unique()
            ->values()
            ->toArray();

        if (empty($userIds)) {
            return response()->json($events);
        }

        $token = $request->cookie('token');
        $usersResponse = Http::withToken($token)->get(
            config('services.auth-service.url') . '/allUsers'
        );

        if ($usersResponse->failed()) {
            return response()->json([
                'message' => 'Erro ao buscar usuarios'
            ], 500);
        }

        $users = collect($usersResponse->json())->keyBy('id');

        $events = $events->map(function ($event) use ($users) {

            $event->registrations = $event->registrations->map(function ($reg) use ($users) {

                $user = $users->get((int) $reg->user);

                if ($user) {
                    $reg->user_id    = $user['id'];
                    $reg->user_name  = $user['name'];
                    $reg->user_email = $user['email'];
                    $reg->googleId   = $user['googleId'];
                }

                return $reg;
            });

            return $event;
        });

        return response()->json($events);
    }

    public function userEventsConfirmed(Request $request)
    {
        $user = $request->get('user');
        $userId = $user['id'];

        $events = Event::whereHas('registrations', function ($query) use ($userId) {
            $query->where('status', Registration::STATUS_CONFIRMED);
            $query->where('user', $userId);
        })->get();

        return response()->json($events);
    }
}
