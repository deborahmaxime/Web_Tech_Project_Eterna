<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
//database connection

include_once "database.php";

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

$firstName = $input['firstName'] ?? '';
$lastName = $input['lastName'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

// Validate input
if (empty($firstName) || empty($lastName) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
    exit;
}

// Check if user already exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    exit;
}

// Hash password
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password_hash, joined_date) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("ssss", $firstName, $lastName, $email, $passwordHash);

if ($stmt->execute()) {
    // Get the newly created user
    $stmt = $conn->prepare("SELECT user_id, first_name, last_name, email, joined_date, profile_photo, bio, theme_mode, privacy_level FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    echo json_encode([
        'success' => true, 
        'message' => 'Account created successfully!',
        'user' => [
            'id' => $user['user_id'],
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'email' => $user['email'],
            'joinDate' => $user['joined_date'],
            'profilePhoto' => $user['profile_photo'],
            'bio' => $user['bio'],
            'themeMode' => $user['theme_mode'],
            'privacyLevel' => $user['privacy_level']
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create account']);
}

$conn->close();
?>