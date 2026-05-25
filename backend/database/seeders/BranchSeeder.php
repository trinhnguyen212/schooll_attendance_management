<?php

namespace Database\Seeders;

use App\Models\Branch;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $branches = [
            [
                'shortcode' => 'KB01',
                'name' => 'Kilbirnie Wellington',
                'phone_number' => '0573826545',
            ],
            [
                'shortcode' => 'MN01',
                'name' => 'Mount Eden Auckland',
                'phone_number' => '0573826641',
            ],
            [
                'shortcode' => 'CB02',
                'name' => 'Cashmere Christchurch',
                'phone_number' => '0573823487',
            ],
            [
                'shortcode' => 'SB01',
                'name' => 'St Clair Dunedin',
                'phone_number' => '0573826789',
            ],
            [
                'shortcode' => 'FR03',
                'name' => 'Frankton Queenstown',
                'phone_number' => '0573830978',
            ],
            [
                'shortcode' => 'FS01',
                'name' => 'Fitzroy New Plymouth',
                'phone_number' => '0573879078',
            ],
            [
                'shortcode' => 'NR02',
                'name' => 'Napier South Hawke\'s Bay',
                'phone_number' => '0573871209',
            ],
            [
                'shortcode' => 'TG01',
                'name' => 'Te Puke Tauranga',
                'phone_number' => '0573829067',
            ],
            [
                'shortcode' => 'GT02',
                'name' => 'Glenholme Rotorua',
                'phone_number' => '0573872634',
            ],
            [
                'shortcode' => 'WT04',
                'name' => 'Windsor Invercargill',
                'phone_number' => '0573809878',
            ],
            [
                'shortcode' => 'FM01',
                'name' => 'Fairfield Hamilton',
                'phone_number' => '0573859067',
            ],
            [
                'shortcode' => 'TN01',
                'name' => 'Thorndon Wellington',
                'phone_number' => '0573829011',
            ],
            [
                'shortcode' => 'CN01',
                'name' => 'Chartwell Waikato',
                'phone_number' => '0573801897',
            ]
        ];
        foreach ($branches as $branch) {
            Branch::create($branch);
        }
    }
}
