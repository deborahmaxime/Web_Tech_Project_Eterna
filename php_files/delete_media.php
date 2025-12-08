<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

ini_set('display_errors', 0);
ini_set('log_errors', 1);

session_start();
include_once "database.php";

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input');
    }

    $mediaIds = $input['media_ids'] ?? [];

    if (empty($mediaIds) || !is_array($mediaIds)) {
        throw new Exception('No media IDs provided');
    }

    $deletedCount = 0;
    $errors = [];

    foreach ($mediaIds as $mediaId) {
        // Get file path before deleting from database
        $stmt = $conn->prepare("SELECT file_path FROM media WHERE media_id = ?");
        $stmt->bind_param("i", $mediaId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($row = $result->fetch_assoc()) {
            $filePath = '../' . $row['file_path'];
            
            // Delete from database
            $deleteStmt = $conn->prepare("DELETE FROM media WHERE media_id = ?");
            $deleteStmt->bind_param("i", $mediaId);
            
            if ($deleteStmt->execute()) {
                // Delete physical file
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                $deletedCount++;
            } else {
                $errors[] = "Failed to delete media ID: $mediaId";
            }
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "$deletedCount media file(s) deleted successfully",
        'deleted_count' => $deletedCount,
        'errors' => $errors
    ]);

} catch (Exception $e) {
    error_log('Error in delete_media.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>