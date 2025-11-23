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

Route::get('/teams/{id}', function ($id) {
    return view('team-detail');
});

Route::get('/tournaments/create', function () {
    return view('create-tournament');
});

Route::get('/create-tournament', function () {
    return view('create-tournament');
});

Route::get('/login', function () {
    return view('login');
});

Route::get('/register', function () {
    return view('register');
});

Route::get('/players/{id}', function ($id) {
    return view('player-profile');
});

Route::get('/tournaments/{id}', function ($id) {
    return view('tournament-detail');
});

Route::get('/admin/approve-tournaments', function () {
    return view('admin-approve-tournaments');
});

Route::get('/admin/users', function () {
    return view('admin-users');
});
