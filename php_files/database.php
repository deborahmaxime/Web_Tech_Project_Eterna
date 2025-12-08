<?php
// database.php

// Disable HTML error output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Import environment variables from connect.env
$envFile = __DIR__ . '/../env/connect.env';

error_log("Looking for env file at: " . $envFile);

if (!file_exists($envFile)) {
    header('Content-Type: application/json');
    die(json_encode(['success' => false, 'message' => 'Environment file not found: ' . $envFile]));
}

$env = @parse_ini_file($envFile);

// Check if env variables are loaded
if (!$env || !is_array($env)) {
    header('Content-Type: application/json');
    error_log("Failed to parse env file. File contents: " . file_get_contents($envFile));
    die(json_encode(['success' => false, 'message' => 'Failed to parse environment file']));
}

// Trim all values to remove whitespace
$servername = trim($env['servername'] ?? 'localhost');
$username = trim($env['username'] ?? 'root');
$password = trim($env['password'] ?? '');
$dbname = trim($env['dbname'] ?? 'eternaDb_');

// Remove quotes if present (in case password is quoted in env file)
$password = trim($password, '"\'');
$username = trim($username, '"\'');
$dbname = trim($dbname, '"\'');

// Set CORS headers to allow requests from any origin (for development)
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header('Access-Control-Allow-Origin: ' . $origin);
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

error_log("Database config - host: $servername, user: $username, db: $dbname");

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    header('Content-Type: application/json');
    error_log("Database connection failed: " . $conn->connect_error);
    die(json_encode(['success' => false, 'message' => 'Database connection failed. Please check server logs.']));
}

// Set charset to utf8mb4 for proper encoding
$conn->set_charset('utf8mb4');

error_log("Database connection successful");
?>