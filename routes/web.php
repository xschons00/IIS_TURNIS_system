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

Route::get('/players', function () {
    return view('players');
});

Route::get('/teams/create', function () {
    return view('create-team');
});