<?php
header('Content-Type: application/json');
session_start();
require_once 'database.php';

$response = ['success' => false, 'message' => ''];

try {
    // Check if user is logged in
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('You must be logged in to update a capsule');
    }

    // Get the capsule ID from the form data
    $capsuleId = isset($_POST['capsule_id']) ? intval($_POST['capsule_id']) : 0;
    
    if ($capsuleId <= 0) {
        throw new Exception('Invalid capsule ID');
    }

    // Get form data
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $storyText = trim($_POST['story_text'] ?? '');
    $dateOfMemory = !empty($_POST['date_of_memory']) ? $_POST['date_of_memory'] : null;
    $locationName = trim($_POST['location_name'] ?? '');
    $isPrivate = isset($_POST['is_private']) && $_POST['is_private'] === '1';
    $capsuleType = $isPrivate ? 'private' : 'shared';

    // Validate required fields
    if (empty($title)) {
        throw new Exception('Title is required');
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Update the capsule
        $stmt = $conn->prepare("
            UPDATE capsules 
            SET title = ?, 
                description = ?, 
                story_text = ?, 
                date_of_memory = ?, 
                location_name = ?, 
                capsule_type = ?,
                updated_at = NOW()
            WHERE capsule_id = ? AND user_id = ?
        ");
        
        $stmt->bind_param('ssssssii', 
            $title, 
            $description, 
            $storyText, 
            $dateOfMemory, 
            $locationName, 
            $capsuleType,
            $capsuleId,
            $_SESSION['user_id']
        );
        
        if (!$stmt->execute()) {
            throw new Exception('Failed to update capsule: ' . $stmt->error);
        }

        // Handle media uploads if any
        if (!empty($_FILES['media']['name'][0])) {
            $mediaDir = __DIR__ . '/../uploads/capsules/' . $capsuleId . '/';
            if (!file_exists($mediaDir)) {
                mkdir($mediaDir, 0777, true);
            }

            foreach ($_FILES['media']['tmp_name'] as $key => $tmpName) {
                $fileName = basename($_FILES['media']['name'][$key]);
                $filePath = $mediaDir . $fileName;
                $fileType = $_FILES['media']['type'][$key];
                $fileSize = $_FILES['media']['size'][$key];

                if (move_uploaded_file($tmpName, $filePath)) {
                    $mediaStmt = $conn->prepare("
                        INSERT INTO media (capsule_id, file_path, mime_type, file_size, upload_date)
                        VALUES (?, ?, ?, ?, NOW())
                    ");
                    $relativePath = 'uploads/capsules/' . $capsuleId . '/' . $fileName;
                    $mediaStmt->bind_param('issi', $capsuleId, $relativePath, $fileType, $fileSize);
                    $mediaStmt->execute();
                }
            }
        }
        /*

        // Handle tags if needed
        if (!empty($_POST['tags'])) {
            $tags = is_array($_POST['tags']) ? $_POST['tags'] : json_decode($_POST['tags'], true);
            
            // First, remove existing tags
            $deleteTagsStmt = $conn->prepare("DELETE FROM capsule_tags WHERE capsule_id = ?");
            $deleteTagsStmt->bind_param('i', $capsuleId);
            $deleteTagsStmt->execute();

            // Add new tags
            $insertTagStmt = $conn->prepare("
                INSERT INTO tags (tag_name) 
                VALUES (?) 
                ON DUPLICATE KEY UPDATE tag_id=LAST_INSERT_ID(tag_id)
            ");
            
            $insertCapsuleTagStmt = $conn->prepare("
                INSERT INTO capsule_tags (capsule_id, tag_id) 
                VALUES (?, LAST_INSERT_ID())
            ");

            foreach ($tags as $tag) {
                $tag = trim($tag);
                if (!empty($tag)) {
                    $insertTagStmt->bind_param('s', $tag);
                    $insertTagStmt->execute();
                    $insertCapsuleTagStmt->bind_param('ii', $capsuleId, $conn->insert_id);
                    $insertCapsuleTagStmt->execute();
                }
            }
        }*/

        // Commit transaction
        $conn->commit();
        $response = [
            'success' => true,
            'message' => 'Capsule updated successfully',
            'capsule_id' => $capsuleId
        ];

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
?>
