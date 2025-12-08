<?php
// Script to fix media file paths in database
// Remove the full server path prefix and keep only relative paths

header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);

include_once "database.php";

try {
    // Update media paths that start with /~kevin.bigirimana/Web_Tech_Project_Eterna/
    $sql = "UPDATE media 
            SET file_path = REPLACE(file_path, '/~kevin.bigirimana/Web_Tech_Project_Eterna/', '') 
            WHERE file_path LIKE '/~kevin.bigirimana/Web_Tech_Project_Eterna/%'";
    
    if ($conn->query($sql)) {
        $affectedRows = $conn->affected_rows;
        
        // Get all media paths to verify
        $result = $conn->query("SELECT media_id, file_path FROM media");
        $paths = [];
        while ($row = $result->fetch_assoc()) {
            $paths[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'message' => "Fixed $affectedRows media path(s)",
            'affected_rows' => $affectedRows,
            'current_paths' => $paths
        ]);
    } else {
        throw new Exception($conn->error);
    }
    
} catch (Exception $e) {
    error_log("Fix media paths error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fix paths: ' . $e->getMessage()
    ]);
}

$conn->close();
?>
