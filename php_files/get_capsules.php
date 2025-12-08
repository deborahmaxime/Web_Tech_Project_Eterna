<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

include_once "database.php";

$userId = $_GET['user_id'] ?? '';

if (empty($userId)) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit;
}

$stmt = $conn->prepare("
    SELECT 
        capsule_id, 
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
    WHERE user_id = ? AND is_deleted = FALSE
    ORDER BY created_at DESC
");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$capsules = [];
while ($row = $result->fetch_assoc()) {
    // Get media for this capsule
    $mediaStmt = $conn->prepare("
        SELECT media_id, media_type, file_name, file_path, mime_type 
        FROM media 
        WHERE capsule_id = ? 
        ORDER BY display_order, upload_date
    ");
    $mediaStmt->bind_param("i", $row['capsule_id']);
    $mediaStmt->execute();
    $mediaResult = $mediaStmt->get_result();
    
    $media = [];
    while ($mediaRow = $mediaResult->fetch_assoc()) {
        $media[] = $mediaRow;
    }
    
    $row['media'] = $media;
    $capsules[] = $row;
}

echo json_encode([
    'success' => true,
    'capsules' => $capsules
]);

$conn->close();
?>