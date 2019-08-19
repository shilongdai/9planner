package net.viperfish.planner.core;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "CourseArchtype")
public class CourseArchtype implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Basic
    @Column(name = "Subject")
    private String subject;
    @Basic
    @Column(name = "Course_number")
    private String courseNumber;
    @Basic
    @Column(name = "Units")
    private int units;
    @Basic
    @Column(name = "Title")
    private String title;

    @JsonIgnore
    @OneToMany(mappedBy = "archtype", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Course> courses;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getCourseNumber() {
        return courseNumber;
    }

    public void setCourseNumber(String courseNumber) {
        this.courseNumber = courseNumber;
    }

    public int getUnits() {
        return units;
    }

    public void setUnits(int units) {
        this.units = units;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<Course> getCourses() {
        return courses;
    }

    public void setCourses(List<Course> courses) {
        this.courses = courses;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CourseArchtype that = (CourseArchtype) o;
        return units == that.units &&
                Objects.equals(subject, that.subject) &&
                Objects.equals(courseNumber, that.courseNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(subject, courseNumber, units);
    }
}
