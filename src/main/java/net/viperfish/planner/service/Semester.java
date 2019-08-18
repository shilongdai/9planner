package net.viperfish.planner.service;

import net.viperfish.ai.search.Action;
import net.viperfish.ai.search.State;
import net.viperfish.planner.core.CourseArchtype;

import java.util.Collection;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class Semester implements State {

    private Set<CourseArchtype> selection;
    private Set<CourseArchtype> options;

    public Semester(Collection<CourseArchtype> options, Collection<CourseArchtype> selection) {
        this.selection = new HashSet<>(selection);
        this.options = new HashSet<>(options);
    }

    public Semester swap(CourseArchtype fromSelection, CourseArchtype fromOptions) {
        if (!selection.contains(fromSelection) || !options.contains(fromOptions)) {
            return this;
        }
        Semester result = new Semester(this.options, this.selection);
        result.selection.remove(fromSelection);
        result.options.remove(fromOptions);
        result.selection.add(fromOptions);
        result.options.add(fromSelection);
        return result;
    }

    public Semester select(CourseArchtype fromOption) {
        if (!options.contains(fromOption)) {
            return this;
        }
        Semester result = new Semester(this.options, this.selection);
        result.options.remove(fromOption);
        result.selection.add(fromOption);
        return result;
    }

    public Semester deselect(CourseArchtype fromSelection) {
        if (!selection.contains(fromSelection)) {
            return this;
        }
        Semester result = new Semester(this.options, this.selection);
        result.selection.remove(fromSelection);
        result.options.add(fromSelection);
        return result;
    }

    public int getSelectedUnits() {
        int result = 0;
        for (CourseArchtype c : selection) {
            result += c.getUnits();
        }
        return result;
    }

    public Set<CourseArchtype> getSelection() {
        return new HashSet<>(selection);
    }

    @Override
    public Collection<? extends Action> availableActions() {
        Set<Action> result = new HashSet<>();
        for (CourseArchtype c : selection) {
            result.add(new DeselectClassAction(c));
        }
        for (CourseArchtype c : options) {
            result.add(new SelectClassAction(c));
        }

        for (CourseArchtype c : options) {
            for (CourseArchtype d : selection) {
                result.add(new SwapClassAction(d, c));
            }
        }
        return result;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Semester semester = (Semester) o;
        return Objects.equals(selection, semester.selection) &&
                Objects.equals(options, semester.options);
    }

    @Override
    public int hashCode() {
        return Objects.hash(selection, options);
    }
}
