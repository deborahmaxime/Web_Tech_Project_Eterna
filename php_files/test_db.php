<?php
// Test database connection
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

$startTime = microtime(true);

$result = [
    'step' => 'starting',
    'timestamp' => date('Y-m-d H:i:s'),
    'execution_time' => 0
];

try {
    // Step 1: Load env file
    $result['step'] = 'loading_env';
    $envFile = __DIR__ . '/../env/connect.env';
    
    if (!file_exists($envFile)) {
        throw new Exception('Env file not found');
    }
    
    $env = @parse_ini_file($envFile);
    if (!$env) {
        throw new Exception('Failed to parse env file');
    }
    
    $result['env_loaded'] = true;
    $result['step'] = 'connecting_to_database';
    
    // Step 2: Connect to database
    $servername = $env['servername'] ?? 'localhost';
    $username = $env['username'] ?? '';
    $password = $env['password'] ?? '';
    $dbname = $env['dbname'] ?? '';
    
    $result['db_config'] = [
        'host' => $servername,
        'user' => $username,
        'database' => $dbname
    ];
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception('Connection failed: ' . $conn->connect_error);
    }
    
    $result['step'] = 'database_connected';
    $result['connection'] = 'success';
    
    // Step 3: Check if users table exists
    $result['step'] = 'checking_tables';
    $tableCheck = $conn->query("SHOW TABLES LIKE 'users'");
    $result['users_table_exists'] = ($tableCheck->num_rows > 0);
    
    if ($result['users_table_exists']) {
        $countResult = $conn->query("SELECT COUNT(*) as count FROM users");
        $count = $countResult->fetch_assoc();
        $result['users_count'] = $count['count'];
    }
    
    $conn->close();
    
    $result['step'] = 'completed';
    $result['status'] = 'success';
    
} catch (Exception $e) {
    $result['status'] = 'error';
    $result['error'] = $e->getMessage();
}

$result['execution_time'] = round((microtime(true) - $startTime) * 1000, 2) . 'ms';

echo json_encode($result, JSON_PRETTY_PRINT);
?>
