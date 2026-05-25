<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\Course\StoreRequest;
use App\Http\Requests\Course\UpdateRequest;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::COURSE_VIEW), 403);

        $courses = Course::select('*');

        try {
            if ($request->search != null) {
                $courses = $courses->whereFullText(Course::FULLTEXT, $request->search);
            }
            $courses = $courses
                ->limit($this->defaultLimit)
                ->get();
            return Reply::successWithData($courses, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function store(StoreRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::COURSE_CREATE), 403);

        DB::beginTransaction();
        try {
            Course::create($request->validated());
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
        abort_if(!$user->hasPermission(PermissionType::COURSE_VIEW), 403);

        try {
            $course = Course::findOrFail($id);
            return Reply::successWithData($course, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function update(UpdateRequest $request, string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::COURSE_UPDATE), 403);

        DB::beginTransaction();
        try {
            $course = Course::findOrFail($id);
            $course->update($request->validated());
            DB::commit();
            // return Reply::successWithMessage(trans('app.successes.record_save_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function destroy(string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::COURSE_DELETE), 403);

        DB::beginTransaction();
        try {
            Course::destroy($id);
            DB::commit();
           // return Reply::successWithMessage(trans('app.successes.record_delete_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function autocomplete(Request $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::COURSE_VIEW), 403);

        try {
            $users = Course::search($request->search)
                ->take($this->autoCompleteResultLimit)
                ->get();
            return Reply::successWithData($users, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
}
