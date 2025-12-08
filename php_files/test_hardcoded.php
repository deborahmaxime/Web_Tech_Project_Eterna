<?php
// Test with hardcoded password to verify
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

$envFile = __DIR__ . '/../env/connect.env';
$env = @parse_ini_file($envFile);

$username = 'kevin.bigirimana';
$dbname = 'webtech_2025A_kevin_bigirimana';

$results = [];

// Test 1: Password from env file
$password_from_env = trim($env['password'] ?? '');
try {
    $conn = new mysqli('localhost', $username, $password_from_env, $dbname);
    $results['env_file_password'] = [
        'length' => strlen($password_from_env),
        'result' => $conn->connect_error ? 'failed: ' . $conn->connect_error : 'success'
    ];
    if (!$conn->connect_error) $conn->close();
} catch (Exception $e) {
    $results['env_file_password']['result'] = 'error: ' . $e->getMessage();
}

// Test 2: Hardcoded password (replace with your actual password)
// REPLACE THIS WITH YOUR ACTUAL PASSWORD TO TEST
$password_manual = 'Bigi3@webtech';
try {
    $conn = new mysqli('localhost', $username, $password_manual, $dbname);
    $results['hardcoded_password'] = [
        'length' => strlen($password_manual),
        'result' => $conn->connect_error ? 'failed: ' . $conn->connect_error : 'success'
    ];
    if (!$conn->connect_error) $conn->close();
} catch (Exception $e) {
    $results['hardcoded_password']['result'] = 'error: ' . $e->getMessage();
}

// Test 3: Compare them
$results['passwords_match'] = ($password_from_env === $password_manual);
$results['env_password_base64'] = base64_encode($password_from_env);
$results['manual_password_base64'] = base64_encode($password_manual);

echo json_encode($results, JSON_PRETTY_PRINT);
?>
