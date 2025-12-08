<?php
header('Content-Type: application/json');
session_start();
require_once 'database.php';

$response = ['success' => false, 'message' => ''];

try {
    // 1. Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('You must be logged in to delete a capsule');
    }

    $userId = $_SESSION['user_id'];

    // 2. Get the capsule ID from request
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['capsule_id'])) {
        throw new Exception('Capsule ID is required');
    }

    $capsuleId = intval($data['capsule_id']);

    // 3. Verify this capsule belongs to this user
    $stmt = $conn->prepare("
        SELECT capsule_id, user_id, title 
        FROM capsules 
        WHERE capsule_id = ? AND user_id = ? AND is_deleted = FALSE
    ");
    $stmt->bind_param('ii', $capsuleId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Capsule not found or you do not have permission to delete it');
    }

    // 4. Delete the capsule (soft delete)
    $deleteStmt = $conn->prepare("
        UPDATE capsules 
        SET is_deleted = TRUE, 
            deleted_at = NOW() 
        WHERE capsule_id = ? AND user_id = ?
    ");
    $deleteStmt->bind_param('ii', $capsuleId, $userId);
    
    if ($deleteStmt->execute() && $deleteStmt->affected_rows > 0) {
        $response['success'] = true;
        $response['message'] = 'Capsule deleted successfully';
    } else {
        throw new Exception('Failed to delete capsule');
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    error_log("Delete Capsule Error: " . $e->getMessage() . " | User ID: " . ($_SESSION['user_id'] ?? 'NONE') . " | Capsule ID: " . ($capsuleId ?? 'NONE'));
}

echo json_encode($response);
$conn->close();
?>