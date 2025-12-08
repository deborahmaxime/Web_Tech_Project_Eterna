<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Disable HTML error output to prevent breaking JSON responses
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

include_once "database.php";

$input = json_decode(file_get_contents('php://input'), true);

$userId = $input['user_id'] ?? '';
$title = $input['title'] ?? '';
$date = $input['date'] ?? null;
$location = $input['location'] ?? '';
$text = $input['text'] ?? '';
$privacy = $input['privacy'] ?? 'private';
$unlockDateTime = $input['unlock_date_time'] ?? null;

if (empty($userId) || empty($title)) {
    echo json_encode(['success' => false, 'message' => 'User ID and title required']);
    exit;
}

// Map privacy to capsule_type enum
$capsuleType = strtolower($privacy);
if (!in_array($capsuleType, ['private', 'shared', 'future'])) {
    $capsuleType = 'private';
}

// Set status based on type
$status = ($capsuleType === 'future') ? 'locked' : 'sealed';

// Set open_date - always required by database
if ($capsuleType === 'future' && $unlockDateTime) {
    $openDate = date('Y-m-d H:i:s', strtotime($unlockDateTime));
} else {
    // Default: 1 year from now for non-future capsules
    $openDate = date('Y-m-d H:i:s', strtotime('+1 year'));
}

try {
    $stmt = $conn->prepare("
        INSERT INTO capsules 
        (user_id, title, story_text, date_of_memory, location_name, capsule_type, open_date, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param("isssssss", $userId, $title, $text, $date, $location, $capsuleType, $openDate, $status);
    
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Capsule created successfully!',
        'capsule_id' => $conn->insert_id
    ]);
    
} catch (Exception $e) {
    error_log("Create capsule error: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to create capsule: ' . $e->getMessage()
    ]);
}

$conn->close();
?>