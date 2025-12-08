<?php
header('Content-Type: application/json');
session_start();
require_once 'database.php';

$response = ['success' => false, 'message' => ''];

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('You must be logged in to share a capsule');
    }

    // Get the request data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['capsule_id']) || !isset($data['email'])) {
        throw new Exception('Missing required fields');
    }

    $capsuleId = intval($data['capsule_id']);
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $message = isset($data['message']) ? filter_var($data['message'], FILTER_SANITIZE_STRING) : '';

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Please enter a valid email address');
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Check if the capsule exists and belongs to the user
        $stmt = $conn->prepare("
            SELECT * FROM capsules 
            WHERE capsule_id = ? AND user_id = ?
        ");
        $stmt->bind_param('ii', $capsuleId, $_SESSION['user_id']);
        $stmt->execute();
        $capsule = $stmt->get_result()->fetch_assoc();
        
        if (!$capsule) {
            throw new Exception('Capsule not found or you do not have permission to share it');
        }

        // Check if the recipient exists
        $stmt = $conn->prepare("
            SELECT user_id FROM users WHERE email = ? AND user_id != ?
        ");
        $stmt->bind_param('si', $email, $_SESSION['user_id']);
        $stmt->execute();
        $recipient = $stmt->get_result()->fetch_assoc();
        
        if (!$recipient) {
            throw new Exception('The recipient does not exist or is the same as the owner');
        }

        $recipientId = $recipient['user_id'];

        // Check if the capsule is already shared with this user
        $stmt = $conn->prepare("
            SELECT * FROM shared_capsules 
            WHERE capsule_id = ? AND shared_with = ?
        ");
        $stmt->bind_param('ii', $capsuleId, $recipientId);
        $stmt->execute();
        
        if ($stmt->get_result()->num_rows > 0) {
            throw new Exception('This capsule is already shared with this user');
        }

        // Share the capsule
        $stmt = $conn->prepare("
            INSERT INTO shared_capsules (capsule_id, shared_by, shared_with, shared_at, message)
            VALUES (?, ?, ?, NOW(), ?)
        ");
        $stmt->bind_param('iiis', $capsuleId, $_SESSION['user_id'], $recipientId, $message);
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to share capsule');
        }

        // Commit transaction
        $conn->commit();
        
        $response['success'] = true;
        $response['message'] = 'Capsule shared successfully';
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>
