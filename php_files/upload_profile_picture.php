<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

session_start();
include_once "database.php";

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('You must be logged in');
    }

    $userId = $_SESSION['user_id'];

    // Check if file was uploaded
    if (!isset($_FILES['profile_picture']) || $_FILES['profile_picture']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error');
    }

    $file = $_FILES['profile_picture'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed');
    }

    // Validate file size (max 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if ($file['size'] > $maxSize) {
        throw new Exception('File is too large. Maximum size is 5MB');
    }

    // Create upload directory if it doesn't exist
    $uploadDir = '../uploads/profiles/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'profile_' . $userId . '_' . time() . '.' . $extension;
    $uploadPath = $uploadDir . $filename;
    $relativePath = 'uploads/profiles/' . $filename;

    // Delete old profile picture if exists
    $oldPicStmt = $conn->prepare("SELECT profile_picture FROM user_profiles WHERE user_id = ?");
    $oldPicStmt->bind_param("i", $userId);
    $oldPicStmt->execute();
    $oldPicResult = $oldPicStmt->get_result();
    
    if ($oldPicRow = $oldPicResult->fetch_assoc()) {
        if (!empty($oldPicRow['profile_picture'])) {
            $oldFilePath = '../' . $oldPicRow['profile_picture'];
            if (file_exists($oldFilePath)) {
                unlink($oldFilePath);
            }
        }
    }

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception('Failed to move uploaded file');
    }

    // Check if user_profiles record exists
    $checkStmt = $conn->prepare("SELECT profile_id FROM user_profiles WHERE user_id = ?");
    $checkStmt->bind_param("i", $userId);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        // Update existing profile
        $updateStmt = $conn->prepare("
            UPDATE user_profiles 
            SET profile_picture = ? 
            WHERE user_id = ?
        ");
        
        $updateStmt->bind_param('si', $relativePath, $userId);
        
        if (!$updateStmt->execute()) {
            // Delete uploaded file if database update fails
            unlink($uploadPath);
            throw new Exception('Failed to update profile picture in database');
        }
    } else {
        // Create new profile record with picture
        // Get first_name and last_name from users table
        $userStmt = $conn->prepare("SELECT first_name, last_name FROM users WHERE user_id = ?");
        $userStmt->bind_param("i", $userId);
        $userStmt->execute();
        $userResult = $userStmt->get_result();
        $userData = $userResult->fetch_assoc();
        
        $insertStmt = $conn->prepare("
            INSERT INTO user_profiles (user_id, first_name, last_name, profile_picture) 
            VALUES (?, ?, ?, ?)
        ");
        
        $insertStmt->bind_param('isss', 
            $userId, 
            $userData['first_name'], 
            $userData['last_name'], 
            $relativePath
        );
        
        if (!$insertStmt->execute()) {
            // Delete uploaded file if database insert fails
            unlink($uploadPath);
            throw new Exception('Failed to create profile with picture');
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Profile picture uploaded successfully',
        'file_path' => $relativePath
    ]);

} catch (Exception $e) {
    error_log('Error in upload_profile_picture.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>