<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Suppress HTML errors
ini_set('display_errors', 0);
ini_set('log_errors', 1);

include_once "database.php";

try {
    // Get capsule ID from query string
    $capsuleId = $_GET['capsule_id'] ?? '';

    if (empty($capsuleId)) {
        throw new Exception('Capsule ID required');
    }

    // Validate capsule ID is numeric
    if (!is_numeric($capsuleId)) {
        throw new Exception('Invalid capsule ID format');
    }

    $capsuleId = intval($capsuleId);

    // Prepare query to get capsule data
    $stmt = $conn->prepare("
        SELECT 
            capsule_id, 
            user_id,
            title, 
            description, 
            story_text, 
            date_of_memory, 
            location_name, 
            capsule_type, 
            created_at,
            open_date,
            status
        FROM capsules 
        WHERE capsule_id = ? AND is_deleted = FALSE
    ");
    
    if (!$stmt) {
        throw new Exception('Database prepare failed: ' . $conn->error);
    }
    
    $stmt->bind_param("i", $capsuleId);
    
    if (!$stmt->execute()) {
        throw new Exception('Query execution failed: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Capsule not found or has been deleted');
    }

    $capsule = $result->fetch_assoc();
    
    // Get media files for this capsule
    $mediaStmt = $conn->prepare("
        SELECT 
            media_id, 
            file_name, 
            file_path, 
            media_type, 
            mime_type
        FROM media 
        WHERE capsule_id = ?
        ORDER BY display_order ASC, upload_date ASC
    ");
    
    if ($mediaStmt) {
        $mediaStmt->bind_param("i", $capsuleId);
        $mediaStmt->execute();
        $mediaResult = $mediaStmt->get_result();
        
        $capsule['media'] = [];
        while ($media = $mediaResult->fetch_assoc()) {
            $capsule['media'][] = $media;
        }
        $mediaStmt->close();
    } else {
        $capsule['media'] = [];
    }
    
    $stmt->close();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'capsule' => $capsule
    ]);
    
} catch (Exception $e) {
    error_log('Error in get_capsule_for_edit.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>