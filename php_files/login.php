<?php
// CRITICAL: Start session BEFORE any output
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once "database.php";

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

// Validate input
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

// Find user by email - CHECK IF ACTIVE
$stmt = $conn->prepare("
    SELECT user_id, first_name, last_name, email, password_hash, 
           joined_date, profile_photo, bio, theme_mode, privacy_level, last_login 
    FROM users 
    WHERE email = ? AND is_active = TRUE
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

// Verify password
if (!password_verify($password, $user['password_hash'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit;
}

// Update last login
$updateStmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
$updateStmt->bind_param("i", $user['user_id']);
$updateStmt->execute();

// ===== STORE USER DATA IN SESSION =====
$_SESSION['user_id'] = $user['user_id'];
$_SESSION['email'] = $user['email'];
$_SESSION['first_name'] = $user['first_name'];
$_SESSION['last_name'] = $user['last_name'];
$_SESSION['profile_photo'] = $user['profile_photo'];
$_SESSION['bio'] = $user['bio'];
$_SESSION['theme_mode'] = $user['theme_mode'];
$_SESSION['privacy_level'] = $user['privacy_level'];
$_SESSION['join_date'] = $user['joined_date'];
$_SESSION['logged_in'] = true;

// Log for debugging
error_log("Login successful - Session ID: " . session_id() . " | User ID: " . $_SESSION['user_id'] . " | Email: " . $_SESSION['email']);

// Return success response
echo json_encode([
    'success' => true, 
    'message' => 'Welcome back, ' . $user['first_name'] . '!',
    'user' => [
        'id' => $user['user_id'],
        'firstName' => $user['first_name'],
        'lastName' => $user['last_name'],
        'email' => $user['email'],
        'joinDate' => $user['joined_date'],
        'profilePhoto' => $user['profile_photo'],
        'bio' => $user['bio'],
        'themeMode' => $user['theme_mode'],
        'privacyLevel' => $user['privacy_level'],
        'lastLogin' => date('Y-m-d H:i:s')
    ]
]);

$conn->close();
?>