CREATE DATABASE proyecto_auth;
USE proyecto_auth;
DROP DATABASE proyecto_auth;

CREATE TABLE users(
    id INT AUTO_INCREMENT,
    mail varchar(255),
    pass varchar(255),
    CONSTRAINT pk_id_user PRIMARY KEY (id)
);