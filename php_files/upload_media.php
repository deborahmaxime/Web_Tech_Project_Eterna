<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Disable HTML error output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

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

// Determine paths based on environment
$uploadDir = __DIR__ . '/../uploads/capsules/' . $capsuleId . '/';
// Store relative path in database - JavaScript will handle environment-specific prefixes
$webPath = 'uploads/capsules/' . $capsuleId . '/';

error_log("Upload directory: $uploadDir");
error_log("Parent directory writable: " . (is_writable(__DIR__ . '/../uploads/capsules/') ? 'yes' : 'no'));

// Create upload directory if it doesn't exist
if (!is_dir($uploadDir)) {
    $oldumask = umask(0);
    $result = @mkdir($uploadDir, 0777, true);
    umask($oldumask);
    
    if (!$result) {
        $error = error_get_last();
        error_log("Failed to create directory: $uploadDir - Error: " . ($error['message'] ?? 'unknown'));
        error_log("Parent exists: " . (is_dir(__DIR__ . '/../uploads/capsules/') ? 'yes' : 'no'));
        error_log("Parent writable: " . (is_writable(__DIR__ . '/../uploads/capsules/') ? 'yes' : 'no'));
        echo json_encode(['success' => false, 'message' => 'Failed to create upload directory. Please check server permissions.']);
        exit;
    }
    error_log("Successfully created directory: $uploadDir");
}

$uploadedFiles = [];
$errors = [];

// Check if files were uploaded
if (!isset($_FILES['media']) || !is_array($_FILES['media']['name'])) {
    error_log("No files in upload: " . json_encode($_FILES));
    echo json_encode(['success' => false, 'message' => 'No files uploaded']);
    exit;
}

// Get the count of uploaded files
$fileCount = count($_FILES['media']['name']);
error_log("Processing $fileCount file(s) for capsule $capsuleId");

// Process each file
for ($i = 0; $i < $fileCount; $i++) {
    // Skip if error
    if ($_FILES['media']['error'][$i] !== UPLOAD_ERR_OK) {
        $errorMsg = "Error uploading file " . ($i + 1) . ": " . $_FILES['media']['error'][$i];
        error_log($errorMsg);
        $errors[] = $errorMsg;
        continue;
    }
    
    $fileName = basename($_FILES['media']['name'][$i]);
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $uniqueFileName = uniqid() . '_' . time() . '_' . $i . '.' . $fileExtension;
    $filePath = $uploadDir . $uniqueFileName;
    $webFilePath = $webPath . $uniqueFileName;
    
    error_log("Attempting to upload: $fileName to $filePath");
    
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
        error_log("File successfully moved to: $filePath");
        
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
            error_log("Media record inserted to database: media_id=" . $conn->insert_id);
            $uploadedFiles[] = [
                'media_id' => $conn->insert_id,
                'file_name' => $fileName,
                'media_type' => $mediaType,
                'file_path' => $webFilePath
            ];
        } else {
            $errorMsg = "Database insert failed: " . $stmt->error;
            error_log($errorMsg);
            $errors[] = $errorMsg;
        }
    } else {
        $errorMsg = "Failed to move uploaded file: " . $fileName . " - " . error_get_last()['message'];
        error_log($errorMsg);
        $errors[] = $errorMsg;
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