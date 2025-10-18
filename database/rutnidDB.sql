-- Drop existing tables if they exist
-- to allow re-running this script without errors

START TRANSACTION;
DROP TABLE IF EXISTS Player_Participant;
DROP TABLE IF EXISTS Team_Participant;
DROP TABLE IF EXISTS Team_Member;
DROP TABLE IF EXISTS Event_Match;
DROP TABLE IF EXISTS _User;
DROP TABLE IF EXISTS Team;
DROP TABLE IF EXISTS _Event;

-- CREATE TABLES

CREATE TABLE _User (
    user_ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(20) NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    faculty ENUM('ENGINEERING', 'CHEMISTRY', 'COMPUTER_SCIENCE', 'BUSINESS', 'ARTS') NOT NULL,
    ranking INTEGER CHECK (ranking >= 0),
    role ENUM('ADMIN', 'USER') NOT NULL
);

CREATE TABLE Team (
    team_ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(20) NOT NULL UNIQUE,
    ranking INTEGER CHECK (ranking >= 0)
);

CREATE TABLE Team_Member (
    team_ID INTEGER,
    user_ID INTEGER,
    PRIMARY KEY (team_ID, user_ID),
    FOREIGN KEY (team_ID) REFERENCES Team(team_ID),
    FOREIGN KEY (user_ID) REFERENCES _User(user_ID)
);

CREATE TABLE _Event (
    event_ID INTEGER AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(20) NOT NULL,
    description VARCHAR(500) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    event_type ENUM('SOLO', 'TEAM') NOT NULL,
    max_participants INTEGER CHECK (max_participants > 0)
);

CREATE TABLE Event_Match (
    event_ID INTEGER,
    participant_A INTEGER,
    participant_B INTEGER,
    time DATE NOT NULL,
    winner INTEGER,
    PRIMARY KEY (event_ID, participant_A, participant_B),
    FOREIGN KEY (event_ID) REFERENCES _Event(event_ID),
    FOREIGN KEY (participant_A) REFERENCES _User(user_ID),
    FOREIGN KEY (participant_B) REFERENCES _User(user_ID),
    FOREIGN KEY (winner) REFERENCES _User(user_ID)
);

CREATE TABLE Player_Participant (
    event_ID INTEGER,
    user_ID INTEGER,
    final_placement INTEGER CHECK (final_placement > 0),
    PRIMARY KEY (event_ID, user_ID),
    FOREIGN KEY (event_ID) REFERENCES _Event(event_ID),
    FOREIGN KEY (user_ID) REFERENCES _User(user_ID)
);

CREATE TABLE Team_Participant (
    event_ID INTEGER,
    team_ID INTEGER,
    final_placement INTEGER CHECK (final_placement > 0),
    PRIMARY KEY (event_ID, team_ID),
    FOREIGN KEY (event_ID) REFERENCES _Event(event_ID),
    FOREIGN KEY (team_ID) REFERENCES Team(team_ID)
);

-- INSERT SAMPLE DATA

-- Insert sample users
INSERT INTO _User (user_name, first_name, last_name, email, password, faculty, role) VALUES
('bwhite', 'Bob', 'White', 'bwhite@gmail.com', 'password789', 'BUSINESS', 'ADMIN'),
('jdoe', 'John', 'Doe', 'jdoe@gmail.com', 'password123', 'ENGINEERING', 'USER'),
('asmith', 'Alice', 'Smith', 'asmith@gmail.com', 'password456', 'ARTS', 'USER'),
('mjones', 'Michael', 'Jones', 'mjones@gmail.com', 'password321', 'COMPUTER_SCIENCE', 'USER'),
('lwilson', 'Linda', 'Wilson', 'wilson@gmail.com', 'password654', 'CHEMISTRY', 'USER');
-- Insert sample teams
INSERT INTO Team (team_name, ranking) VALUES
('The Aces', 1),
('The Rockets', 2),
('The Warriors', 3);
-- Insert team members
INSERT INTO Team_Member (team_ID, user_ID) VALUES
(1, 2), -- John Doe in The Aces
(1, 3), -- Alice Smith in The Aces
(2, 4), -- Michael Jones in The Rockets
(2, 5), -- Linda Wilson in The Rockets
(3, 2), -- John Doe in The Warriors
(3, 4); -- Michael Jones in The Warriors
-- Insert sample events
INSERT INTO _Event (event_name, description, event_date, location, event_type, max_participants) VALUES
('Solo Championship', 'A solo competition for individual players.', '2024-12-15', 'Main Hall', 'SOLO', 16),
('Team Tournament', 'A team-based tournament for groups of players.', '2024-11-20', 'Sports Arena', 'TEAM', 8);
-- Insert sample player participants
INSERT INTO Player_Participant (event_ID, user_ID, final_placement) VALUES
(1, 2, 1), -- John Doe placed 1st in Solo Championship
(1, 3, 2), -- Alice Smith placed 2nd in Solo Championship
(1, 4, 3), -- Michael Jones placed 3rd in Solo Championship
(1, 5, 4); -- Linda Wilson placed 4th in Solo Championship
-- Insert sample team participants
INSERT INTO Team_Participant (event_ID, team_ID, final_placement) VALUES
(2, 1, 1), -- The Aces placed 1st in Team Tournament
(2, 2, 2), -- The Rockets placed 2nd in Team Tournament
(2, 3, 3); -- The Warriors placed 3rd in Team Tournament
-- Insert sample event matches
INSERT INTO Event_Match (event_ID, participant_A, participant_B, time, winner) VALUES
(1, 2, 3,'2024-12-15 10:00', 2), -- John Doe vs Alice Smith, John wins
(1, 4, 5,'2024-12-15 11:00', 4), -- Michael Jones vs Linda Wilson, Michael wins
(1, 2, 4,'2024-12-15 12:00', 2); -- John Doe vs Michael Jones, John wins

COMMIT;