<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Enums\RoleType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\Classe\IndexRequest;
use App\Http\Requests\Classe\StoreRequest;
use App\Http\Requests\Classe\UpdateRequest;
use App\Http\Requests\Classe\UpdateStudentsRequest;
use App\Models\Classe;
use App\Models\Semester;
use App\Models\User;
use App\Models\UserChild;
use Illuminate\Support\Facades\DB;

class ClasseController extends Controller
{
    public function index(IndexRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::CLASSE_VIEW), 403);
    
        try {
            $data = Classe::query();
    
            if ($user->isTeacher()) {
                $data->where('teacher_id', $user->id);
            }
    
            if ($user->isStudent()) {
                $data->whereHas('students', function($query) use ($user) {
                    $query->where('student_id', $user->id);
                });
            }
    
            if ($user->isParent()) {
                $childIds = $user->childs->pluck('id')->toArray();
                $childId = $request->input('child_id');
            
                if ($childId && in_array($childId, $childIds)) {
                    $data->whereHas('enrollments', function ($query) use ($childId) {
                        $query->where('student_id', $childId);
                    });
                } else {
                    $data->whereHas('enrollments', function ($query) use ($childIds) {
                        $query->whereIn('student_id', $childIds);
                    });
                }
            }
            
    
            if ($request->filled('semester_id')) {
                $data->where('semester_id', $request->semester_id);
            }
    
            if ($request->filled('search')) {
                $data->search($request->search);
            }
    
            $data = $data->latest('id')->limit($this->defaultLimit)->get();
    
            return Reply::successWithData($data, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
    
    public function store(StoreRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::CLASSE_CREATE), 403);
        $data = $request->validated();

        DB::beginTransaction();
        try {
            $semester = Semester::findOrFail($request->semester_id);
            if ($semester->isOver()) {
                return Reply::error(trans('app.errors.semester_end'), 400);
            }
            User::where('role_id', '=', RoleType::TEACHER)
                ->select('id')->findOrFail($request->teacher_id);
            Classe::create($data);
            DB::commit();
           /*  return Reply::successWithMessage(trans('app.successes.record_save_success')); */
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

   public function show(string $id)
{
    $user = $this->getUser();
    abort_if(!$user->hasPermission(PermissionType::CLASSE_VIEW), 403);

    try {
        $query = Classe::with([
            'teacher',
            'course',
            'enrollments.user' => function ($query) {
                $query->with(['role', 'school_of_thought', 'branch']);
            },
            'attendances',
 
        ]);

        if ($user->role === 'teacher') {
            $query->whereHas('teacher', function ($q) use ($user) {
                $q->where('teacher_id', $user->id);
            });
        }

         if ($user->role === 'parent') {
            $childIds = $user->childs->pluck('id'); 
            $query->whereHas('enrollments', function ($q) use ($childIds) {
                $q->whereIn('user_id', $childIds);
            });
        }

        // Fetch class or return 404
        $classe = $query->findOrFail($id);

        return Reply::successWithData($classe, '');
    } catch (\Exception $error) {
        \Log::error('Classe Show Error: ' . $error->getMessage());
        return $this->handleException($error);
    }
}


    public function update(UpdateRequest $request, string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::CLASSE_UPDATE), 403);
        $data = $request->validated();
        DB::beginTransaction();

        try {
            $target_classe = Classe::findOrFail($id);
            if ($target_classe->semester->isOver()) {
                return Reply::error(trans('app.errors.semester_end'), 400);
            }
            User::where('role_id', '=', RoleType::TEACHER)
                ->select('id')->findOrFail($request->teacher_id);
            $target_classe->update($data);
            DB::commit();
            /* return Reply::successWithMessage(trans('app.successes.record_save_success')); */
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function destroy(string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::CLASSE_DELETE), 403);

        DB::beginTransaction();
        try {
            Classe::destroy($id);
            DB::commit();
            return Reply::successWithMessage(trans('app.successes.record_delete_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function updateStudents(UpdateStudentsRequest $request, string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::CLASSE_UPDATE), 403);

        DB::beginTransaction();
        try {
            $target_classe = Classe::findOrFail($id);
            if ($target_classe->semester->isOver()) {
                return Reply::error(trans('app.errors.semester_end'), 400);
            }
            $student_ids  = User::where('role_id', RoleType::STUDENT)
                ->whereIn('id', $request->student_ids ?? [])
                ->pluck('id')
                ->toArray();
            $target_classe->students()->sync($student_ids);
            DB::commit();
            /* return Reply::successWithMessage(trans('app.successes.record_save_success')); */
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }
}
