<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteRequest;
use App\Models\LearningObjective;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LearningObjectiveController extends Controller
{

    public function autocomplete(Request $request)
    {
        $user = $this->getUser();

        try {
            $learning_objectives = LearningObjective::search($request->search)
                ->take($this->autoCompleteResultLimit)
                ->get();
            return Reply::successWithData($learning_objectives, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
}
