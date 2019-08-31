package net.viperfish.planner.core;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class Metric {

    private double scale;
    private Map<String, Object> details;


    public Metric(double scale) {
        this.scale = scale;
        this.details = new HashMap<>();
    }

    public double getScale() {
        return scale;
    }

    public Map<String, Object> getDetails() {
        return new HashMap<>(details);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Metric metric = (Metric) o;
        return Double.compare(metric.scale, scale) == 0 &&
                Objects.equals(details, metric.details);
    }

    @Override
    public int hashCode() {
        return Objects.hash(scale, details);
    }
}
