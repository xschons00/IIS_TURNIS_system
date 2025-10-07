<?php



function start()
{
    echo "Start function called.\n";
    $db = mysqli_init();
    if (!mysqli_real_connect($db, 'xjakubk00@eva.fit.vut.cz:', 'xjakubk00', 'timnu3ir', 'xjakubk00', 0, '/var/run/mysql/mysql.sock')) {
	die('cannot connect '.mysqli_connect_error());
    }
}
start();
