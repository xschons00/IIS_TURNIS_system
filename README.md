# TURNIS

TURNIS is a web application for managing student tournaments, teams, players, matches, and tournament statistics. The application provides separate functionality for administrators, regular users, and team/event leaders. This project was created as part of the **IIS – Informační systémy** course at **FIT VUT Brno**.

## Features

* **Authentication** – login, logout, and authenticated user information.
* **Player Management** – manage players and edit personal profiles.
* **Team Management** – create and manage teams and their members.
* **Tournament Management** – create and manage tournaments and their participants.
* **Registration** – register or unregister players and teams for tournaments.
* **Tournament Brackets** – generate tournament brackets and manage individual matches.
* **Points and Placements** – calculate participant points and tournament rankings.
* **Statistics** – display aggregated application and tournament statistics.
* **Filtering** – filter players, teams, and tournaments.

## Authors

* Šimon Schon (`xschons00`) – database design and implementation, controllers, testing
* Kamil Jakubčák (`xjakubk00`) – advanced controllers, authentication, testing
* Adrián Pitka Kester (`xpitkaa00`) – GUI design and implementation, testing

## Technology

* **Backend:** Laravel, PHP 8.x
* **Frontend:** React, Vite
* **Database:** MySQL
* **API:** REST API

## Project Structure

The project is organized into a Laravel backend, React frontend, database migrations, and project documentation.

```text
/
├── app/
│   └── Http/
│       └── Controllers/
│           ├── AuthController.php
│           ├── PlayerController.php
│           ├── TeamController.php
│           ├── TeamMembersController.php
│           ├── EventController.php
│           ├── ParticipantsController.php
│           ├── EventMatchController.php
│           ├── StatisticsController.php
│           └── Filters/
│               ├── PlayerFilter.php
│               ├── TeamFilter.php
│               └── EventFilter.php
│
├── database/
│   └── migrations/             # Database migration scripts
│
├── docs/
│   ├── usecase_diagram.drawio   # Use-case diagram
│   └── erd_diagram.drawio       # Database ERD diagram
│
├── resources/                  # Frontend resources
├── routes/                     # Laravel API routes
├── .env.example                # Example environment configuration
└── ...
```

### `app/Http/Controllers`

Contains the backend controllers responsible for handling API requests and implementing the main application use cases.

### `app/Http/Controllers/Filters`

Contains filters used to provide filtered player, team, and tournament lists to the frontend.

### `database/migrations`

Contains Laravel migration scripts used to create and modify the MySQL database schema.

### `docs`

Contains project documentation, including the use-case diagram and ERD database diagram.

### `resources`

Contains frontend resources implemented using React and Vite.

### `routes`

Contains Laravel API route definitions connecting HTTP endpoints with backend controllers.

## Installation

### Backend

Install PHP dependencies:

```bash
composer install
```

Create the environment configuration:

```bash
cp .env.example .env
```

Configure the database connection in `.env`, then generate the Laravel application key:

```bash
php artisan key:generate
```

Create and seed the database:

```bash
php artisan migrate --seed
```

### Frontend

Install JavaScript dependencies:

```bash
npm install
```

Build the frontend:

```bash
npm run build
```

For development, start the Vite development server:

```bash
npm run dev
```

## Test Users

| Login                        | Password   | Role                       |
| ---------------------------- | ---------- | -------------------------- |
| `admin@a`                    | `password` | Administrator              |
| `lena.andrejova@example.com` | `password` | Team/Event leader          |
| `peter.novak@example.com`    | `password` | Regular user / team member |

## Application

The application is available at:

`https://www.stud.fit.vutbr.cz/~xjakubk00/`

## Documentation

* Use-case diagram: `docs/usecase_diagram.drawio`
* ERD diagram: `docs/erd_diagram.drawio`
