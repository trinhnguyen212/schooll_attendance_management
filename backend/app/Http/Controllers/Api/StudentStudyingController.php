<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteRequest;
use App\Models\StudentStudying;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentStudyingController extends Controller
{
   
    public function autocomplete(Request $request)
    {
        $user = $this->getUser();

        try {
            $student_studyings = StudentStudying::search($request->search)
                ->take($this->autoCompleteResultLimit)
                ->get();
            return Reply::successWithData($student_studyings, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
}
