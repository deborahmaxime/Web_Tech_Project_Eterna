<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include_once "database.php";

$capsuleId = $_POST['capsule_id'] ?? '';

if (empty($capsuleId)) {
    echo json_encode(['success' => false, 'message' => 'Capsule ID required']);
    exit;
}

// Verify capsule exists
$checkStmt = $conn->prepare("SELECT capsule_id FROM capsules WHERE capsule_id = ?");
$checkStmt->bind_param("i", $capsuleId);
$checkStmt->execute();
if ($checkStmt->get_result()->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Capsule not found']);
    exit;
}

// Create upload directory if it doesn't exist
$uploadDir = '../uploads/capsules/' . $capsuleId . '/';
$webPath = '/uploads/capsules/' . $capsuleId . '/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$uploadedFiles = [];
$errors = [];

// Check if files were uploaded
if (!isset($_FILES['media']) || !is_array($_FILES['media']['name'])) {
    echo json_encode(['success' => false, 'message' => 'No files uploaded']);
    exit;
}

// Get the count of uploaded files
$fileCount = count($_FILES['media']['name']);

// Process each file
for ($i = 0; $i < $fileCount; $i++) {
    // Skip if error
    if ($_FILES['media']['error'][$i] !== UPLOAD_ERR_OK) {
        $errors[] = "Error uploading file " . ($i + 1) . ": " . $_FILES['media']['error'][$i];
        continue;
    }
    
    $fileName = basename($_FILES['media']['name'][$i]);
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $uniqueFileName = uniqid() . '_' . time() . '_' . $i . '.' . $fileExtension;
    $filePath = $uploadDir . $uniqueFileName;
    $webFilePath = $webPath . $uniqueFileName;
    
    // Determine media type from MIME type
    $mimeType = $_FILES['media']['type'][$i];
    if (strpos($mimeType, 'image') !== false) {
        $mediaType = 'image';
    } elseif (strpos($mimeType, 'video') !== false) {
        $mediaType = 'video';
    } elseif (strpos($mimeType, 'audio') !== false) {
        $mediaType = 'audio';
    } else {
        $mediaType = 'document';
    }
    
    // Move uploaded file
    if (move_uploaded_file($_FILES['media']['tmp_name'][$i], $filePath)) {
        // Insert into database
        $stmt = $conn->prepare("
            INSERT INTO media 
            (capsule_id, media_type, file_name, file_path, file_size, mime_type, display_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $fileSize = $_FILES['media']['size'][$i];
        $stmt->bind_param("isssisi", 
            $capsuleId, 
            $mediaType, 
            $fileName, 
            $webFilePath, 
            $fileSize, 
            $mimeType,
            $i
        );
        
        if ($stmt->execute()) {
            $uploadedFiles[] = [
                'media_id' => $conn->insert_id,
                'file_name' => $fileName,
                'media_type' => $mediaType,
                'file_path' => $webFilePath
            ];
        } else {
            $errors[] = "Database error for {$fileName}: " . $stmt->error;
        }
    } else {
        $errors[] = "Failed to move {$fileName} to upload directory";
    }
}

// Send response
if (count($uploadedFiles) > 0) {
    echo json_encode([
        'success' => true,
        'message' => count($uploadedFiles) . ' file(s) uploaded successfully',
        'files' => $uploadedFiles,
        'errors' => $errors
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No files were uploaded successfully',
        'errors' => $errors
    ]);
}

$conn->close();
?>