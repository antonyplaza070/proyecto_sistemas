-- =====================================================
-- archivo: modelo_fisico_demostrativo.sql
-- carpeta: database
-- propósito: modelo físico demostrativo (solo académico)
-- =====================================================

CREATE TABLE Jugador (
    id_jugador INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    categoria VARCHAR(50),
    estado_pago VARCHAR(20)
);

CREATE TABLE Pago (
    id_pago INT PRIMARY KEY AUTO_INCREMENT,
    id_jugador INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATE,
    estado VARCHAR(20),
    FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador)
);

CREATE TABLE Asistencia (
    id_asistencia INT PRIMARY KEY AUTO_INCREMENT,
    id_jugador INT NOT NULL,
    fecha_entrenamiento DATE,
    presente BOOLEAN,
    FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador)
);

CREATE TABLE Partido (
    id_partido INT PRIMARY KEY AUTO_INCREMENT,
    rival VARCHAR(100),
    fecha_partido DATE,
    lugar VARCHAR(150),
    resultado VARCHAR(50)
);

CREATE TABLE Anuncio (
    id_anuncio INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(150),
    descripcion TEXT,
    fecha_publicacion DATE
);

CREATE TABLE Voucher (
    id_voucher INT PRIMARY KEY AUTO_INCREMENT,
    id_jugador INT NOT NULL,
    archivo VARCHAR(255),
    fecha_envio DATE,
    estado VARCHAR(30),
    FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador)
);
