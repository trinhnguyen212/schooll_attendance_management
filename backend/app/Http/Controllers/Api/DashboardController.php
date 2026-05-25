<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoleType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\Course;
use App\Models\Attendance;
use App\Models\AttendanceResult;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    
    public function index()
    {
        $user = $this->getUser();
        $data = (object)[];
        $now = now();
        try {
            # Section 1: 4 Cards
            $data->number_of_teachers = User::where('role_id', '=', RoleType::TEACHER)->count();
            $data->number_of_students = User::where('role_id', '=', RoleType::STUDENT)->count();
            $data->number_of_parents = User::where('role_id', '=', RoleType::PARENT)->count();
            $data->number_of_classes = Classe::whereHas('semester', function ($query) use ($now) {
                $query->whereDate('start_date', '<=', $now)
                    ->whereDate('end_date', '>=', $now);
            })->count();
            $data->number_of_courses = Course::count();

            $data->attendances_in_this_month = Attendance::whereBetween(
                'attendance_date',
                [now()->startOfMonth(), now()->endOfMonth()]
            );
            # Section 2
            $data->today_attendances = Attendance::whereDate('attendance_date', $now);


            $attendances_each_month = Attendance::select(DB::raw('MONTH(attendance_date) as month'), DB::raw('COUNT(*) as count'))
                ->whereYear('attendance_date', $now->year)
                ->groupBy('month')
                ->orderBy('month');

            #y
            switch ($user->role_id) {
                case RoleType::ADMIN->value:
                    $data->attendances_in_this_month = $data->attendances_in_this_month->count();
                    $data->today_attendances = $data->today_attendances->get();
                    break;
                case RoleType::PARENT->value:
                    $data->attendances_in_this_month = $data->attendances_in_this_month->count();
                    $data->today_attendances = $data->today_attendances->get();
                    break;
                case RoleType::TEACHER->value:

                    //
                    $data->number_of_classes = Classe::whereHas('semester', function ($query) use ($now) {
                        $query->whereDate('start_date', '<=', $now)
                              ->whereDate('end_date', '>=', $now);
                    })
                    ->whereHas('teacher', function ($query) use ($user) {
                        $query->where('id', '=', $user->id);
                    })
                    ->count();
                    

                    $data->today_attendances = $data->today_attendances->whereHas('classe.teacher', function ($query) use ($user) {
                        $query->where('id', '=', $user->id);
                    })->get();

                    break;
                case RoleType::STUDENT->value:
                    $data->number_of_classes = Classe::whereHas('semester', function ($query) use ($now) {
                        $query->whereDate('start_date', '<=', $now)
                              ->whereDate('end_date', '>=', $now);
                    })
                    ->whereHas('enrollments.student', function ($query) use ($user) {
                        $query->where('id', '=', $user->id);
                    })
                    ->count();


                       //// //
                    $data->attendances_in_this_month = $data->attendances_in_this_month->whereHas('classe.enrollments', function ($query) use ($user) {
                        $query->where('student_id', '=', $user->id);
                    })->count();
                    $data->today_attendances = $data->today_attendances->whereHas('classe.enrollments', function ($query) use ($user) {
                        $query->where('student_id', '=', $user->id);
                    })->get();
                    $attendances_each_month = $attendances_each_month
                        ->whereHas('classe.enrollments', function ($query) use ($user) {
                            $query->where('student_id', '=', $user->id);
                        });
                    break;
                default:
                    return Reply::error(trans('app.errors.something_went_wrong'), 500);
            }


            $attendances_each_month = $attendances_each_month->pluck('count', 'month')
                ->toArray();
            $data->attendances_each_month = array_values(array_replace(array_fill(1, 12, 0), $attendances_each_month));
            return Reply::successWithData($data, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
}
