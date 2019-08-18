package net.viperfish.planner.core;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class Profile {

    private int targetUnits;
    private Set<CourseArchtype> portfolio;

    public Profile() {
        this(17);
    }

    public Profile(int targetUnits) {
        this(targetUnits, new HashSet<>());
    }

    public Profile(int targetUnits, Set<CourseArchtype> portfolio) {
        this.targetUnits = targetUnits;
        this.portfolio = new HashSet<>(portfolio);
    }

    public int getTargetUnits() {
        return targetUnits;
    }

    public void setTargetUnits(int targetUnits) {
        this.targetUnits = targetUnits;
    }

    public Set<CourseArchtype> getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Set<CourseArchtype> portfolio) {
        this.portfolio = portfolio;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Profile profile = (Profile) o;
        return targetUnits == profile.targetUnits &&
                Objects.equals(portfolio, profile.portfolio);
    }

    @Override
    public int hashCode() {
        return Objects.hash(targetUnits, portfolio);
    }
}
