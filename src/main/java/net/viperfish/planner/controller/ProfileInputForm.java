package net.viperfish.planner.controller;

import net.viperfish.planner.core.Metric;

import java.util.*;

public class ProfileInputForm {

    private Map<String, Metric> metrics;
    private List<Long> archtypeIds;

    public ProfileInputForm() {
        this.metrics = new HashMap<>();
        archtypeIds = new ArrayList<>();
    }

    public Map<String, Metric> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, Metric> metrics) {
        this.metrics = metrics;
    }

    public List<Long> getArchtypeIds() {
        return archtypeIds;
    }

    public void setArchtypeIds(List<Long> archtypeIds) {
        this.archtypeIds = archtypeIds;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProfileInputForm that = (ProfileInputForm) o;
        return Objects.equals(metrics, that.metrics) &&
                Objects.equals(archtypeIds, that.archtypeIds);
    }

    @Override
    public int hashCode() {
        return Objects.hash(metrics, archtypeIds);
    }
}
