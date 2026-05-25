<?php

namespace App\Http\Requests\Attendance;

use App\Rules\AttributeSumMin;
use App\Traits\CustomValidateResponse;
use Carbon\Carbon;
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
        $now = Carbon::now()->toDateTimeString();
       // $max_questions = array_sum($this->question_counts);
        return [
            'name' => ['required'],
            'attendance_date' => ['required', 'date', "before:$now"],
            'classe_id' => ['required', 'integer'],

        ];
    }
}
