package net.viperfish.planner.core;

import java.util.*;

public class Profile {

    private Map<String, Metric> metrics;
    private Set<CourseArchtype> portfolio;
    private Set<Course> blacklist;

    public Profile(Map<String, Metric> metrics, Set<CourseArchtype> portfolio, Set<Course> blacklist) {
        this.metrics = new HashMap<>(metrics);
        this.portfolio = new HashSet<>(portfolio);
        this.blacklist = new HashSet<>(blacklist);
    }

    public Map<String, Metric> getMetrics() {
        return new HashMap<>(metrics);
    }

    public Set<CourseArchtype> getPortfolio() {
        return new HashSet<>(portfolio);
    }

    public Set<Course> getBlacklist() {
        return new HashSet<>(blacklist);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Profile profile = (Profile) o;
        return Objects.equals(metrics, profile.metrics) &&
                Objects.equals(portfolio, profile.portfolio) &&
                Objects.equals(blacklist, profile.blacklist);
    }

    @Override
    public int hashCode() {
        return Objects.hash(metrics, portfolio, blacklist);
    }
}
