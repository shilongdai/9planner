package net.viperfish.planner.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Course not found")
public class CourseArchtypeNotFoundException extends RuntimeException {

}
