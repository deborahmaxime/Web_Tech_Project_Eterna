<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

// Suppress HTML errors
ini_set('display_errors', 0);
ini_set('log_errors', 1);

include_once "database.php";

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }

    $capsuleId = $input['capsule_id'] ?? '';
    $title = $input['title'] ?? '';
    $description = $input['description'] ?? '';
    $storyText = $input['story_text'] ?? '';
    $dateOfMemory = $input['date_of_memory'] ?? '';
    $locationName = $input['location_name'] ?? '';
    $capsuleType = $input['capsule_type'] ?? '';

    // Validate required fields
    if (empty($capsuleId)) {
        throw new Exception('Capsule ID is required');
    }

    if (empty($title)) {
        throw new Exception('Title is required');
    }

    // Map capsule_type from frontend values
    if (!empty($capsuleType)) {
        $capsuleType = match(strtolower($capsuleType)) {
            'private' => 'private',
            'shared' => 'shared',
            'future' => 'future',
            default => 'private'
        };
    }

    // Build dynamic update query
    $updates = [];
    $params = [];
    $types = '';

    if (!empty($title)) {
        $updates[] = "title = ?";
        $params[] = $title;
        $types .= 's';
    }

    if (!empty($description)) {
        $updates[] = "description = ?";
        $params[] = $description;
        $types .= 's';
    }

    if (!empty($storyText)) {
        $updates[] = "story_text = ?";
        $params[] = $storyText;
        $types .= 's';
    }

    if (!empty($dateOfMemory)) {
        $updates[] = "date_of_memory = ?";
        $params[] = $dateOfMemory;
        $types .= 's';
    }

    if (!empty($locationName)) {
        $updates[] = "location_name = ?";
        $params[] = $locationName;
        $types .= 's';
    }

    if (!empty($capsuleType)) {
        $updates[] = "capsule_type = ?";
        $params[] = $capsuleType;
        $types .= 's';
    }

    // If no updates, return error
    if (empty($updates)) {
        throw new Exception('No data to update');
    }

    // Add capsule_id to params
    $params[] = $capsuleId;
    $types .= 'i';

    // Build and execute query
    $sql = "UPDATE capsules SET " . implode(", ", $updates) . " WHERE capsule_id = ? AND is_deleted = FALSE";

    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Database prepare failed: ' . $conn->error);
    }

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception('Update failed: ' . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        // Check if capsule exists
        $checkStmt = $conn->prepare("SELECT capsule_id FROM capsules WHERE capsule_id = ? AND is_deleted = FALSE");
        $checkStmt->bind_param("i", $capsuleId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows === 0) {
            throw new Exception('Capsule not found or has been deleted');
        }
        
        // Capsule exists but no changes were made
        echo json_encode([
            'success' => true,
            'message' => 'No changes were made to the capsule'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Capsule updated successfully!'
        ]);
    }

    $stmt->close();
    
} catch (Exception $e) {
    error_log('Error in edit_capsule.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>