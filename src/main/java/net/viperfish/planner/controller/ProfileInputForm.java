package net.viperfish.planner.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ProfileInputForm {

    private int targetCredit;
    private List<Long> archtypeIds;

    public ProfileInputForm() {
        this.targetCredit = 0;
        archtypeIds = new ArrayList<>();
    }

    public int getTargetCredit() {
        return targetCredit;
    }

    public void setTargetCredit(int targetCredit) {
        this.targetCredit = targetCredit;
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
        return targetCredit == that.targetCredit &&
                Objects.equals(archtypeIds, that.archtypeIds);
    }

    @Override
    public int hashCode() {
        return Objects.hash(targetCredit, archtypeIds);
    }
}
