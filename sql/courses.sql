CREATE TABLE IF NOT EXISTS CourseArchtype
(
    Id            BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    Subject       VARCHAR(5)         NOT NULL,
    Course_number VARCHAR(10)        NOT NULL,
    Units         INTEGER            NOT NULL,
    Title         VARCHAR(120)       NOT NULL
);

CREATE TABLE IF NOT EXISTS Course
(
    Id          BIGINT PRIMARY KEY     NOT NULL,
    Archtype_id BIGINT                 NOT NULL,
    Section     VARCHAR(5)             NOT NULL,
    Type        ENUM ("MAIN", "ADDON") NOT NULL,
    Building    VARCHAR(50)            NOT NULL,
    Room        VARCHAR(10)            NOT NULL,
    Days        Integer                NOT NULL,
    Start_time  Integer                NOT NULL,
    End_time    Integer                NOT NULL,
    Instructor  VARCHAR(100)           NOT NULL,
    CONSTRAINT ARCHTYPE_COURSE FOREIGN KEY (Archtype_id) REFERENCES CourseArchtype (Id) ON DELETE CASCADE
);