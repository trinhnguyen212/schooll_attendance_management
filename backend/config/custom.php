<?php

return [
    'app' => [
        'demo' => (bool)env('DEMO', false),
        'app_author' => env('APP_AUTHOR'),
        'must_verify_email' => (bool)env('MUST_VERIFY_EMAIL', false),
        'otp_code_timeout_seconds' => (int)env('OTP_CODE_TIMEOUT_SECONDS', 600),
        'token_expiration_minutes' => (int)env('TOKEN_EXPIRATION_MINUTES'),
        'default_rate_limit' => (int)env('DEFAULT_RATE_LIMIT', 100),
        'content_security_policy' => env('CONTENT_SECURITY_POLICY'),
    ],
    'query' => [
        'slow_query_time' => (int)env('SLOW_QUERY_MILISECONDS', 100),
        'auto_complete_result_limit' => (int)env('AUTO_COMPLETE_RESULT_LIMIT', 5),
        'default_limit' => (int) env('DEFAULT_QUERY_LIMIT', 50),
    ],
    'demo_credentials' => [
        'password' => (string)env('DEMO_PASSWORD'),
    ],
    
];
