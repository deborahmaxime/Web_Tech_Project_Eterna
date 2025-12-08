<?php
session_start();

// Check if user is logged in
if (!isset($_SESSION['email'])) {
    // Not logged in, redirect to login page
    header("Location: login.html");
    exit();
}

// User is logged in, you can access user info from session
$user = [
    'id' => $_SESSION['user_id'] ?? null,
    'email' => $_SESSION['email'] ?? null,
    'first_name' => $_SESSION['first_name'] ?? null,
    'last_name' => $_SESSION['last_name'] ?? null,
    'profile_photo' => $_SESSION['profile_photo'] ?? null,
    'bio' => $_SESSION['bio'] ?? null,
    'theme_mode' => $_SESSION['theme_mode'] ?? null,
    'privacy_level' => $_SESSION['privacy_level'] ?? null,
    'join_date' => $_SESSION['join_date'] ?? null
];

// Optionally, you can return JSON for an API request
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'User is logged in',
    'user' => $user
]);
exit();