<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Enums\RoleType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceResult\UpdateRequest;
use App\Models\Attendance;
use App\Models\AttendanceResult;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class AttendanceResultController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //
    }



// need to be kept
    public function updateAttendanceStatus(UpdateRequest $request, string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::ATTENDANCE_UPDATE), 403);
    
        DB::beginTransaction();
        try {
            $target_attendance_result = AttendanceResult::select('*');
    
            switch ($user->role_id) {
                case RoleType::TEACHER->value:
                    $target_attendance_result = $target_attendance_result->whereHas('attendance.classe.teacher', function ($query) use ($user) {
                        $query->where('id', '=', $user->id);
                    })->findOrFail($id);
                    break;
    
                case RoleType::ADMIN->value:
                    $target_attendance_result = $target_attendance_result->findOrFail($id);
                    break;
    
                default:
                    return Reply::error(trans('app.errors.something_went_wrong'), 500);
            }
    
            $target_attendance_result->update([
                'attendance_status' => $request->attendance_status
            ]);
    
            DB::commit();
            // return Reply::successWithMessage(trans('app.successes.record_save_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }
// need to be kept
    public function getAttendanceStatus(string $id)
    {
        $user = $this->getUser();
        
        // Check if the user has permission to view attendance results
        abort_if(!$user->hasPermission(PermissionType::ATTENDANCE_VIEW), 403);
        
        try {
            // Initialize the query for AttendanceResult
            $target_attendance_result = AttendanceResult::select('*');
            
            // Debugging: Log user role and the requested ID
            \Log::info("User Role: " . $user->role_id);
            \Log::info("Attendance ID: " . $id);
        
            switch ($user->role_id) {
                case RoleType::TEACHER->value:
                    // Only teachers can see attendance results for their own classes
                    $target_attendance_result = $target_attendance_result->whereHas('attendance.classe.teacher', function ($query) use ($user) {
                        $query->where('id', '=', $user->id);
                    })->where('attendance_id', '=', $id);  // Query by attendance_id
                    break;
        
                case RoleType::ADMIN->value:
                    // Admin can see all attendance results
                    $target_attendance_result = $target_attendance_result->where('attendance_id', '=', $id); // Query by attendance_id
                    break;
        
                default:
                    return Reply::error(trans('app.errors.something_went_wrong'), 500);
            }
    
            // Fetch the attendance result
            $attendanceResult = $target_attendance_result->first(); // Use first() to avoid exception if no result found
    
            if (!$attendanceResult) {
                \Log::info("No result found for Attendance ID: " . $id);  // Debugging: Log when no result is found
                return response()->json(['message' => 'Attendance result not found'], 404);
            }
            
            // Return the attendance_status value
            return response()->json([
                'attendance_status' => $attendanceResult->attendance_status
            ]);
        } catch (\Exception $error) {
            // Handle any exceptions
            return $this->handleException($error);
        }
    }
    

    

    
}


