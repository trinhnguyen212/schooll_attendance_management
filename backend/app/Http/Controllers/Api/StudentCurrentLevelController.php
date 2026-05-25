<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteRequest;
use App\Models\StudentCurrentLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentCurrentLevelController extends Controller
{

    public function autocomplete(Request $request)
    {
        $user = $this->getUser();

        try {
            $student_current_levels = StudentCurrentLevel::search($request->search)
                ->take($this->autoCompleteResultLimit)
                ->get();
            return Reply::successWithData($student_current_levels, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
}
