<?php
// Test environment file parsing
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$envFile = __DIR__ . '/../env/connect.env';

$result = [
    'env_file_path' => $envFile,
    'file_exists' => file_exists($envFile),
    'file_readable' => is_readable($envFile),
    'file_contents' => '',
    'parsed_env' => null,
    'parse_error' => null
];

if (file_exists($envFile)) {
    $result['file_contents'] = file_get_contents($envFile);
    $env = @parse_ini_file($envFile);
    if ($env === false) {
        $result['parse_error'] = 'parse_ini_file() returned false';
    } else {
        $result['parsed_env'] = $env;
    }
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>
