<?php

return [
    'required' => 'Pleaase enter the :attribute.',
    'string' => 'The :attribute field must be a string.',
    'integer' => 'The :attribute number field must be an integer.',
    'in' => 'The selected value for :attribute is invalid.',
    'unique' => 'The :attribute field already exists in the system.',
    'email' => 'The :attribute field must be a valid email address.',
    'alpha_dash' => 'The :attribute field must only contain letters, numbers, dashes, and underscores.',
    'max' => [
        'string' => 'The :attribute field must not exceed :max characters.',
    ],
    'min' => [
        'array' => 'The :attribute field must have at least :min items.'
    ],
    'size' => [
        'string' => 'The :attribute field must be :size characters.'
    ],
    'regex' => 'The :attribute field format is invalid.',
    'date' => 'The :attribute field must be a valid date.',
    'before' => 'The :attribute field must be a date before :date.',
    'after' => 'The :attribute field must be a date after :date.',
    'required_if' => 'The :attribute field is required when :other is :value.',
    'attributes' => [
        'name' => 'name',
        'first_name' => 'first name',
        'last_name' => 'last name',
        'shortcode' => 'shortcode',
        'role' => 'role',
        'email' => 'email',
        'address' => 'address',
        'phone_number' => 'phone number',
        'disabilities_allergies_conditions ' => 'Disabilities allergies conditions',
        'birth_date' => 'birth date',
        'student_current_level_id' => 'student current level',
        'student_studying_id' => 'student studying',
        'learning_objective_id' => 'learning objective',
        'school_of_thought_id' => 'school of thought',
        'branch_id' => 'branch',
        'password' => 'password',
        'content' => 'content',
        'start_date' => 'start date',
        'end_date' => 'end date',
        'teacher_id' => 'teacher',
    ],
    'custom' => [
        'role' => [
            'in' => 'The selected role is invalid. Please choose from student, teacher, parent or administrator.',
        ],
        'shortcode' => [
            'unique' => 'The shortcode has already been used. Please choose a different one.',
        ],
        'email' => [
            'unique' => 'The email address has already been used. Please choose a different one.',
        ],
        'phone_number' => [
            'unique' => 'The phone number has already been used. Please choose a different one.',
            'regex' => 'The phone number must start with 0 and have 10 digits.'
        ],
        'birth_date' => [
            'before' => 'The birth date must be a date before today.',
        ],

        'learning_objective_id' => [
            'required_if' => 'The learning objective field is required when the role is student.',
        ],
        'student_studying_id' => [
            'required_if' => 'The student studying field is required when the role is student.',
        ],
        'student_current_level_id' => [
            'required_if' => 'The student current level field is required when the role is student.',
        ],
        'school_of_thought_id' => [
            'required_if' => 'The school of thought field is required when the role is student.',
        ],
        'branch_id' => [
            'required_if' => 'The branch field is required when the role is teacher or student.',
        ],
        'password' => [
            'confirmed' => 'The password confirmation does not match.',
            'min' => 'The password must contain at least :min characters.',
        ],

        'options.*' => [
            'required' => 'Please enter the answer content',
            'distinct' => 'The answer content must be unique'
        ],
        // 'true_option' => [
        //     '*' => 'Please select the correct answer for this question.'
        // ],
        'options' => [
            'min' => [
                'array' => 'Please enter atleast 2 answers'
            ]
        ],

    ],
    'attribute_sum_min' => 'Total of :attribute must be at least :min',
    'attribute_sum_max' => 'Total of :attribute must not exceed :max',
];
