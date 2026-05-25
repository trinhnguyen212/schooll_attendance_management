<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Enums\RoleType;
use App\Helper\NumberHelper;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\IndexRequest;
use App\Http\Requests\Attendance\StoreRequest;
use App\Http\Requests\Attendance\SubmitRequest;
use App\Http\Requests\Attendance\UpdateRequest;
use App\Models\Classe;
use App\Models\Attendance;
use App\Models\AttendanceResult;
use App\Models\User;
use App\Models\UserChild;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceController extends Controller
{

    public function index(IndexRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::ATTENDANCE_VIEW), 403);
        $date = Carbon::now();
        $relations = [
            'classe',
        ];
        if ($request->month != null && $request->year != null) {
            $date->setYear((int)$request->year);
            $date->setMonth((int)$request->month);
        }

        try {
            $data = Attendance::with($relations)           
                ->whereMonth('attendance_date', '=', $date->month)
                ->whereYear('attendance_date', '=', $date->year)
                ->orderBy('attendance_date');

            switch ($user->role_id) {
                case RoleType::ADMIN->value:
                    $data = $data->get();
                    break;
                
                case RoleType::STUDENT->value:
                    $data = $data
                        ->whereHas('classe.enrollments', function ($query) use ($user) {
                            $query->where('student_id', '=', $user->id);
                        })
                        ->get();
                    break;
                case RoleType::TEACHER->value:
                    $data = $data
                        ->whereHas('classe.teacher', function ($query) use ($user) {
                            $query->where('id', '=', $user->id);
                        })
                        ->get();
                    break;
                default:
                    return Reply::error(trans('app.errors.something_went_wrong'), 500);
                    break;
            }
            return Reply::successWithData($data, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function store(StoreRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::ATTENDANCE_CREATE), 403);

        DB::beginTransaction();
        try {
            
            # Check permission
            $classe = Classe::select('*');
            switch ($user->role_id) {
                case RoleType::TEACHER->value:
                    $classe = $classe->whereHas('teacher', function ($query) use ($user) {
                        $query->where('id', '=', $user->id);
                    })
                        ->findOrFail($request->classe_id);
                    break;
                case RoleType::ADMIN->value:
                    $classe = $classe->findOrFail($request->classe_id);
                    break;
                default:
                    return Reply::error(trans('app.errors.something_went_wrong'), 500);
                    break;
            }

            $classe_end_date = Carbon::parse($classe->semester->end_date);
            if ($classe->isOver()) {
                return Reply::error(trans('app.errors.semester_end'), 400);
            }
            $attendance_date = Carbon::parse($request->attendance_date);
            if ($attendance_date->greaterThanOrEqualTo($classe_end_date)) {
                return Reply::error(trans('app.errors.attendance_date_greater_than_semester', [
                    'date' => $classe_end_date
                ], 400));
            }
            

$current_date = Carbon::now();  // Get today's date without time

            if ($attendance_date->greaterThan($current_date)) {
                return Reply::error(trans('app.errors.attendance_date_in_future', [
                    'date' => $current_date
                ], 400)); // Prevent creating attendance for a future date
            }
           
            $attendance = Attendance::create([
                'classe_id' => $request->classe_id,
                'name' => $request->name,
                'attendance_date' => $attendance_date,
            ]);

            
            $classe = Classe::find($request->classe_id);

            if ($classe) {
                $student_ids = User::where('role_id', '=', RoleType::STUDENT)
                    ->whereIn('id', $classe->students()->pluck('student_id'))
                    ->pluck('id');
            
                foreach ($student_ids as $student_id) {
                    AttendanceResult::create([
                        'attendance_id' => $attendance->id,
                        'user_id' => $student_id
                    ]);
                }
            }
        DB::commit();
       
          // need to be tested  DB::commit();
            //return Reply::successWithMessage(trans('app.successes.record_save_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function show(string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::ATTENDANCE_VIEW), 403);
        $relations = [

            'classe.teacher'
        ];

        try {
            $attendance = Attendance::with($relations);
            switch ($user->role_id) {
                case RoleType::ADMIN->value:
                    break;
                case RoleType::PARENT->value:
                    // Get child IDs from the user_childs pivot table
                    $childIds = UserChild::where('user_id', $user->id)->pluck('child_id')->toArray();
                    
                    // Ensure the attendance is for one of the parent's children
                    $attendance = $attendance
                        ->whereHas('classe.enrollments', function ($query) use ($childIds) {
                            $query->whereIn('student_id', $childIds);
                        });
                    break;
                case RoleType::STUDENT->value:
                    $attendance = $attendance
                        ->whereHas('classe.enrollments', function ($query) use ($user) {
                            $query->where('student_id', '=', $user->id);
                        });
                    break;
                case RoleType::TEACHER->value:
                    $attendance = $attendance
                        ->whereHas('classe.teacher', function ($query) use ($user) {
                            $query->where('id', '=', $user->id);
                        });

                    break;
                default:
                    return Reply::error(trans('app.errors.something_went_wrong'), 500);
                    break;
            }
            $attendance = $attendance->findOrFail($id);
            return Reply::successWithData($attendance, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function update(UpdateRequest $request, string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::ATTENDANCE_UPDATE), 403);

        $data = collect($request->validated())->toArray();


        DB::beginTransaction();
        try {
            $target_attendance = Attendance::select('*');
            switch ($user->role_id) {
                case RoleType::TEACHER->value:
                    $target_attendance = $target_attendance->whereHas('classe.teacher', function ($query) use ($user) {
                        $query->where('id', '=', $user->id);
                    })
                        ->findOrFail($id);
                    break;
                case RoleType::ADMIN->value:
                    $target_attendance = $target_attendance->findOrFail($id);
                    break;
                default:
                    return Reply::error(trans('app.errors.something_went_wrong'), 500);
                    break;
            }

            $target_attendance->update($data);


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
        abort_if(!$user->hasPermission(PermissionType::ATTENDANCE_DELETE), 403);

        DB::beginTransaction();
        try {
            $attendance = Attendance::select('*');
            switch ($user->role_id) {
                case RoleType::TEACHER->value:
                    $attendance = $attendance->whereHas('classe.teacher', function ($query) use ($user) {
                        $query->where('id', '=', $user->id);
                    })
                        ->findOrFail($id);
                    break;
                case RoleType::ADMIN->value:
                    $attendance = $attendance->findOrFail($id);
                    break;
                default:
                    return Reply::error(trans('app.errors.something_went_wrong'), 500);
                    break;
            }

            $attendance->delete();
            DB::commit();
           // return Reply::successWithMessage(trans('app.successes.record_delete_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }



   


    public function getResults(string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::ATTENDANCE_VIEW), 403);
    
        try {
            $attendanceQuery = Attendance::query();
    
            switch ($user->role_id) {
                case RoleType::ADMIN->value:
                    // No additional filters
                    break;
    
                case RoleType::PARENT->value:
                    $childIds = $user->childs->pluck('id'); // Get child IDs only once
                    $attendanceQuery->whereHas('classe.enrollments', function ($query) use ($childIds) {
                        $query->whereIn('student_id', $childIds);
                    });
                    break;
    
                case RoleType::STUDENT->value:
                    $attendanceQuery->whereHas('classe.enrollments', function ($query) use ($user) {
                        $query->where('student_id', $user->id);
                    });
                    break;
    
                case RoleType::TEACHER->value:
                    $attendanceQuery->whereHas('classe.teacher', function ($query) use ($user) {
                        $query->where('id', $user->id);
                    });
                    break;
    
                default:
                    return Reply::error(trans('app.errors.something_went_wrong'), 500);
            }
    
            $attendance = $attendanceQuery->findOrFail($id);
    
            // Get results with user data
            $attendanceResultsQuery = $attendance->attendance_results()->with('user');
    
            // Apply DB-level filtering based on role
            if ($user->role_id === RoleType::PARENT->value) {
                $attendanceResultsQuery->whereIn('user_id', $childIds);
            } elseif ($user->role_id === RoleType::STUDENT->value) {
                $attendanceResultsQuery->where('user_id', $user->id);
            }
    
            $attendance_results = $attendanceResultsQuery->get();
    
            // Final format
            $results = $attendance_results->map(fn($result) => [
                'user' => $result->user,
                'result' => $result
            ])->values();
    
            return Reply::successWithData($results, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
    
    

}
