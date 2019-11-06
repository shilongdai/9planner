package net.viperfish.planner.core;

import java.io.Serializable;
import java.util.Objects;

public class TimeRange implements Serializable {

    private int startTime;
    private int endTime;

    public TimeRange() {
        this.startTime = 0;
        this.endTime = 0;
    }

    public TimeRange(int startTime, int endTime) {
        if (startTime > endTime) {
            throw new IllegalArgumentException("End time cannot be greater than start time");
        }

        this.startTime = startTime;
        this.endTime = endTime;
    }

    public int getStartTime() {
        return startTime;
    }

    public void setStartTime(int startTime) {
        if (startTime > endTime) {
            throw new IllegalArgumentException("End time cannot be greater than start time");
        }

        this.startTime = startTime;
    }

    public int getEndTime() {
        return endTime;
    }

    public void setEndTime(int endTime) {
        if (startTime > endTime) {
            throw new IllegalArgumentException("End time cannot be greater than start time");
        }

        this.endTime = endTime;
    }

    public boolean overlap(TimeRange other) {
        boolean thisAfterThat = startTime > other.endTime;
        boolean thisBeforeThat = endTime < other.startTime;
        return !thisAfterThat && !thisBeforeThat;
    }

    public boolean contains(TimeRange other) {
        return startTime <= other.startTime && endTime >= other.endTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TimeRange timeRange = (TimeRange) o;
        return startTime == timeRange.startTime &&
                endTime == timeRange.endTime;
    }

    @Override
    public int hashCode() {
        return Objects.hash(startTime, endTime);
    }
}
