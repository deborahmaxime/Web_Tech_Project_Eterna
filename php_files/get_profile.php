<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
include_once "database.php";

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('You must be logged in');
    }

    $userId = $_SESSION['user_id'];

    // Get user basic info from users table
    $userStmt = $conn->prepare("
        SELECT 
            user_id,
            first_name,
            last_name,
            email,
            DATE_FORMAT(joined_date, '%M %Y') as member_since,
            joined_date
        FROM users 
        WHERE user_id = ?
    ");
    
    $userStmt->bind_param("i", $userId);
    $userStmt->execute();
    $userResult = $userStmt->get_result();
    
    if ($userResult->num_rows === 0) {
        throw new Exception('User not found');
    }
    
    $user = $userResult->fetch_assoc();
    
    // Get profile info from user_profiles table if exists
    $profileStmt = $conn->prepare("
        SELECT 
            bio,
            birth_date,
            location,
            profile_picture
        FROM user_profiles 
        WHERE user_id = ?
    ");
    
    $profileStmt->bind_param("i", $userId);
    $profileStmt->execute();
    $profileResult = $profileStmt->get_result();
    
    if ($profileResult->num_rows > 0) {
        $profile = $profileResult->fetch_assoc();
        // Merge profile data with user data
        $user['bio'] = $profile['bio'] ?? '';
        $user['birth_date'] = $profile['birth_date'] ?? '';
        $user['location'] = $profile['location'] ?? '';
        $user['profile_picture'] = $profile['profile_picture'] ?? '';
    } else {
        // Set default values if profile doesn't exist
        $user['bio'] = '';
        $user['birth_date'] = '';
        $user['location'] = '';
        $user['profile_picture'] = '';
    }
    
    // Get capsule statistics
    $statsStmt = $conn->prepare("
        SELECT 
            COUNT(*) as total_capsules,
            SUM(CASE WHEN capsule_type = 'shared' THEN 1 ELSE 0 END) as shared_count,
            SUM(CASE WHEN capsule_type = 'future' THEN 1 ELSE 0 END) as future_count,
            SUM(CASE WHEN capsule_type = 'private' THEN 1 ELSE 0 END) as private_count
        FROM capsules 
        WHERE user_id = ? AND is_deleted = FALSE
    ");
    
    $statsStmt->bind_param("i", $userId);
    $statsStmt->execute();
    $statsResult = $statsStmt->get_result();
    $stats = $statsResult->fetch_assoc();
    
    $user['stats'] = $stats;
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);

} catch (Exception $e) {
    error_log('Error in get_profile.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>