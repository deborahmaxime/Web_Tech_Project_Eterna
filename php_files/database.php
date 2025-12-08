<?php
// database.php

// Import environment variables from connect.env
$envFile = __DIR__ . '/../env/connect.env';

error_log("Looking for env file at: " . $envFile);

if (!file_exists($envFile)) {
    die(json_encode(['success' => false, 'message' => 'Environment file not found: ' . $envFile]));
}

$env = parse_ini_file($envFile);

// Check if env variables are loaded
if (!$env) {
    die(json_encode(['success' => false, 'message' => 'Failed to parse environment file']));
}

// Set CORS headers to allow requests from your domain
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Start or resume session with secure settings
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
    ini_set('session.use_only_cookies', 1);
    session_start();
}

$servername = $env['servername'] ?? 'localhost';
$username = $env['username'] ?? 'root';
$password = $env['password'] ?? '';
$dbname = $env['dbname'] ?? 'eternaDb_';

error_log("Database config: host=$servername, db=$dbname");

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Set charset to utf8mb4 for proper encoding
$conn->set_charset('utf8mb4');

error_log("Database connection successful");
?>