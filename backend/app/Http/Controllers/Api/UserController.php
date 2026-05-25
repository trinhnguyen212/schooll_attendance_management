<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Enums\RoleType;
use App\Exports\UsersExport;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteRequest;
use App\Http\Requests\User\AutoCompleteRequest;
use App\Http\Requests\User\ExportableRequest;
use App\Http\Requests\User\ExportRequest;
use App\Http\Requests\User\ImportRequest;
use App\Http\Requests\User\PaginateRequest;
use App\Http\Requests\User\GetAllRequest;
use App\Http\Requests\User\SearchRequest;
use App\Http\Requests\User\StoreRequest;
use App\Http\Requests\User\UpdateRequest;
use App\Models\Branch;
use App\Models\StudentStudying;
use App\Models\LearningObjective;
use App\Models\StudentCurrentLevel;
use App\Models\SchoolOfThought;
use App\Models\User;
use App\Models\UserChild;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class UserController extends Controller
{
    public function index()
    {
        $data = (object) [];
        $data->user = $this->getUser()->load(['role', 'school_of_thought', 'learning_objective', 'student_studying', 'student_current_level', 'branch', 'childs']);
        try {
            $data->permissions = $data->user->role->permissions()->pluck('name');
            return Reply::successWithData($data, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function store(StoreRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_CREATE), 403);

        DB::beginTransaction();
        try {
            $data = collect($request->validated())->except(['role', 'school_of_thought_id', 'learning_objective_id', 'student_current_level_id', 'student_studying_id', 'branch_id', 'child_ids', 'child_ids.*'])->toArray();

            $data['password'] = Hash::make($request->password);
            $data['role_id'] = RoleType::valueFromName($request->role);
            if ($request->role == 'student') {
                $data['school_of_thought_id'] = $request->school_of_thought_id;
                $data['student_current_level_id'] = $request->student_current_level_id;
                $data['learning_objective_id'] = $request->learning_objective_id;
                $data['student_studying_id'] = $request->student_studying_id;
                $data['disabilities_allergies_conditions'] = $request->disabilities_allergies_conditions;
                $data['branch_id'] = $request->branch_id;
            }

            if ($request->role == 'teacher') {
                $data['branch_id'] = $request->branch_id;
            }
            $data['birth_date'] = Carbon::parse($request->birth_date);
            $target_user = User::create($data);
            if ($request->role == 'parent') {
                $child_ids = User::where('role_id', '=', RoleType::STUDENT)
                    ->whereIn('id', $request->child_ids)
                    ->pluck('id');
                foreach ($child_ids as $child_id) {
                    UserChild::create([
                        'user_id' => $target_user->id,
                        'child_id' => $child_id
                    ]);
                }
            }
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
        abort_if(!$user->hasPermission(PermissionType::USER_VIEW) && $id != $user->id, 403);

        try {
            $data = User::with(['role', 'school_of_thought', 'learning_objective', 'student_current_level', 'student_studying', 'branch', 'childs'])->findOrFail($id);
            return Reply::successWithData($data, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function update(UpdateRequest $request, string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_UPDATE), 403);

        DB::beginTransaction();
        try {
            $target_user = User::with('role')->findOrFail($id);

            if ($target_user->role_id == RoleType::ADMIN->value && $user->id != $target_user->id) {
                return Reply::error(trans('app.errors.403'), 403);
            }

            $data = collect($request->validated())->except(['password', 'school_of_thought_id', 'learning_objective_id', 'student_studying_id', 'student_current_level_id', 'branch_id', 'child_ids', 'child_ids.*'])->toArray();

            if ($user->id == $id)
                $data['is_active'] = 1;

            if ($request->password != null && $target_user->role_id != RoleType::ADMIN->value) {
                $data['password'] = Hash::make($request->password);
            }

            if ($target_user->role_id == RoleType::STUDENT->value) {
                //  $data['school_class_id'] = $request->school_class_id;
                $data['school_of_thought_id'] = $request->school_of_thought_id;
                $data['learning_objective_id'] = $request->learning_objective_id;
                $data['student_current_level_id'] = $request->student_current_level_id;
                $data['student_studying_id'] = $request->student_studying_id;
                $data['disabilities_allergies_conditions'] = $request->disabilities_allergies_conditions;
                $data['branch_id'] = $request->branch_id;

            }
            if ($target_user->role_id == RoleType::PARENT->value) {
                if ($request->child_ids == null) {
                    UserChild::where('user_id', '=', $target_user->id)
                        ->delete();
                } else {
                    $will_be_deleted_child_ids = $target_user->childs()
                        ->whereNotIn('user_id', $request->child_ids)
                        ->pluck('user_id');

                    UserChild::where('user_id', '=', $target_user->id)
                        ->whereIn('user_id', $will_be_deleted_child_ids)
                        ->delete();

                    $existing_child_ids = $target_user->childs()
                        ->whereIn('user_id', $request->child_ids)
                        ->pluck('user_id')->toArray();

                    $child_ids = User::where('role_id', '=', RoleType::STUDENT)
                        ->whereIn('id', $request->child_ids)
                        ->pluck('id');

                    foreach ($child_ids as $child_id) {
                        if (in_array($child_id, $existing_child_ids))
                            continue;
                        UserChild::create([
                            'user_id' => $target_user->id,
                            'child_id' => $child_id
                        ]);
                    }
                }
            }

            if ($target_user->role_id == RoleType::TEACHER->value) {
                $data['branch_id'] = $request->branch_id;
            }

            if ($target_user->email != $data['email']) {
                $data['email_verified_at'] = null;
            }

            $data['birth_date'] = Carbon::parse($request->birth_date);
            $target_user->update($data);
            DB::commit();
            if ($data['is_active'] == 0)
                $target_user->tokens()->delete();
            // return Reply::successWithMessage(trans('app.successes.record_save_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function destroy(DeleteRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_DELETE), 403);

        DB::beginTransaction();
        try {
            User::whereIn('id', $request->ids)
                ->where('id', '<>', $user->id)
                ->delete();
            DB::commit();
            // return Reply::successWithMessage(trans('app.successes.record_delete_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function paginateUsers(PaginateRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_VIEW), 403);

        try {
            $users = User::with(['role', 'school_of_thought', 'branch'])
                ->where('role_id', '=', RoleType::valueFromName($request->role));

            if ($request->school_of_thought_id) {
                $users = $users->where('school_of_thought_id', $request->school_of_thought_id);
            }

            if ($request->branch_id) {
                $users = $users->where('branch_id', $request->branch_id);
            }
            if ($request->search != null) {
                $users = $users->where(function ($query) use ($request) {
                    $query->whereFullText(User::FULLTEXT, $request->search);
                    if (ctype_alnum($request->search)) {
                        $query->orWhere('shortcode', 'like', "$request->search%");
                    }
                });
            }

            $users = $users->latest('id')->paginate($request->per_page);
            return Reply::successWithData($users, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function importUsers(ImportRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_CREATE), 403);

        DB::beginTransaction();
        try {
            $file = $request->file('file');
            $role_id = RoleType::valueFromName($request->role);
            $sheets = Excel::toArray([], $file);
            $data = [];

            $non_exists_classes = [];
            $non_exists_branches = [];
            $non_exists_schools = [];
            $non_exists_levels = [];
            $non_exists_studyings = [];
            $non_exists_objectives = [];

            $duplicate_emails = [];
            $duplicate_phones = [];

            foreach ($sheets[0] as $index => $row) {
                if ($index == 0) continue;

                $gender = isset($row[4]) ? strtolower($row[4]) : null;
                if (!in_array($gender, ['male', 'female'])) {
                    $gender = 'male';
                }

                $phone_number = isset($row[3]) ? (string) $row[3] : '';
                $phone_number = preg_replace('/[^0-9]/', '', $phone_number);
                if ($phone_number && $phone_number[0] !== '0') {
                    $phone_number = '0' . $phone_number;
                }

                $email = isset($row[2]) ? $row[2] : null;
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return Reply::error("Invalid email address: {$email}.");
                }

                // Collect duplicates first
                $is_duplicate = false;

                if (User::where('email', $email)->exists()) {
                    $duplicate_emails[] = $email;
                    $is_duplicate = true;
                }

                if ($phone_number && User::where('phone_number', $phone_number)->exists()) {
                    $duplicate_phones[] = $phone_number;
                    $is_duplicate = true;
                }

                // If duplicate, skip this row's processing
                if ($is_duplicate) {
                    continue;
                }

                $birth_date = isset($row[6])
                    ? (is_numeric($row[6])
                        ? Carbon::instance(Date::excelToDateTimeObject($row[6]))
                        : Carbon::parse($row[6]))
                    : null;

                $first_name_letters = strtoupper(substr($row[0], 0, 2));
                $last_name_letters = strtoupper(substr($row[1], 0, 2));
                $timestamp = time();

                if ($request->role == 'student') {
                    $shortcode = 'STU' . $first_name_letters . $last_name_letters . $timestamp;
                } elseif ($request->role == 'teacher') {
                    $shortcode = 'TEA' . $first_name_letters . $last_name_letters . $timestamp;
                } elseif ($request->role == 'parent') {
                    $shortcode = 'PA' . $first_name_letters . $last_name_letters . $timestamp;
                } else {
                    $shortcode = $first_name_letters . $last_name_letters . $timestamp;
                }

                $shortcode = strtoupper(preg_replace('/[^a-zA-Z0-9-_]/', '', $shortcode));

                $record = [
                    'role' => $request->role,
                    'shortcode' => $shortcode,
                    'first_name' => $row[0] ?? null,
                    'last_name' => $row[1] ?? null,
                    'email' => $email,
                    'phone_number' => $phone_number,
                    'gender' => $gender,
                    'address' => $row[5] ?? null,
                    'birth_date' => $birth_date,
                    'is_active' => true,
                    'password' => 'Changme1234!',
                ];

                $validated_result = $this->validateUserArray($record);
                if ($validated_result['is_valid'] == false) {
                    return Reply::error($validated_result['message']);
                }
                $validated_record = $validated_result['data'];

                if ($request->role == 'student') {
                    $validated_record['disabilities_allergies_conditions'] = $row[11] ?? null;

                    $school_of_thought_id = SchoolOfThought::where('name', $row[8])->pluck('id')->first();
                    $validated_record['school_of_thought_id'] = $school_of_thought_id;
                    if ($school_of_thought_id == null) $non_exists_schools[] = $row[8];

                    $student_current_level_id = StudentCurrentLevel::where('name', $row[9])->pluck('id')->first();
                    $validated_record['student_current_level_id'] = $student_current_level_id;
                    if ($student_current_level_id == null) $non_exists_levels[] = $row[9];

                    $learning_objective_id = LearningObjective::where('name', $row[10])->pluck('id')->first();
                    $validated_record['learning_objective_id'] = $learning_objective_id;
                    if ($learning_objective_id == null) $non_exists_objectives[] = $row[10];

                    $student_studying_id = StudentStudying::where('name', $row[7])->pluck('id')->first();
                    $validated_record['student_studying_id'] = $student_studying_id;
                    if ($student_studying_id == null) $non_exists_studyings[] = $row[7];
                }

                if ($request->role == 'teacher') {
                    $branch_id = Branch::where('shortcode', $row[7])->pluck('id')->first();
                    $validated_record['branch_id'] = $branch_id;
                    if ($branch_id == null) $non_exists_branches[] = $row[0];
                }

                $validated_record = collect($validated_record)->except(['role'])->toArray();
                $validated_record['password'] = Hash::make($record['password']);
                $validated_record['role_id'] = $role_id;

                $data[] = $validated_record;
            }

            if (count($non_exists_classes)) {
                return Reply::error(trans('app.errors.class_not_exists', [
                    'shortcodes' => implode(', ', $non_exists_classes)
                ]));
            }

            if (count($non_exists_schools)) {
                return Reply::error(trans('app.errors.school_not_exists', [
                    'shortcodes' => implode(', ', $non_exists_schools)
                ]));
            }

            if (count($non_exists_branches)) {
                return Reply::error(trans('app.errors.branch_not_exists', [
                    'shortcodes' => implode(', ', $non_exists_branches)
                ]));
            }

    if (!empty($duplicate_emails) || !empty($duplicate_phones)) {
        return response()->json([
            'success' => true,
            'message' => trans('app.successes.record_save_success'),
            'duplicates' => [
                'emails' => array_unique($duplicate_emails),
                'phones' => array_unique($duplicate_phones),
            ],
        ]);
    }


            foreach ($data as $row) {
                User::create($row);
            }

            DB::commit();
            return Reply::successWithMessage(trans('app.successes.record_save_success'));

        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function exportableFields(ExportableRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_VIEW), 403);

        $hiddens = $user->getHidden();
        $fillable = $user->getFillable();

        $hiddens[] = 'role_id';
        $hiddens[] = 'school_of_thought_id';
        $hiddens[] = 'branch_id';
        $hiddens[] = 'learning_objective_id';
        $hiddens[] = 'student_studying_id';
        $hiddens[] = 'student_current_level_id';
        $hiddens[] = 'disabilities_allergies_conditions';
        $hiddens[] = 'is_active';
        $hiddens[] = 'email_verified_at';

        $columns = array_filter($fillable, function ($value) use ($hiddens) {
            return !in_array($value, $hiddens);
        });

        $data = [];

        foreach ($columns as $column) {
            $data[] = [
                'field_name' => trans("headers.users.$column"),
                'field' => $column
            ];
        }

        if ($request->role == 'teacher') {
            $data[] = [
                'field_name' => trans('headers.branch.shortcode'),
                'field' => 'branch.name'
            ];
        }

        if ($request->role == 'student') {
            $data[] = [
                'field_name' => trans('headers.learning_objective.name'),
                'field' => 'learning_objective.name'
            ];
            $data[] = [
                'field_name' => trans('headers.student_studying.name'),
                'field' => 'student_studying.name'
            ];
            $data[] = [
                'field_name' => trans('headers.student_current_level.name'),
                'field' => 'student_current_level.name'
            ];

$data[] = [
        'field_name' => trans('headers.school_of_thought.name'),
        'field' => 'school_of_thought.name'
    ];

        }
        return Reply::successWithData($data, '');    }

    public function exportUsers(ExportRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_VIEW), 403);
        $data = $request->validated();

        try {
            $query = User::where('role_id', '=', RoleType::valueFromName($data['role']));
              if ($data['role'] == 'student') {
                 $query = $query->with(['learning_objective', 'school_of_thought', 'student_studying', 'student_current_level']);
             }  
            if ($data['role'] == 'teacher')
                $query = $query->with('branch');

            if ($request->school_of_thought_id) {
                $query = $query->where('school_of_thought_id', $request->school_of_thought_id);
            }
            if ($request->learning_objective_id) {
                $query = $query->where('learning_objective_id', $request->learning_objective_id);
            }
            if ($request->student_studying_id) {
                $query = $query->where('student_studying_id', $request->student_studying_id);
            }
            if ($request->student_current_level_id) {
                $query = $query->where('student_current_level_id', $request->student_current_level_id);
            }

            if ($request->branch_id) {
                $query = $query->where('branch_id', $request->branch_id);
            }
            if ($request->search != null) {
                $query = $query->where(function ($query) use ($request) {
                    $query->whereFullText(User::FULLTEXT, $request->search);
                    if (ctype_alnum($request->search)) {
                        $query->orWhere('shortcode', 'like', "$request->search%");
                    }
                });
            }

            $hiddens = (new User())->getHidden();
            $columns = array_filter($data['fields'], function ($value) use ($hiddens) {
                return !in_array($value, $hiddens);
            });

            $collection = $query->get();
            return Excel::download(
                new UsersExport($collection, $columns),
                'Export-' . trans("role.{$data['role']}") . '-' . Carbon::now() . '.xlsx'
            );
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function autocomplete(AutoCompleteRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_VIEW), 403);

        try {
            $users = User::where('role_id', '=', RoleType::valueFromName($request->role))
                ->search($request->search)
                ->take($this->autoCompleteResultLimit)
                ->get();
            return Reply::successWithData($users, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function searchUsers(SearchRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_VIEW), 403);

        try {
            $users = User::with(['role', 'branch', 'school_of_thought', 'learning_objective', 'student_studying', 'student_current_level'])
                ->where('role_id', '=', RoleType::valueFromName($request->role))
                ->latest('id');
            if ($request->search) {
                $users = $users->whereFullText(User::FULLTEXT, $request->search);
            }
            $users = $users->take($this->autoCompleteResultLimit * 10)
                ->get();

            return Reply::successWithData($users, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function validateUserArray($record)
    {
        $store_request = new StoreRequest();

        $rules = collect($store_request->rules())->except([
            'branch_id',
            'learning_objective_id',
            'student_studying_id',
            'student_current_level_id',
            'school_of_thought_id'
        ])->toArray();

        $validator = Validator::make($record, $rules);

        if ($validator->fails()) {
            return [
                'is_valid' => false,
                'data' => ValidationException::withMessages($validator->errors()->toArray()),
                'message' => $validator->errors()->first()
            ];
        }
        return [
            'is_valid' => true,
            'data' => $validator->validated(),
        ];
    }

    public function getAllUsers(GetAllRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::USER_VIEW), 403);
        try {
            $users = User::where('role_id', '=', RoleType::valueFromName($request->role))
                ->search($request->search)
                ->take($this->autoCompleteResultLimit)
                ->get();
            return Reply::successWithData($users, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
}
