<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
include_once "database.php";

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('You must be logged in');
    }

    $userId = $_SESSION['user_id'];

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }

    $currentPassword = $input['current_password'] ?? '';
    $newPassword = $input['new_password'] ?? '';

    // Validate input
    if (empty($currentPassword) || empty($newPassword)) {
        throw new Exception('Both current and new passwords are required');
    }

    if (strlen($newPassword) < 6) {
        throw new Exception('New password must be at least 6 characters long');
    }

    // Get current password from database - FIXED: use password_hash column
    $stmt = $conn->prepare("SELECT password_hash FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('User not found');
    }
    
    $user = $result->fetch_assoc();

    // Verify current password
    if (!password_verify($currentPassword, $user['password_hash'])) {
        throw new Exception('Current password is incorrect');
    }

    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password - FIXED: use password_hash column
    $updateStmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?");
    $updateStmt->bind_param('si', $hashedPassword, $userId);
    
    if (!$updateStmt->execute()) {
        throw new Exception('Failed to update password');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully!'
    ]);

} catch (Exception $e) {
    error_log('Error in update_password.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>