<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EventType;

class EventTypeSeeder extends Seeder
{
    public function run()
    {
        $types = [
            ['code' => 1, 'name' => 'Conferência'],
            ['code' => 2, 'name' => 'Encontro'],
            ['code' => 3, 'name' => 'Curso'],
        ];

        foreach ($types as $type) {
            EventType::create($type);
        }
    }
}
