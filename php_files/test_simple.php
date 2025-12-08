<?php
// Ultra simple test - no database
header('Content-Type: application/json');

echo json_encode([
    'status' => 'PHP is working',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown'
], JSON_PRETTY_PRINT);
?>
