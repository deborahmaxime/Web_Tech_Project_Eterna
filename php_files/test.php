<?php
include_once "database.php";

if ($conn) {
    echo json_encode(['success' => true, 'message' => 'Database connected!', 'db_name' => 'eternaDb_']);
} else {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . mysqli_connect_error()]);
}
?>