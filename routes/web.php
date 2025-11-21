<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('index');
});

Route::get('/tournaments', function () {
    return view('tournaments');
});

Route::get('/teams', function () {
    return view('teams');
});