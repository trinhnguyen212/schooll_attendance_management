<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteRequest;
use App\Http\Requests\SchoolOfThought\IndexRequest;
use App\Http\Requests\SchoolOfThought\StoreRequest;
use App\Http\Requests\SchoolOfThought\UpdateRequest;
use App\Models\SchoolOfThought;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SchoolOfThoughtController extends Controller
{
    public function index(IndexRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::SCHOOL_OF_THOUGHT_VIEW), 403);

        $school_of_thoughts = SchoolOfThought::latest('id');

        try {
            if ($request->search != null) {
                $school_of_thoughts = $school_of_thoughts->search($request->search);
            }
            $school_of_thoughts = $school_of_thoughts->paginate($request->per_page);
            return Reply::successWithData($school_of_thoughts, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function store(StoreRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::SCHOOL_OF_THOUGHT_CREATE), 403);
        $data = $request->validated();

        DB::beginTransaction();
        try {
            SchoolOfThought::create($data);
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
        abort_if(!$user->hasPermission(PermissionType::SCHOOL_OF_THOUGHT_VIEW), 403);

        try {
            $data = SchoolOfThought::findOrFail($id);
            return Reply::successWithData($data, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function update(UpdateRequest $request, string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::SCHOOL_OF_THOUGHT_UPDATE), 403);
        $data = $request->validated();

        DB::beginTransaction();
        try {
            $school_of_thought = SchoolOfThought::findOrFail($id);
            $school_of_thought->update($data);
            DB::commit();
            // return Reply::successWithMessage(trans('app.successes.record_save_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }

    public function destroy(DeleteRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::SCHOOL_OF_THOUGHT_DELETE), 403);
        DB::beginTransaction();

        try {
            SchoolOfThought::destroy($request->ids);
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
        abort_if(!$user->hasPermission(PermissionType::SCHOOL_OF_THOUGHT_VIEW), 403);

        try {
            $school_of_thoughts = SchoolOfThought::search($request->search)
                ->take($this->autoCompleteResultLimit)
                ->get();
            return Reply::successWithData($school_of_thoughts, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
}
