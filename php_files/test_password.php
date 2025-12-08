<?php
// Test the exact password from env file
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

$envFile = __DIR__ . '/../env/connect.env';
$env = @parse_ini_file($envFile);

$result = [
    'password_length' => strlen($env['password']),
    'password_chars' => [],
    'username_length' => strlen($env['username']),
    'test_connection' => null
];

// Show each character in the password
for ($i = 0; $i < strlen($env['password']); $i++) {
    $char = $env['password'][$i];
    $result['password_chars'][] = [
        'char' => $char,
        'ord' => ord($char)
    ];
}

// Try connecting with trimmed values
$servername = trim($env['servername'] ?? '');
$username = trim($env['username'] ?? '');
$password = trim($env['password'] ?? '');
$dbname = trim($env['dbname'] ?? '');

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        $result['test_connection'] = 'failed: ' . $conn->connect_error;
    } else {
        $result['test_connection'] = 'success';
        $conn->close();
    }
} catch (Exception $e) {
    $result['test_connection'] = 'error: ' . $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>
