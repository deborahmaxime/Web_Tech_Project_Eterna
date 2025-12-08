<?php
// Test different connection methods
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

$envFile = __DIR__ . '/../env/connect.env';
$env = @parse_ini_file($envFile);

$username = trim($env['username'] ?? '');
$password = trim($env['password'] ?? '');
$dbname = trim($env['dbname'] ?? '');

$results = [];

// Test 1: localhost
try {
    $conn = new mysqli('localhost', $username, $password, $dbname);
    $results['localhost'] = $conn->connect_error ? 'failed: ' . $conn->connect_error : 'success';
    if (!$conn->connect_error) $conn->close();
} catch (Exception $e) {
    $results['localhost'] = 'error: ' . $e->getMessage();
}

// Test 2: 127.0.0.1
try {
    $conn = new mysqli('127.0.0.1', $username, $password, $dbname);
    $results['127.0.0.1'] = $conn->connect_error ? 'failed: ' . $conn->connect_error : 'success';
    if (!$conn->connect_error) $conn->close();
} catch (Exception $e) {
    $results['127.0.0.1'] = 'error: ' . $e->getMessage();
}

// Test 3: localhost with socket
try {
    $conn = new mysqli('localhost', $username, $password, $dbname, null, '/var/run/mysqld/mysqld.sock');
    $results['localhost_socket'] = $conn->connect_error ? 'failed: ' . $conn->connect_error : 'success';
    if (!$conn->connect_error) $conn->close();
} catch (Exception $e) {
    $results['localhost_socket'] = 'error: ' . $e->getMessage();
}

// Test 4: Check if we can even reach MySQL
$results['mysql_socket_exists'] = file_exists('/var/run/mysqld/mysqld.sock') ? 'yes' : 'no';
$results['mysql_socket2_exists'] = file_exists('/tmp/mysql.sock') ? 'yes' : 'no';

// Test 5: Try PDO instead
try {
    $pdo = new PDO("mysql:host=localhost;dbname=$dbname", $username, $password);
    $results['pdo_localhost'] = 'success';
    $pdo = null;
} catch (PDOException $e) {
    $results['pdo_localhost'] = 'failed: ' . $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>
