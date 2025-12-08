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

    $firstName = $input['first_name'] ?? '';
    $lastName = $input['last_name'] ?? '';
    $bio = $input['bio'] ?? '';
    $birthDate = $input['birth_date'] ?? null;
    $location = $input['location'] ?? '';

    // Validate required fields
    if (empty($firstName) || empty($lastName)) {
        throw new Exception('First name and last name are required');
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Update users table
        $updateUserStmt = $conn->prepare("
            UPDATE users 
            SET first_name = ?, last_name = ?
            WHERE user_id = ?
        ");
        $updateUserStmt->bind_param('ssi', $firstName, $lastName, $userId);
        
        if (!$updateUserStmt->execute()) {
            throw new Exception('Failed to update user info');
        }

        // Check if profile exists
        $checkStmt = $conn->prepare("SELECT profile_id FROM user_profiles WHERE user_id = ?");
        $checkStmt->bind_param("i", $userId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            // Update existing profile
            $updateProfileStmt = $conn->prepare("
                UPDATE user_profiles 
                SET first_name = ?, 
                    last_name = ?, 
                    bio = ?, 
                    birth_date = ?, 
                    location = ?
                WHERE user_id = ?
            ");
            $updateProfileStmt->bind_param('sssssi', 
                $firstName, 
                $lastName, 
                $bio, 
                $birthDate, 
                $location, 
                $userId
            );
            
            if (!$updateProfileStmt->execute()) {
                throw new Exception('Failed to update profile');
            }
        } else {
            // Create new profile
            $insertProfileStmt = $conn->prepare("
                INSERT INTO user_profiles (user_id, first_name, last_name, bio, birth_date, location) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $insertProfileStmt->bind_param('isssss', 
                $userId, 
                $firstName, 
                $lastName, 
                $bio, 
                $birthDate, 
                $location
            );
            
            if (!$insertProfileStmt->execute()) {
                throw new Exception('Failed to create profile');
            }
        }

        // Update session data
        $_SESSION['first_name'] = $firstName;
        $_SESSION['last_name'] = $lastName;

        // Commit transaction
        $conn->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Profile updated successfully!'
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    error_log('Error in update_profile.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>