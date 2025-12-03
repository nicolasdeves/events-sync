<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Place;

class PlaceSeeder extends Seeder
{
    public function run()
    {
        $places = [
            ['name' => 'Meetup Unimed'],
            ['name' => 'Tecnovates'],
        ];

        foreach ($places as $place) {
            Place::create($place);
        }
    }
}
