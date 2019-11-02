package net.viperfish.planner.core;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.io.Serializable;
import java.time.DayOfWeek;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "Course")
public class Course implements Serializable {

    @Id
    private Long id;

    @Basic
    @Column(name = "Section")
    private String section;

    @Enumerated(EnumType.STRING)
    @Column(name = "Type")
    private CourseType type;

    @Basic
    @Column(name = "Building")
    private String building;

    @Basic
    @Column(name = "Room")
    private String room;

    @Basic
    @Column(name = "Days")
    @JsonIgnore
    private int days;

    @Basic
    @Column(name = "Start_time")
    private int startTime;

    @Basic
    @Column(name = "End_time")
    private int endTime;

    @Basic
    @Column(name = "Instructor")
    private String instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Archtype_id")
    private CourseArchtype archtype;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public CourseType getType() {
        return type;
    }

    public void setType(CourseType type) {
        this.type = type;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public int getDays() {
        return days;
    }

    public void setDays(int days) {
        this.days = days;
    }

    public int getStartTime() {
        return startTime;
    }

    public void setStartTime(int startTime) {
        this.startTime = startTime;
    }

    public int getEndTime() {
        return endTime;
    }

    public void setEndTime(int endTime) {
        this.endTime = endTime;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public CourseArchtype getArchtype() {
        return archtype;
    }

    public void setArchtype(CourseArchtype archtype) {
        this.archtype = archtype;
    }

    public Set<DayOfWeek> getDayOfWeek() {
        int mondayBit = days & 0b00000001;
        int tuesdayBit = days & 0b00000010;
        int wednesdayBit = days & 0b00000100;
        int thursdayBit = days & 0b00001000;
        int fridayBit = days & 0b00010000;

        Set<DayOfWeek> result = new HashSet<>();
        if (mondayBit != 0) {
            result.add(DayOfWeek.MONDAY);
        }
        if (tuesdayBit != 0) {
            result.add(DayOfWeek.TUESDAY);
        }
        if (wednesdayBit != 0) {
            result.add(DayOfWeek.WEDNESDAY);
        }
        if (thursdayBit != 0) {
            result.add(DayOfWeek.THURSDAY);
        }
        if (fridayBit != 0) {
            result.add(DayOfWeek.FRIDAY);
        }
        return EnumSet.copyOf(result);
    }

    public TimeRange getTimeRange() {
        return new TimeRange(startTime, endTime);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Course course = (Course) o;
        return days == course.days &&
                startTime == course.startTime &&
                endTime == course.endTime &&
                Objects.equals(section, course.section) &&
                type == course.type &&
                Objects.equals(building, course.building) &&
                Objects.equals(room, course.room) &&
                Objects.equals(instructor, course.instructor) &&
                Objects.equals(archtype, course.archtype);
    }

    @Override
    public int hashCode() {
        return Objects.hash(section, type, building, room, days, startTime, endTime, instructor, archtype);
    }
}
