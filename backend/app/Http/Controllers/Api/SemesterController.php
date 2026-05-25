<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\Semester\StoreRequest;
use App\Models\Semester;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SemesterController extends Controller
{
    public function index(Request $request)
{
    $user = $this->getUser();
    
    // Check if the user has permission to view semesters
    abort_if(!$user->hasPermission(PermissionType::SEMESTER_VIEW), 403);
    
    try {
        // Start the query for semesters
        $data = Semester::select('*');
        
        // If the user is a teacher, filter semesters to only those they are teaching
        if ($user->isTeacher()) {
            $data = $data->whereHas('classes', function ($query) use ($user) {
                // Only select semesters where the teacher has classes
                $query->where('teacher_id', $user->id);
            });
        }
        //
 // If the user is a student, filter semesters to only those they are enrolled in
 if ($user->isStudent()) {
    // Filter semesters where the student is enrolled
    $data = $data->whereHas('classes.students', function ($query) use ($user) {
        $query->where('users.id', $user->id);  // Check if the student is enrolled
    });
}

        // 👇 Filter for parent-specific semesters (based on children's classes)
        if ($user->role->name === 'parent' && $user->childs->count()) {
            $childIds = $user->childs->pluck('id');

            $data->whereHas('classes.students', function ($query) use ($childIds) {
                $query->whereIn('users.id', $childIds);
            });
        }

        // If there's a search term, apply the search filter
        if ($request->search != null) {
            $data = $data->search($request->search);
        }

        // Apply pagination limit, ordering by ID
        $data = $data
            ->limit($this->defaultLimit)
            ->latest('id')
            ->get();
        
        // Return success response with the data
        return Reply::successWithData($data, '');
    } catch (\Exception $error) {
        // Handle any exceptions
        return $this->handleException($error);
    }
}


    public function store(StoreRequest $request)
    {

        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::SEMESTER_CREATE), 403);
        $data = $request->validated();
        $data['start_date'] = Carbon::parse($request->start_date);
        $data['end_date'] = Carbon::parse($request->end_date);

        DB::beginTransaction();
        try {
            Semester::create($data);
            DB::commit();
           // return Reply::successWithMessage(trans('app.successes.record_save_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function show(string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::SEMESTER_VIEW), 403);

        try {
            $semester = Semester::findOrFail($id);
            return Reply::successWithData($semester, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function update(StoreRequest $request, string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::SEMESTER_UPDATE), 403);
        $data = $request->validated();
        $data['start_date'] = Carbon::parse($request->start_date);
        $data['end_date'] = Carbon::parse($request->end_date);

        DB::beginTransaction();
        try {
            $semester = Semester::findOrFail($id);
            $semester->update($data);
            DB::commit();
            return Reply::successWithMessage(trans('app.successes.record_save_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function destroy(string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::SEMESTER_DELETE), 403);

        DB::beginTransaction();
        try {
            Semester::destroy($id);
            DB::commit();
            //return Reply::successWithMessage(trans('app.successes.record_delete_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function autocomplete(Request $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::SEMESTER_VIEW), 403);

        try {
            $semesters = Semester::where('end_date', '>=', Carbon::now())
                ->search($request->search)
                ->take($this->autoCompleteResultLimit)
                ->get();
            return Reply::successWithData($semesters, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
}
