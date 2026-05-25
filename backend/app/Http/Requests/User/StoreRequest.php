<?php

namespace App\Http\Requests\User;

use App\Traits\CustomValidateResponse;
use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    use CustomValidateResponse;
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'in:student,teacher,admin,parent'],
            'shortcode' => ['required', 'string', 'unique:users', 'max:255', 'alpha_dash:ascii'],
            'email' => ['required', 'email', 'unique:users'],
            'first_name' => ['required', 'max:255'],
            'last_name' => ['required', 'max:255'],
            'phone_number' => ['nullable', 'string', 'unique:users', 'regex:/^0\d{9}$/'],
            'disabilities_allergies_conditions' => ['nullable', 'string'],
            'gender' => ['required', 'in:male,female'],
            'address' => ['required', 'string', 'max:255'],
            'birth_date' => ['required', 'date', 'before:today'],
            'school_of_thought_id' => ['required_if:role,student', 'max:255'],
            'learning_objective_id' => ['required_if:role,student', 'max:255'],
            'student_current_level_id' => ['required_if:role,student', 'max:255'],
            'student_studying_id' => ['required_if:role,student', 'max:255'],
            'branch_id' => ['required_if:role,teacher', 'max:255'],
            'password' => ['required', 'min:8'],

            'parent_ids' => ['nullable', 'array'],
            'parent_ids.*' => ['nullable', 'integer', 'distinct'],
        ];
    }
}
