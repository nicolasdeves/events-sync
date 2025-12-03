<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\EventType;
use App\Models\Place;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run()
    {
        $types = EventType::all();
        $places = Place::all();

        for ($i = 0; $i < 10; $i++) {
            Event::create([
                'uuid' => Str::uuid(),
                'code' => rand(1000, 9999),
                'name' => 'Evento ' . ($i + 1),
                'date' => now()->addDays(rand(1, 30)),
                'event_type_id' => $types->random()->id,
                'place_id' => $places->random()->id,
                'capacity' => rand(50, 500),
            ]);
        }
    }
}
