<?php

namespace App\Http\Controllers\Api;

use App\Enums\PermissionType;
use App\Helper\Reply;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteRequest;
use App\Http\Requests\Branch\IndexRequest;
use App\Http\Requests\Branch\StoreRequest;
use App\Http\Requests\Branch\UpdateRequest;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BranchController extends Controller
{
    public function index(IndexRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::BRANCH_VIEW), 403);

        $branches = Branch::with([
            'leader'
        ])->latest('id');

        try {
            if ($request->search != null) {
                $branches = $branches->search($request->search);
            }
            $branches = $branches->paginate($request->per_page);
            return Reply::successWithData($branches, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function store(StoreRequest $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::BRANCH_CREATE), 403);
        $data = $request->validated();
        DB::beginTransaction();

        try {
            Branch::create($data);
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
        abort_if(!$user->hasPermission(PermissionType::BRANCH_VIEW), 403);

        try {
            $data = Branch::with([
                'leader'
            ])->findOrFail($id);
            return Reply::successWithData($data, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }

    public function update(UpdateRequest $request, string $id)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::BRANCH_UPDATE), 403);
        $data = $request->validated();
        DB::beginTransaction();

        try {
            $branch = Branch::findOrFail($id);
            $branch->update($data);
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
        abort_if(!$user->hasPermission(PermissionType::BRANCH_DELETE), 403);
        DB::beginTransaction();

        try {
            Branch::destroy($request->ids);
            DB::commit();
            return Reply::successWithMessage(trans('app.successes.record_delete_success'));
        } catch (\Exception $error) {
            DB::rollBack();
            return $this->handleException($error);
        }
    }
    public function autocomplete(Request $request)
    {
        $user = $this->getUser();
        abort_if(!$user->hasPermission(PermissionType::BRANCH_VIEW), 403);

        try {
            $school_classes = Branch::search($request->search)
                ->take($this->autoCompleteResultLimit)
                ->get();
            return Reply::successWithData($school_classes, '');
        } catch (\Exception $error) {
            return $this->handleException($error);
        }
    }
}
